import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction, when } from "mobx";
import { RootStore, useStores } from "@stores";
import BN from "@src/utils/BN";
import {
  CONTRACT_ADDRESSES,
  EXPLORER_URL,
  IToken,
  NODE_URL,
  TOKENS_BY_ASSET_ID,
} from "@src/constants";
import nodeService from "@src/services/nodeService";
import { ITransaction } from "@src/utils/types";
import { assetBalance } from "@waves/waves-transactions/dist/nodeInteraction";
import makeNodeRequest from "@src/utils/makeNodeRequest";

const ctx = React.createContext<InvestToPoolInterfaceVM | null>(null);

type IReward = {
  value: BN;
  usdEquivalent: BN;
};

export const InvestToPoolInterfaceVMProvider: React.FC<{
  poolDomain: string;
}> = ({ poolDomain, children }) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new InvestToPoolInterfaceVM(rootStore, poolDomain),
    [rootStore, poolDomain]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useInvestToPoolInterfaceVM = () => useVM(ctx);

class InvestToPoolInterfaceVM {
  public poolDomain: string;
  public rootStore: RootStore;

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  loadingHistory: boolean = false;
  private _setLoadingHistory = (l: boolean) => (this.loadingHistory = l);

  public indexTokenId: string | null = null;
  private setIndexTokenId = (value: string) => (this.indexTokenId = value);

  public indexTokenBalance: BN = BN.ZERO;
  private setIndexBalance = (value: BN) => (this.indexTokenBalance = value);

  public totalRewardToClaim: BN | null = null;
  private setTotalRewardToClaim = (value: BN) =>
    (this.totalRewardToClaim = value);

  public totalClaimedReward: BN | null = null;
  private setTotalClaimedReward = (value: BN) =>
    (this.totalClaimedReward = value);

  public lastClaimDate: BN = BN.ZERO;
  private _setLastClaimDate = (v: BN) => (this.lastClaimDate = v);

  public globalIndexStaked: BN = BN.ZERO;
  private _setGlobalIndexStaked = (v: BN) => (this.globalIndexStaked = v);

  public poolAssetBalances: { assetId: string; balance: BN }[] = [];
  private setPoolAssetBalances = (value: { assetId: string; balance: BN }[]) =>
    (this.poolAssetBalances = value);

  public transactionsHistory: ITransaction[] | null = null;
  private setTransactionsHistory = (value: any[]) =>
    (this.transactionsHistory = value);

  public userIndexStaked: BN | null = null;
  private setUserIndexStaked = (value: BN) => (this.userIndexStaked = value);

  nftPaymentName: string = "";
  setNFTPaymentName = (v: string) => (this.nftPaymentName = v);

  public get pool() {
    return this.rootStore.poolsStore.getPoolByDomain(this.poolDomain)!;
  }

  constructor(rootStore: RootStore, poolDomain: string) {
    this.poolDomain = poolDomain;
    this.rootStore = rootStore;
    makeAutoObservable(this);
    when(() => this.pool?.isCustom === true, this.loadNFTPaymentInfo);
    when(
      () => this.pool != null,
      async () => {
        await Promise.all([
          this.updatePoolTokenBalances(),
          this.getAddressActivityInfo(),
          this.loadTransactionsHistory(),
          this.updateRewardInfo(),
          // this.calcRewards(),
          this.syncIndexTokenInfo(),
        ]);
      }
    );
    reaction(
      () => this.rootStore.accountStore?.address,
      () => {
        this.pool != null && this.getAddressActivityInfo();
        // this.pool != null && this.calcRewards();
        this.pool != null && this.updateRewardInfo();
        this.pool != null && this.updatePoolTokenBalances();
      }
    );
  }

  updateRewardInfo = async () => {
    const rawData = await Promise.all(
      this.pool.tokens.map(this.getTokenRewardInfo)
    );
    const totalRewardAmount = rawData.reduce(
      (acc, value) =>
        acc.plus(value.usdEquivalent.isNaN() ? BN.ZERO : value.usdEquivalent),
      BN.ZERO
    );
    this.setTotalRewardToClaim(totalRewardAmount);
  };

  //todo delete it
  getTokenRewardInfo = async (
    token: IToken
  ): Promise<IReward & { assetId: string }> => {
    const { accountStore } = this.rootStore;
    const { address } = accountStore;
    const assetBalance = this.poolAssetBalances.find(
      ({ assetId }) => assetId === token.assetId
    );
    const realBalance = assetBalance?.balance ?? BN.ZERO;

    const keysArray = {
      globalTokenBalance: `global_${token.assetId}_balance`,
      globalLastCheckTokenEarnings: `global_lastCheck_${token.assetId}_earnings`,
      globalIndexStaked: "global_indexStaked",
      globalLastCheckTokenInterest: `global_lastCheck_${token.assetId}_interest`,
      userLastCheckTokenInterest: `${address}_lastCheck_${token.assetId}_interest`,
      userIndexStaked: `${address}_indexStaked`,
      claimedReward: `${address}_claimedRewardValue`,
      lastClaimDate: `${address}_lastClaim`,
    };
    const response = await this.pool.contractKeysRequest(
      Object.values(keysArray)
    );

    const parsedNodeResponse = [...(response ?? [])].reduce<Record<string, BN>>(
      (acc, { key, value }) => {
        Object.entries(keysArray).forEach(([regName, regValue]) => {
          const regexp = new RegExp(regValue);
          if (regexp.test(key)) {
            acc[regName] = new BN(value);
          }
        });
        return acc;
      },
      {}
    );

    const globalTokenBalance = parsedNodeResponse["globalTokenBalance"];
    const globalLastCheckTokenEarnings =
      parsedNodeResponse["globalLastCheckTokenEarnings"];
    const globalIndexStaked =
      parsedNodeResponse["globalIndexStaked"] ?? BN.ZERO;
    const globalLastCheckTokenInterest =
      parsedNodeResponse["globalLastCheckTokenInterest"];
    const userLastCheckTokenInterest =
      parsedNodeResponse["userLastCheckTokenInterest"];
    const userIndexStaked = parsedNodeResponse["userIndexStaked"];
    const claimedReward = parsedNodeResponse["claimedReward"];
    const lastClaimDate = parsedNodeResponse["lastClaimDate"];

    this.setTotalClaimedReward(claimedReward ?? BN.ZERO);
    this.setUserIndexStaked(userIndexStaked);
    lastClaimDate && this._setLastClaimDate(lastClaimDate);

    const newEarnings = BN.max(
      realBalance.minus(globalTokenBalance),
      globalLastCheckTokenEarnings
    ).minus(globalLastCheckTokenEarnings);

    const lastCheckInterest =
      globalLastCheckTokenInterest == null || globalIndexStaked.eq(0)
        ? BN.ZERO
        : globalLastCheckTokenInterest;

    const currentInterest = lastCheckInterest.plus(
      newEarnings.div(globalIndexStaked)
    );

    const lastCheckUserInterest = userLastCheckTokenInterest
      ? userLastCheckTokenInterest
      : BN.ZERO;

    const rewardAvailable = currentInterest
      .minus(lastCheckUserInterest)
      .times(BN.formatUnits(userIndexStaked, 8));

    const rate =
      this.rootStore.poolsStore.usdnRate(token.assetId, 1) ?? BN.ZERO;

    const usdEquivalent = rewardAvailable.times(rate);

    return {
      value: rewardAvailable.isNaN()
        ? BN.ZERO
        : BN.formatUnits(rewardAvailable, token.decimals),
      assetId: token.assetId,
      usdEquivalent: BN.formatUnits(usdEquivalent, token.decimals),
    };
  };

  syncIndexTokenInfo = async () => {
    const { address } = this.rootStore.accountStore;
    const indexTokenIdResponse = await this.pool.contractKeysRequest(
      "static_poolToken_idStr"
    );
    if (address == null) return;
    if (indexTokenIdResponse != null && indexTokenIdResponse.length === 1) {
      const indexTokenId = indexTokenIdResponse[0].value.toString();
      this.setIndexTokenId(indexTokenId);
      const balance = await assetBalance(indexTokenId, address, NODE_URL);
      this.setIndexBalance(new BN(balance ?? 0));
    }
  };
  getAddressActivityInfo = async () => {
    const { address } = this.rootStore.accountStore;
    if (address == null) return;
    const keysArray = {
      globalIndexStaked: "global_indexStaked",
      userIndexStaked: `${address}_indexStaked`,
      claimedReward: `${address}_claimedRewardValue`,
      lastClaimDate: `${address}_lastClaim`,
    };
    const response = await this.pool.contractKeysRequest(
      Object.values(keysArray)
    );

    const parsedNodeResponse = [...(response ?? [])].reduce<Record<string, BN>>(
      (acc, { key, value }) => {
        Object.entries(keysArray).forEach(([regName, regValue]) => {
          const regexp = new RegExp(regValue);
          if (regexp.test(key)) {
            acc[regName] = new BN(value);
          }
        });
        return acc;
      },
      {}
    );

    const claimedReward = parsedNodeResponse["claimedReward"];
    const lastClaimDate = parsedNodeResponse["lastClaimDate"];
    const userIndexStaked = parsedNodeResponse["userIndexStaked"];
    const globalIndexStaked = parsedNodeResponse["globalIndexStaked"];
    lastClaimDate && this._setLastClaimDate(lastClaimDate);
    this.setTotalClaimedReward(claimedReward ?? BN.ZERO);
    this.setUserIndexStaked(userIndexStaked);
    this._setGlobalIndexStaked(globalIndexStaked);
  };

  calcRewards = async () => {
    const { address } = this.rootStore.accountStore;
    if (address == null || this.pool?.contractAddress == null) return;
    const data = await nodeService.evaluate(
      CONTRACT_ADDRESSES.calcReward,
      `calcRewardToClaim(false, "${this.pool?.contractAddress}", "${address}")`
    );
    const tokensStr = data.result.value["_2"].value;
    const tokens = tokensStr
      .toString()
      .split("|")
      .filter((v) => v !== "");
    const totalRewardInDoll = tokens.reduce((acc, v) => {
      const details = v.split(",");
      const assetId = details[0];
      const amount = details[1];
      if (new BN(amount).lt(0)) {
        return acc.plus(0);
      }
      const dollEquivalent = this.rootStore.poolsStore
        .usdnRate(assetId)
        ?.times(BN.formatUnits(amount, TOKENS_BY_ASSET_ID[assetId].decimals));
      return acc.plus(dollEquivalent ?? 0);
    }, BN.ZERO);
    this.setTotalRewardToClaim(totalRewardInDoll);
  };

  get poolCompositionValues() {
    if (this.pool.tokens == null) return [];
    return this.pool.tokens.reduce<any[]>((acc, token) => {
      const balance = BN.formatUnits(
        this.pool.liquidity[token.assetId] ?? BN.ZERO,
        token.decimals
      );
      const rate = this.rootStore.poolsStore.usdnRate(token.assetId);
      return [
        ...acc,
        {
          ...token,
          share: token.share,
          value: balance.times(rate ?? 0),
          parsedBalance: balance,
        },
      ];
    }, []);
  }

  get totalProvidedLiquidityByAddress() {
    if (
      this.rootStore.accountStore.address == null ||
      this.userIndexStaked == null
    )
      return BN.ZERO;
    const liquidityInUsdn = this.pool.globalLiquidity
      .times(this.userIndexStaked)
      .div(this.globalIndexStaked);
    return liquidityInUsdn.isNaN() ? BN.ZERO : liquidityInUsdn;
  }

  get shareOfPool() {
    if (this.rootStore.accountStore.address == null) return BN.ZERO;

    const percent = this.totalProvidedLiquidityByAddress
      .times(new BN(100))
      .div(this.pool.globalLiquidity);
    return percent;
  }

  get poolBalancesTable() {
    if (this.pool.tokens == null) return null;
    return this.pool?.tokens.map((token) => {
      if (this.userIndexStaked == null || this.userIndexStaked?.eq(0)) {
        return { ...token, usdnEquivalent: BN.ZERO, value: BN.ZERO };
      }
      const top =
        this.pool.liquidity[token.assetId]?.times(
          this.userIndexStaked ?? BN.ZERO
        ) ?? BN.ZERO;
      const tokenAmountToGet = top.div(this.pool.globalPoolTokenAmount);
      const parserAmount = BN.formatUnits(tokenAmountToGet, token.decimals);
      const rate =
        this.rootStore.poolsStore.usdnRate(token.assetId, 1) ?? BN.ZERO;
      const usdnEquivalent = BN.formatUnits(
        tokenAmountToGet.times(rate),
        token.decimals
      );
      return { ...token, usdnEquivalent: usdnEquivalent, value: parserAmount };
    });
  }

  claimRewards = async () => {
    if (this.totalRewardToClaim == null || this.totalRewardToClaim.eq(0))
      return;
    if (this.pool.layer2Address == null) return;
    this._setLoading(true);
    const { accountStore, notificationStore } = this.rootStore;
    accountStore
      .invoke({
        dApp: this.pool.contractAddress,
        payment: [],
        call: {
          function: "claimIndexRewards",
          args: [],
        },
      })
      .then((txId) => {
        notificationStore.notify(`Your rewards was claimed`, {
          type: "success",
          title: `Success`,
          link: `${EXPLORER_URL}/tx/${txId}`,
          linkTitle: "View on Explorer",
        });
      })
      .catch((e) => {
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Transaction is not completed",
        });
      })
      // .then(this.calcRewards)
      .then(this.updateRewardInfo)
      .finally(() => this._setLoading(false));
  };

  get canClaimRewards() {
    return !(
      this.totalRewardToClaim == null ||
      this.totalRewardToClaim.eq(0) ||
      this.loading
    );
  }

  updatePoolTokenBalances = async () => {
    const { pool } = this;
    const { data }: { data: TContractAssetBalancesResponse } =
      await makeNodeRequest(`/assets/balance/${pool.contractAddress}`);
    const value = data.balances.map((token) => {
      return { assetId: token.assetId, balance: new BN(token.balance) };
    });
    this.setPoolAssetBalances(value);
  };

  loadNFTPaymentInfo = async () => {
    const { isCustom, artefactOriginTransactionId } = this.pool;
    if (isCustom == null || !isCustom || artefactOriginTransactionId == null)
      return;
    const data = await nodeService.transactionInfo(artefactOriginTransactionId);
    this.setNFTPaymentName(
      data?.stateChanges.invokes[0].call.args[0].value.toString() ?? ""
    );
  };

  loadTransactionsHistory = async () => {
    const v = await nodeService.transactions(this.pool.contractAddress);
    v && this.setTransactionsHistory(v);
  };

  loadMoreHistory = async () => {
    this._setLoadingHistory(true);
    const { pool, transactionsHistory } = this;
    if (transactionsHistory == null) return;
    const after = transactionsHistory.slice(-1).pop();
    if (after == null) return;
    const v = await nodeService.transactions(
      pool.contractAddress,
      10,
      after.id
    );
    this._setLoadingHistory(false);
    v && this.setTransactionsHistory([...transactionsHistory, ...v]);
  };

  unstakeIndex = async () => {
    if (this.userIndexStaked == null || this.userIndexStaked?.eq(0)) return;
    if (this.pool.layer2Address == null) return;
    this._setLoading(true);
    const { accountStore, notificationStore } = this.rootStore;
    accountStore
      .invoke({
        dApp: this.pool.contractAddress,
        payment: [],
        call: {
          function: "unstakeIndex",
          args: [
            {
              type: "integer",
              value: this.userIndexStaked?.toString(),
            },
          ],
        },
      })
      .then((txId) => {
        notificationStore.notify(`Your have unstaked index tokem`, {
          type: "success",
          title: `Success`,
          link: `${EXPLORER_URL}/tx/${txId}`,
          linkTitle: "View on Explorer",
        });
      })
      .catch((e) => {
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Transaction is not completed",
        });
      })
      // .then(this.calcRewards)
      .then(this.updateRewardInfo)
      .finally(() => this._setLoading(false));
  };

  get canStakeIndex() {
    return !this.indexTokenBalance.eq(0);
  }

  stakeIndex = async () => {
    if (!this.canStakeIndex) return;
    this._setLoading(true);
    const { accountStore, notificationStore } = this.rootStore;
    if (this.indexTokenId == null) return;
    accountStore
      .invoke({
        dApp: this.pool.contractAddress,
        payment: [
          {
            assetId: this.indexTokenId,
            amount: this.indexTokenBalance.toString(),
          },
        ],
        call: {
          function: "stakeIndex",
          args: [],
        },
      })
      .then(this.syncIndexTokenInfo)
      // .then(this.calcRewards)
      .then(this.updateRewardInfo)
      .then(this.updatePoolTokenBalances)
      .then((txId) => {
        notificationStore.notify(`Your have staked index token`, {
          type: "success",
          title: `Success`,
          link: `${EXPLORER_URL}/tx/${txId}`,
          linkTitle: "View on Explorer",
        });
      })
      .catch((e) => {
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Transaction is not completed",
        });
      })
      .finally(() => this._setLoading(false));
  };

  prepareCompletePoolInitialization = () => {
    const assets = this.pool.tokens.map((t) => ({
      assetId: t.assetId,
      share: new BN(t.share),
    }));
    const state = {
      assets,
      logo: this.pool.logo,
      title: this.pool.title,
      domain: this.pool.domain,
      step: 3,
      fileName: "–",
      fileSize: "–",
      maxStep: 3,
      swapFee: this.pool.swapFee,
    };
    localStorage.setItem("puzzle-custom-pool", JSON.stringify(state));
  };
}

type TContractAssetBalancesResponse = {
  address: string;
  balances: IPoolTokenBalance[];
};
type IPoolTokenBalance = {
  assetId: string;
  balance: number;
  issueTransaction: null | any;
  minSponsoredAssetFee: number;
  quantity: number;
  reissuable: boolean;
  sponsorBalance: number;
};
