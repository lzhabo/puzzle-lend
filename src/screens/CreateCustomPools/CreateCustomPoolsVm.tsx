import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, when } from "mobx";
import { RootStore, useStores } from "@stores";
import {
  CONTRACT_ADDRESSES,
  IToken,
  PUZZLE_NFTS,
  TOKENS_BY_ASSET_ID,
  TOKENS_BY_SYMBOL,
  TOKENS_LIST,
} from "@src/constants";
import BN from "@src/utils/BN";
import {
  buildDialogParams,
  buildErrorDialogParams,
  buildSuccessNFTSaleDialogParams,
  IDialogNotificationProps,
} from "@components/Dialog/DialogNotification";
import nodeService from "@src/services/nodeService";
import poolsService from "@src/services/poolsService";
import Balance from "@src/entities/Balance";
import { toFile } from "@src/utils/files";
import bucketService from "@src/services/bucketService";
import loadCreatePoolStateFromStorage from "@screens/CreateCustomPools/utils/loadCreatePoolStateFromStorage";
import checkDomainPaid from "@screens/CreateCustomPools/utils/checkDomainPaid";
import Button from "@components/Button";
import getDomainPaymentArtefactId from "@src/utils/getDomainPaymentArtefactId";

const ctx = React.createContext<CreateCustomPoolsVm | null>(null);

export const CreateCustomPoolsVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new CreateCustomPoolsVm(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useCreateCustomPoolsVM = () => useVM(ctx);

export interface IPaymentsArtefact {
  assetId: string;
  name?: string;
  picture?: string;
}

interface IPoolToken {
  asset: IToken;
  share: BN;
  locked: boolean;
}

interface IInitData {
  assets: { share: number; assetId: string; locked: boolean }[];
  share: BN;
  locked: boolean;
  logo: string | null;
  title: string;
  domain: string;
  maxStep: number | null;
  step: number | null;
  fileName: string | null;
  fileSize: string | null;
  swapFee: number;
}

class CreateCustomPoolsVm {
  public rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    setInterval(this.saveSettings, 1000);
    const initData = loadCreatePoolStateFromStorage();
    this.initialize(initData);
    when(() => initData?.maxStep === 2, this.checkIfAlreadyCreated);
  }

  initialize = (initData: IInitData | null) => {
    if (initData != null) {
      if (initData.assets != null) {
        this.poolsAssets = initData.assets?.map(
          ({ assetId, share, locked }) => ({
            share: new BN(share).times(10),
            locked,
            asset: TOKENS_BY_ASSET_ID[assetId],
          })
        );
      }
    } else {
      this.setDefaultPoolsAssets();
    }
    this.logo = initData?.logo ?? null;
    this.swapFee =
      initData?.swapFee != null && !isNaN(initData?.swapFee)
        ? new BN(initData?.swapFee).times(10)
        : new BN(20);
    this.fileName = initData?.fileName ?? null;
    this.title = initData?.title ?? "";
    this.step = initData?.step ?? 0;
    this.maxStep = initData?.maxStep ?? 0;
    this.domain = initData?.domain ?? "";
    this.fileSize = initData?.fileSize ?? null;
    this.saveSettings();
  };

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  reset = () => {
    this.initialize(null);
    this.saveSettings();
    window.location.reload();
  };

  maxStep: number = 0;
  step: number = 0;
  setStep = (s: number, jump = false) => {
    if (!jump) {
      this.maxStep = s;
    }
    this.step = s;
  };

  get isThereUsdnOrPuzzle() {
    return (
      this.poolsAssets.filter(({ asset }) =>
        ["USDN", "PUZZLE"].includes(asset.symbol)
      ).length > 0
    );
  }

  get requiredTokensCorrectShare() {
    return this.poolsAssets
      .filter(({ asset }) => ["USDN", "PUZZLE"].includes(asset.symbol))
      .some(({ share }) => share.gte(20));
  }

  get correct0() {
    return (
      this.poolsAssets.length > 1 &&
      this.totalTakenShare.eq(1000) &&
      this.requiredTokensCorrectShare &&
      this.isThereUsdnOrPuzzle
    );
  }

  get correct1() {
    return (
      this.domain.length > 1 &&
      this.domain.length < 14 &&
      this.logo &&
      !/[^a-z0-9_-]/.test(this.domain) &&
      !this.poolSettingError
    );
  }

  get correct2() {
    if (this.isDomainPaid) return true;
    else {
      return this.artefactToSpend != null;
    }
  }

  get correct3() {
    return !this.providedPercentOfPool.eq(0) && !this.maxToProvide.eq(0);
  }

  get minStep() {
    if (this.rootStore.accountStore.address == null) return 0;
    const step = [
      this.correct0,
      this.correct1,
      this.correct2,
      this.correct3,
    ].indexOf(false);
    return step === -1 ? this.step : step;
  }

  poolsAssets: IPoolToken[] = [];
  setDefaultPoolsAssets = () => {
    this.poolsAssets = [
      {
        asset: TOKENS_BY_SYMBOL.PUZZLE,
        share: new BN(500),
        locked: false,
      },
      {
        asset: TOKENS_BY_SYMBOL.USDN,
        share: new BN(500),
        locked: false,
      },
    ];
  };

  get totalTakenShare(): BN {
    return this.poolsAssets.reduce((acc, v) => acc.plus(v.share), BN.ZERO);
  }

  checkIfAlreadyCreated = async () => {
    const res = await poolsService.getPoolByDomain(this.domain);
    if (res.domain === this.domain) this.setStep(3);
  };

  syncShares = () => {
    const unlockedPercent = this.poolsAssets.reduce(
      (acc, v) => (v.locked ? acc.minus(v.share) : acc),
      new BN(1000)
    );
    const unlockedCount = this.poolsAssets.reduce(
      (acc, v) => (!v.locked ? acc + 1 : acc),
      0
    );
    const averageUnlockedPercent = unlockedPercent.div(unlockedCount).div(10);
    this.poolsAssets.forEach((v, i) => {
      if (v.locked) return;
      const percent = Math.round(averageUnlockedPercent.toNumber() * 2) / 2;
      this.poolsAssets[i].share = new BN(percent).times(10);
    });
  };

  addAssetToPool = (assetId: string) => {
    const balances = this.tokensToAdd;
    const asset = balances?.find((b) => b.assetId === assetId);
    if (asset == null) return;
    this.poolsAssets.push({ asset: asset, share: BN.ZERO, locked: false });
    this.syncShares();
    if (this.maxToProvide.eq(0)) {
      this.rootStore.notificationStore.notify(
        "Change the assets you don’t have enough in wallet, or reset the whole composition.",
        {
          title: "Your max to provide is too low for this pool composition",
          type: "error",
          onClickText: "Reset the composition",
          onClick: () => this.setDefaultPoolsAssets(),
        }
      );
    }
  };

  removeAssetFromPool = (assetId: string) => {
    const indexOfObject = this.poolsAssets.findIndex(
      ({ asset }) => asset.assetId === assetId
    );
    this.poolsAssets.splice(indexOfObject, 1);
    this.syncShares();
  };
  changeAssetShareInPool = (assetId: string, share: BN) => {
    if (share.gt(1000)) share = new BN(1000);
    const indexOfObject = this.poolsAssets.findIndex(
      ({ asset }) => asset.assetId === assetId
    );
    this.poolsAssets[indexOfObject].share = share;
  };
  changeAssetInShareInPool = (oldAssetId: string, newAssetId: string) => {
    const indexOfObject = this.poolsAssets.findIndex(
      ({ asset }) => asset.assetId === oldAssetId
    );
    const asset = this.tokensToAdd?.find((b) => b.assetId === newAssetId);
    if (asset == null) return;
    this.poolsAssets[indexOfObject].asset = asset;
  };
  updateLockedState = (assetId: string, val: boolean) => {
    const indexOfObject = this.poolsAssets.findIndex(
      ({ asset }) => asset.assetId === assetId
    );
    this.poolsAssets[indexOfObject].locked = val;
  };

  isDomainPaid = false;
  setDomainPaid = (v: boolean) => (this.isDomainPaid = v);

  checkIfDomainIsPaidWithCurrentUser = async () => {
    const { address } = this.rootStore.accountStore;
    if (address !== null) {
      checkDomainPaid(this.domain, address).then((v) => this.setDomainPaid(v));
    }
  };

  title: string = "";
  setTitle = (v: string) => (this.title = v);

  domain: string = "";
  setDomain = (v: string) => (this.domain = v);

  poolSettingError: boolean = false;
  setPoolSettingError = (v: boolean) => (this.poolSettingError = v);

  swapFee: BN = new BN(20);
  setSwapFee = (v: BN) => (this.swapFee = v);

  //logo details
  fileName: string | null = null;
  setFileName = (v: string | null) => (this.fileName = v);
  fileSize: string | null = null;
  setFileSize = (v: string | null) => (this.fileSize = v);
  logo: string | null = null;
  setLogo = (v: any) => (this.logo = v);

  public notificationParams: IDialogNotificationProps | null = null;
  public setNotificationParams = (params: IDialogNotificationProps | null) =>
    (this.notificationParams = params);

  get tokensToAdd() {
    const { accountStore } = this.rootStore;
    const balances = TOKENS_LIST.map((t) => {
      const balance = accountStore.findBalanceByAssetId(t.assetId);
      return balance ?? new Balance(t);
    }).sort((a, b) => {
      if (a.usdnEquivalent == null && b.usdnEquivalent == null) return 0;
      if (a.usdnEquivalent == null && b.usdnEquivalent != null) return 1;
      if (a.usdnEquivalent == null && b.usdnEquivalent == null) return -1;
      return a.usdnEquivalent!.lt(b.usdnEquivalent!) ? 1 : -1;
    });
    const currentTokens = this.poolsAssets.reduce<string[]>(
      (acc, v) => [...acc, v.asset.assetId],
      []
    );
    return balances.filter((b) => !currentTokens.includes(b.assetId));
  }

  artefactToSpend: IPaymentsArtefact | null = null;
  setArtefactToSpend = (v: IPaymentsArtefact | null) =>
    (this.artefactToSpend = v);

  get isThereArtefacts() {
    const { nftForPoolCreation } = this.rootStore.nftStore;
    return nftForPoolCreation?.length !== 0;
  }

  buyRandomArtefact = async () => {
    const { accountStore } = this.rootStore;
    if (!this.canBuyNft) return;
    if (this.puzzleNFTPrice == null) return;
    const amount = BN.parseUnits(
      this.puzzleNFTPrice,
      TOKENS_BY_SYMBOL.PUZZLE.decimals
    );
    this._setLoading(true);
    await accountStore
      .invoke({
        dApp: CONTRACT_ADDRESSES.createArtefacts,
        payment: [
          {
            assetId: TOKENS_BY_SYMBOL.PUZZLE.assetId,
            amount: amount.toString(),
          },
        ],
        call: { function: "generateArtefact", args: [] },
      })
      .then(async (txId) => {
        if (txId === null) return;
        const transDetails = await nodeService.transactionInfo(txId);
        if (transDetails == null) return;
        const nftId = transDetails.stateChanges.transfers[0].asset;
        const details = await nodeService.assetDetails(nftId);
        if (details == null) return;
        const picture = PUZZLE_NFTS.find(
          ({ name }) => name === details.name
        )?.image;
        this.setNotificationParams(
          buildSuccessNFTSaleDialogParams({
            name: details.name,
            picture: picture ?? "",
            onContinue: () => {
              this.setArtefactToSpend({
                name: details.name,
                assetId: nftId,
                picture: picture ?? "",
              });
              this.setNotificationParams(null);
            },
          })
        );
        await this.rootStore.nftStore.syncAccountNFTs();
      })
      .catch((e) => {
        console.error(e);
        this.setNotificationParams(
          buildErrorDialogParams({
            title: "Woops! Couldn't buy NFT",
            description: `Something went wrong while buying a NFT. Check if you have ${this.puzzleNFTPrice} PUZZLE and 0.005 WAVES (transaction fee) in your wallet to buy one.`,
            onTryAgain: () => this.buyRandomArtefact,
          })
        );
      })
      .finally(() => this._setLoading(false));
    this._setLoading(false);
  };

  get puzzleNFTPrice() {
    const { poolsStore, nftStore } = this.rootStore;
    const rate = poolsStore.usdnRate(TOKENS_BY_SYMBOL.PUZZLE.assetId, 1);
    if (nftStore.totalPuzzleNftsAmount == null || rate == null) return null;
    const amount = new BN(400).plus(nftStore.totalPuzzleNftsAmount).div(rate);
    return Math.ceil(amount.toNumber() + 1);
  }

  get canBuyNft() {
    const { accountStore, nftStore } = this.rootStore;
    if (nftStore.totalPuzzleNftsAmount == null) return false;
    const balance = accountStore.findBalanceByAssetId(
      TOKENS_BY_SYMBOL.PUZZLE.assetId
    );
    if (balance == null || this.puzzleNFTPrice == null) return false;
    return balance.balance?.gte(this.puzzleNFTPrice);
  }

  providedPercentOfPool: BN = new BN(100);
  setProvidedPercentOfPool = (value: number) =>
    (this.providedPercentOfPool = new BN(value));

  get totalAmountToAddLiquidity(): string | null {
    return BN.ZERO.toFormat();
  }

  saveSettings = () => {
    const assets = this.poolsAssets.map((t) => ({
      assetId: t.asset.assetId,
      locked: t.locked,
      share: t.share.div(10).toNumber(),
    }));
    const state = {
      assets,
      logo: this.logo,
      title: this.title,
      domain: this.domain,
      step: this.step,
      fileName: this.fileName,
      fileSize: this.fileSize,
      maxStep: this.maxStep,
      swapFee: this.swapFee.div(10).toNumber(),
    };
    localStorage.setItem("puzzle-custom-pool", JSON.stringify(state));
  };

  provideLiquidityToPool = async () => {
    const domain = this.domain;
    this.setNotificationParams(null);
    if (domain == null) {
      this.rootStore.notificationStore.notify(
        `There is no pool domain, try to refresh the page`,
        { type: "error" }
      );
      return;
    }
    this._setLoading(true);
    const pool = await poolsService.getPoolByDomain(domain);
    if (pool == null) {
      this.rootStore.notificationStore.notify(
        `Cannot find pool with domain ${domain}`,
        { type: "error" }
      );
      this._setLoading(false);
      return;
    }
    const accountStore = this.rootStore.accountStore;
    return accountStore
      .invoke({
        dApp: pool.contractAddress,
        payment: this.assetsForInitFunction,
        fee: 100500000,
        call: { function: "init", args: [] },
      })
      .then((txId) => console.log(txId))
      .then(() =>
        this.setNotificationParams(
          buildDialogParams({
            type: "success",
            title: `“${this.title}” has been created!`,
            description: `You can change the settings, and track your reward on the pool page `,
            buttons: [
              () => (
                <Button
                  key="Go to Pool page"
                  size="medium"
                  fixed
                  onClick={() => {
                    this.initialize(null);
                    localStorage.removeItem("puzzle-custom-pool");
                    window.open(`/pools/${domain}/invest`);
                  }}
                  kind="secondary"
                >
                  Go to Pool page
                </Button>
              ),
              () => (
                <Button
                  key="Back to Invest"
                  size="medium"
                  fixed
                  onClick={() => {
                    this.initialize(null);
                    localStorage.removeItem("puzzle-custom-pool");
                    window.open("/invest");
                  }}
                >
                  Back to Invest
                </Button>
              ),
            ],
          })
        )
      )
      .then(async () => {
        await poolsService.updateStats(this.domain);
        await this.rootStore.poolsStore.syncCustomPools();
        await this.rootStore.poolsStore.updatePoolsState();
      })
      .catch((e) => {
        this.setNotificationParams(
          buildErrorDialogParams({
            title: "Woops! Couldn't provide liquidity",
            description: e.message ?? e.toString(),
            onTryAgain: () => this.provideLiquidityToPool,
          })
        );
        console.log(e);
      })
      .finally(() => this._setLoading(false));
  };

  spendArtefact = async () => {
    const { artefactToSpend } = this;
    const { accountStore } = this.rootStore;
    if (artefactToSpend == null || accountStore.address == null) return;
    const domainPaid = await checkDomainPaid(this.domain, accountStore.address);
    if (!domainPaid) {
      await accountStore.invoke({
        dApp: CONTRACT_ADDRESSES.createArtefacts,
        payment: [{ assetId: artefactToSpend.assetId, amount: "1" }],
        call: {
          function: "spendArtefact",
          args: [{ type: "string", value: this.domain }],
        },
      });
    }
  };

  handleCreatePool = async () => {
    // //todo удалить когда откажемся от лимитов
    // const limited = await this.checkPoolsLimitOfTheDay();
    // if (limited) return;
    // //--------------------------------------------
    const { address } = this.rootStore.accountStore;
    if (address === null || this.logo == null) return;
    try {
      this._setLoading(true);
      const image = await bucketService.upload(toFile(this.logo));
      const artefactDetails = this.rootStore.nftStore.accountNFTs?.find(
        ({ assetId }) => assetId === this.artefactToSpend?.assetId
      );
      let artefactOriginTransactionId = artefactDetails?.originTransactionId;
      if (artefactOriginTransactionId == null) {
        const artefactId = await getDomainPaymentArtefactId(this.domain);
        if (artefactId == null) {
          const nftId = window.prompt(
            "Please enter asset id of artefact that you have paid for this domain." +
              " You can find it in wavesexplorer.com"
          );
          if (nftId == null) return;
          const burnedNftDetails = await nodeService.getAssetDetails(nftId);
          artefactOriginTransactionId = burnedNftDetails?.originTransactionId;
        } else {
          const details = await nodeService.getAssetDetails(artefactId);
          if (details?.originTransactionId != null) {
            artefactOriginTransactionId = details?.originTransactionId!;
          }
        }
      }
      if (artefactOriginTransactionId == null) {
        this.rootStore.notificationStore.notify(
          "Cannot find artefact origin txId. Try to reload the page",
          { type: "error" }
        );
        this._setLoading(false);
        return;
      }
      await this.spendArtefact();

      const assets = this.poolsAssets.map(({ asset, share }) => ({
        assetId: asset.assetId,
        share: share.div(10).toNumber(),
      }));

      await poolsService.createPool({
        domain: this.domain,
        swapFee: this.swapFee.times(10).toNumber(),
        image,
        owner: address,
        assets,
        title: this.title,
        artefactOriginTransactionId,
      });
      this.setStep(this.step + 1);
      this._setLoading(false);
    } catch (e: any) {
      this._setLoading(false);
      this.rootStore.notificationStore.notify(e.message ?? e.toString(), {
        type: "error",
        title: "Couldn't create pool",
      });
    }
  };

  get tokensToProvideInUsdnMap(): Record<string, BN> | null {
    const { poolsStore, accountStore } = this.rootStore;
    const { assetBalances, findBalanceByAssetId, address } = accountStore;
    if (assetBalances == null || address == null) return null;
    return this.poolsAssets.reduce<Record<string, BN>>(
      (acc, { asset, share }) => {
        const { assetId, decimals } = asset;
        const tokenBalance = findBalanceByAssetId(assetId);
        const rate = poolsStore.usdnRate(assetId) ?? BN.ZERO;
        if (tokenBalance?.balance == null) return acc;
        const balance = BN.formatUnits(tokenBalance.balance, decimals);
        const maxDollarValue = balance.times(rate).div(share.div(1000));
        return { ...acc, [assetId]: maxDollarValue };
      },
      {}
    );
  }

  get maxToProvide(): BN {
    if (this.tokensToProvideInUsdnMap == null) return BN.ZERO;
    if (!this.totalTakenShare.eq(1000)) return BN.ZERO;
    const arr = Object.entries(this.tokensToProvideInUsdnMap).map(
      ([a, maxDollarValue]) => ({
        assetId: a,
        dollarValue: maxDollarValue,
      })
    );
    const min = arr.sort((a, b) =>
      a.dollarValue!.gt(b.dollarValue!) ? 1 : -1
    )[0];
    const minAsset = this.poolsAssets.find(
      ({ asset }) => asset.assetId === min?.assetId
    );
    if (minAsset == null) return BN.ZERO;
    return min.dollarValue;
  }

  get assetsForInitFunction(): { assetId: string; amount: string }[] {
    if (this.tokensToProvideInUsdnMap == null) return [];
    const { poolsStore } = this.rootStore;

    return this.poolsAssets.map(({ asset, share }) => {
      const { assetId, decimals } = asset;
      const rate = poolsStore.usdnRate(assetId, 1) ?? BN.ZERO;
      const amountToProvide = this.maxToProvide
        .div(rate)
        .times(share.div(1000))
        .times(this.providedPercentOfPool.div(100));

      return {
        assetId,
        amount: BN.parseUnits(amountToProvide, decimals)
          .toSignificant(0)
          .toString(),
      };
    });
  }
}
