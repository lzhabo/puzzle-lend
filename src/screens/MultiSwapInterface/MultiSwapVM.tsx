import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { action, makeAutoObservable, when } from "mobx";
import { EXPLORER_URL } from "@src/constants";
import { RootStore, useStores } from "@stores";
import Balance from "@src/entities/Balance";
import BN from "@src/utils/BN";

const ctx = React.createContext<MultiSwapVM | null>(null);

export const MultiSwapVMProvider: React.FC<{ poolDomain: string }> = ({
  poolDomain,
  children,
}) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new MultiSwapVM(rootStore, poolDomain),
    [rootStore, poolDomain]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useMultiSwapVM = () => useVM(ctx);

class MultiSwapVM {
  constructor(
    private rootStore: RootStore,
    public readonly poolDomain: string
  ) {
    makeAutoObservable(this);
    when(
      () => this.pool != null,
      () => {
        this.setAssetId0(this.pool?.defaultAssetId0);
        this.setAssetId1(this.pool?.defaultAssetId1);
      }
    );
  }

  public get pool() {
    return this.rootStore.poolsStore.getPoolByDomain(this.poolDomain)!;
  }

  assetId0: string = this.pool?.defaultAssetId0!;
  setAssetId0 = (assetId: string) => (this.assetId0 = assetId);

  get token0() {
    return this.pool?.tokens.find(({ assetId }) => assetId === this.assetId0);
  }

  get balance0() {
    return this.balances?.find((b) => b.assetId === this.assetId0)?.balance;
  }

  get amount0MaxClickFunc(): (() => void) | undefined {
    const { token0, balance0 } = this;
    return token0 != null && balance0 != null
      ? () => this.setAmount0(balance0)
      : undefined;
  }

  amount0: BN = BN.ZERO;
  @action.bound setAmount0 = (amount: BN) => (this.amount0 = amount);

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  get amount0UsdnEquivalent(): string {
    const { token0 } = this;
    const usdnRate = this.rootStore.poolsStore.usdnRate(this.assetId0, 1);
    if (token0 == null || usdnRate == null) return "—";
    const result = usdnRate.times(
      BN.formatUnits(this.amount0, token0.decimals)
    );
    if (!result.gt(0)) return "—";
    return `~ ${usdnRate
      .times(BN.formatUnits(this.amount0, token0.decimals))
      .toFormat(2)} $`;
  }

  get liquidityOfToken0() {
    return this.pool?.liquidity[this.assetId0];
  }

  assetId1: string = this.pool?.defaultAssetId1!;
  @action.bound setAssetId1 = (assetId: string) => (this.assetId1 = assetId);

  get token1() {
    return this.pool?.tokens.find(({ assetId }) => assetId === this.assetId1);
  }

  get liquidityOfToken1() {
    return this.pool?.liquidity[this.assetId1];
  }

  get rate() {
    return this.pool?.currentPrice(this.assetId0, this.assetId1) ?? BN.ZERO;
  }

  get priceImpact() {
    //100 * (Price(0,1) / (Amount0/Amount1))
    const rate = this.rate;
    if (this.token1 == null || this.token0 == null || rate.eq(BN.ZERO)) {
      return null;
    }
    const amount0 = BN.formatUnits(this.amount0, this.token0!.decimals);
    const amount1 = BN.formatUnits(this.amount1, this.token1!.decimals);
    //(amount0/(amount1*rate))*100
    let priceImpact = amount0.times(rate).div(amount1).minus(1).times(100);
    // let priceImpact = new BN(100).times(rate.div(amount0.div(amount1)));
    if (priceImpact.gt(100)) priceImpact = new BN(100);
    return priceImpact.isNaN() ? BN.ZERO : priceImpact;
  }

  switchTokens = () => {
    const assetId0 = this.assetId0;
    this.setAssetId0(this.assetId1);
    this.setAssetId1(assetId0);
  };

  get balances() {
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

  get amount1() {
    const { liquidityOfToken0: l0, liquidityOfToken1: l1 } = this;
    const { token1, token0, amount0 } = this;
    if (l0 == null || l1 == null || token1 == null || token0 == null) {
      return BN.ZERO;
    }
    const share0 = new BN(token0.share);
    const share1 = new BN(token1.share);

    try {
      const leftPart = BN.formatUnits(l1, token1.decimals);

      const power = share0.div(share1).toSignificant(8).toNumber();
      const base = l0.div(l0.plus(amount0)).toNumber();
      const rightPart = new BN(1).minus(Math.pow(base, power));

      return BN.parseUnits(
        leftPart
          .times(rightPart)
          .times(new BN(100 - this.pool.swapFee).div(100)),
        token1.decimals
      );
    } catch (e) {
      return BN.ZERO;
    }
  }

  get amount1UsdnEquivalent(): string {
    const { token1 } = this;
    const usdnRate = this.rootStore.poolsStore.usdnRate(this.assetId1, 1);
    if (token1 == null || usdnRate == null) return "—";
    const result = usdnRate.times(
      BN.formatUnits(this.amount1, token1.decimals)
    );
    if (!result.gt(0)) return "—";
    return `~ ${usdnRate
      .times(BN.formatUnits(this.amount1, token1.decimals))
      .toFormat(2)} $`;
  }

  get minimumToReceive(): BN {
    const slippage = this.rootStore.poolsStore.slippage;
    return this.amount1.times(new BN(100 - slippage).div(100));
  }

  swap = async () => {
    const { notificationStore } = this.rootStore;
    if (this.pool?.contractAddress == null) return;
    if (this.token0 == null || this.amount0.eq(0)) return;
    if (!this.token1 || !this.amount1.gt(0) || !this.minimumToReceive) return;
    this._setLoading(true);
    this.rootStore.accountStore
      .invoke({
        dApp: this.pool.contractAddress,
        payment: [
          {
            assetId: this.token0.assetId,
            amount: this.amount0.toString(),
          },
        ],
        call: {
          function: "swap",
          args: [
            { type: "string", value: this.token1.assetId },
            {
              type: "integer",
              value: this.minimumToReceive.toFixed(0).toString(),
            },
          ],
        },
      })
      .then((txId) => {
        notificationStore.notify(
          "You can view the details of it in Waves Explorer",
          {
            type: "success",
            title: "Transaction is completed",
            link: `${EXPLORER_URL}/tx/${txId}`,
            linkTitle: "View on Explorer",
          }
        );
      })
      .catch((e) => {
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Transaction is not completed",
        });
      })
      .finally(() => this._setLoading(false));
  };
}
