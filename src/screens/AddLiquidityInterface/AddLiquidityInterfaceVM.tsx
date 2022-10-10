import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { action, makeAutoObservable, when } from "mobx";
import { RootStore, useStores } from "@stores";
import BN from "@src/utils/BN";
import Balance from "@src/entities/Balance";
import {
  buildErrorDialogParams,
  buildSuccessLiquidityDialogParams,
  buildWarningLiquidityDialogParams,
  IDialogNotificationProps,
} from "@components/Dialog/DialogNotification";
import Pool from "@src/entities/Pool";

const ctx = React.createContext<AddLiquidityInterfaceVM | null>(null);

export const AddLiquidityInterfaceVMProvider: React.FC<{
  poolDomain: string;
}> = ({ poolDomain, children }) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new AddLiquidityInterfaceVM(rootStore, poolDomain),
    [rootStore, poolDomain]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useAddLiquidityInterfaceVM = () => useVM(ctx);

class AddLiquidityInterfaceVM {
  public poolDomain: string;
  public rootStore: RootStore;
  public baseTokenAmount: BN = BN.ZERO;
  @action.bound public setBaseTokenAmount = (value: BN) =>
    (this.baseTokenAmount = value);

  public changePoolModalOpen: boolean = false;
  setChangePoolModalOpen = (value: boolean) =>
    (this.changePoolModalOpen = value);

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  public notificationParams: IDialogNotificationProps | null = null;
  public setNotificationParams = (params: IDialogNotificationProps | null) =>
    (this.notificationParams = params);

  providedPercentOfPool: BN = new BN(50);
  @action.bound setProvidedPercentOfPool = (value: number) =>
    (this.providedPercentOfPool = new BN(value));

  private _pool: Pool | null = null;
  private _setPool = (pool: Pool) => (this._pool = pool);

  initialized: boolean = false;
  private setInitialized = (v: boolean) => (this.initialized = v);

  public get pool() {
    return this.rootStore.poolsStore.getPoolByDomain(this.poolDomain);
  }

  constructor(rootStore: RootStore, poolDomain: string) {
    this.poolDomain = poolDomain;
    this.rootStore = rootStore;
    when(
      () => this.rootStore.poolsStore.customPools.length > 0,
      () => {
        const pool = this.rootStore.poolsStore.customPools.find(
          ({ domain }) => domain === this.poolDomain
        );
        pool && this._setPool(pool);
        this.setInitialized(true);
      }
    );

    makeAutoObservable(this);
  }

  public get balances() {
    const { accountStore } = this.rootStore;
    return this.pool?.tokens
      .map((t) => {
        const balance = accountStore.findBalanceByAssetId(t.assetId);
        return balance ?? new Balance(t);
      })
      .sort((a, b) => {
        if (a.usdnEquivalent == null && b.usdnEquivalent == null) return 0;
        if (a.usdnEquivalent == null && b.usdnEquivalent != null) return 1;
        if (a.usdnEquivalent == null && b.usdnEquivalent == null) return -1;
        return a.usdnEquivalent!.lt(b.usdnEquivalent!) ? 1 : -1;
      });
  }

  public get baseToken() {
    return this.pool!.getAssetById(this.pool!.baseTokenId)!;
  }

  get minPIssued() {
    if (this.pool == null) return null;

    return BN.min(
      ...this.pool.tokens.map(({ assetId }) => {
        const asset = this.rootStore.accountStore.findBalanceByAssetId(assetId);
        return this.pool!.globalPoolTokenAmount.times(
          asset?.balance ?? BN.ZERO
        ).div(this.pool!.liquidity[assetId]);
      })
    );
  }

  get canMultipleDeposit() {
    return (
      this.tokensToDepositAmounts != null &&
      Object.values(this.tokensToDepositAmounts).every((v) => v.gt(0)) &&
      this.providedPercentOfPool.gt(0)
    );
  }

  get minBalanceAsset(): Balance | null {
    const { accountStore } = this.rootStore;
    if (this.pool == null || accountStore.assetBalances == null) return null;
    const balances = accountStore.assetBalances.filter((balance) =>
      this.pool!.tokens.some((t) => t.assetId === balance.assetId)
    );
    return balances.sort((a, b) =>
      a.usdnEquivalent!.gt(b.usdnEquivalent!) ? 1 : -1
    )[0];
  }

  get zeroAssetBalances(): number | null {
    const { accountStore } = this.rootStore;
    if (this.pool == null || accountStore.assetBalances == null) return null;
    const balances = accountStore.assetBalances.filter((balance) =>
      this.pool!.tokens.some((t) => t.assetId === balance.assetId)
    );
    return balances.filter(({ balance }) => balance && balance.eq(0)).length;
  }

  get tokensToDepositAmounts(): Record<string, BN> | null {
    if (this.pool == null) return null;

    return this.pool.tokens.reduce<Record<string, BN>>((acc, { assetId }) => {
      const tokenBalance =
        (this.pool && this.pool.liquidity[assetId]) ?? BN.ZERO;
      const dk = this.pool!.globalPoolTokenAmount.plus(
        this.minPIssued ?? BN.ZERO
      )
        .div(this.pool!.globalPoolTokenAmount)
        .minus(new BN(1))
        .times(tokenBalance)
        .times(this.providedPercentOfPool)
        .times(0.01);
      return {
        ...acc,
        [assetId]: dk,
      };
    }, {});
  }

  get baseTokenAmountUsdnEquivalent() {
    if (this.baseToken == null) return "";
    const rate =
      this.rootStore.poolsStore.usdnRate(this.baseToken.assetId, 1) ?? BN.ZERO;
    const value = rate.times(this.baseTokenAmount);
    return "~ " + BN.formatUnits(value, this.baseToken.decimals).toFixed(2);
  }

  get totalAmountToDeposit(): string | null {
    const tokensToDepositAmounts = this.tokensToDepositAmounts;
    if (tokensToDepositAmounts == null || this.pool == null) return null;
    const total = this.pool.tokens.reduce<BN>((acc, token) => {
      const rate =
        this.rootStore.poolsStore.usdnRate(token.assetId, 1) ?? BN.ZERO;
      const balance = tokensToDepositAmounts[token.assetId];
      const usdnEquivalent = BN.formatUnits(
        balance.times(rate),
        token.decimals
      );
      return acc.plus(usdnEquivalent);
    }, BN.ZERO);
    return !total.isNaN()
      ? "$ " + total.toFormat(total?.toNumber() > 0.001 ? 2 : 4)
      : null;
  }

  get baseTokenBalance() {
    return this.rootStore.accountStore.findBalanceByAssetId(
      this.baseToken.assetId
    );
  }

  get canDepositBaseToken(): boolean {
    const asset = this.baseTokenBalance;
    if (asset == null || asset.balance == null) return false;
    if (this.baseTokenAmount.eq(0)) return false;
    return asset.balance?.gt(0.0001) && !asset.balance.lt(this.baseTokenAmount);
  }

  @action.bound onMaxBaseTokenClick = () => {
    const userTokenBalance = this.baseTokenBalance;
    userTokenBalance &&
      userTokenBalance.balance &&
      this.setBaseTokenAmount(userTokenBalance.balance);
  };

  depositMultiply = async () => {
    const { accountStore } = this.rootStore;
    if (this.pool?.contractAddress == null) return;
    if (this.tokensToDepositAmounts == null || this.pool.layer2Address == null)
      return;
    this._setLoading(true);
    this.setNotificationParams(null);
    const payment = Object.entries(this.tokensToDepositAmounts).reduce(
      (acc, [assetId, value]) => [
        ...acc,
        { assetId, amount: value.toSignificant(0).toString() },
      ],
      [] as Array<{ assetId: string; amount: string }>
    );

    accountStore
      .invoke({
        dApp: this.pool.layer2Address,
        payment,
        call: {
          function: "generateIndexAndStake",
          args: this.pool.isCustom
            ? [{ type: "string", value: this.pool.contractAddress }]
            : [],
        },
      })
      .then((txId) => {
        txId &&
          this.setNotificationParams(
            buildSuccessLiquidityDialogParams({
              accountStore,
              poolDomain: this.poolDomain,
              txId: txId,
            })
          );
      })
      .catch((e) => {
        console.error(e);
        this.setNotificationParams(
          buildErrorDialogParams({
            title: "Transaction is not completed",
            description: e.message ?? JSON.stringify(e),
            onTryAgain: this.depositMultiply,
          })
        );
      })
      .then(() => accountStore.updateAccountAssets(true))
      .finally(() => this._setLoading(false));
  };

  showHighSlippageWarning = () => {
    const slippagePercent = this.baseTokenSlippage;
    const { baseToken, baseTokenAmount } = this;
    const slippage = BN.formatUnits(
      baseTokenAmount.times(slippagePercent),
      baseToken.decimals
    ).toFormat(2);
    const formatSlippagePercent = slippagePercent.times(100).toFormat(2);
    this.setNotificationParams(
      buildWarningLiquidityDialogParams({
        title: "High slippage rate",
        description: `You might lose up to ${slippage} ${baseToken.symbol} (${formatSlippagePercent} % of the total amount) on this operation due to slippage. We recommend to cancel this operation and use several transactions to split your deposit to smaller parts.`,
        onContinue: this.depositBaseToken,
        continueText: "Add liquidity",
        onCancel: () => this.setNotificationParams(null),
      })
    );
  };

  get baseTokenSlippage(): BN {
    const { pool, baseToken } = this;
    if (pool == null || pool.liquidity == null || baseToken == null)
      return BN.ZERO;
    const liquidity = pool.liquidity[this.baseToken.assetId];
    return new BN(1).minus(liquidity.div(liquidity.plus(this.baseTokenAmount)));
  }

  depositBaseToken = async () => {
    if (
      this.pool?.contractAddress == null ||
      this.pool.layer2Address == null ||
      !this.canDepositBaseToken
    ) {
      this.setNotificationParams(null);
      return;
    }
    const { accountStore } = this.rootStore;
    this._setLoading(true);
    this.setNotificationParams(null);
    return accountStore
      .invoke({
        dApp: this.pool.layer2Address,
        payment: [
          {
            assetId: this.baseToken.assetId,
            amount: this.baseTokenAmount.toString(),
          },
        ],
        call: {
          function: "generateIndexWithOneTokenAndStake",
          args: this.pool.isCustom
            ? [{ type: "string", value: this.pool.contractAddress }]
            : [],
        },
      })
      .then((txId) => {
        txId &&
          this.setNotificationParams(
            buildSuccessLiquidityDialogParams({
              accountStore,
              poolDomain: this.poolDomain,
              txId: txId ?? "",
            })
          );
      })
      .catch((e) => {
        this.setNotificationParams(
          buildErrorDialogParams({
            title: "Transaction is not completed",
            description: e.message + ` ${e.data}` ?? JSON.stringify(e),
            onTryAgain: this.depositBaseToken,
          })
        );
      })
      .then(() => accountStore.updateAccountAssets(true))
      .finally(() => this._setLoading(false));
  };
}
