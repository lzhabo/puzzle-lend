import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { action, makeAutoObservable, when } from "mobx";
import { RootStore, useStores } from "@stores";
import BN from "@src/utils/BN";
import { EXPLORER_URL, IToken } from "@src/constants";

const ctx = React.createContext<WithdrawLiquidityVM | null>(null);

export const WithdrawLiquidityVMProvider: React.FC<{ poolDomain: string }> = ({
  poolDomain,
  children,
}) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new WithdrawLiquidityVM(rootStore, poolDomain),
    [rootStore, poolDomain]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useWithdrawLiquidityVM = () => useVM(ctx);

type WithdrawToken = {
  amount: BN;
  usdnEquivalent: BN;
};

class WithdrawLiquidityVM {
  public poolDomain: string;
  public rootStore: RootStore;

  public userIndexStaked: BN | null = null;
  private setUserIndexStaked = (value: BN) => (this.userIndexStaked = value);

  public loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  public changePoolModalOpen: boolean = false;
  setChangePoolModalOpen = (value: boolean) =>
    (this.changePoolModalOpen = value);

  percentToWithdraw: BN = new BN(50);
  @action.bound setPercentToWithdraw = (value: number) =>
    (this.percentToWithdraw = new BN(value));

  public get pool() {
    return this.rootStore.poolsStore.getPoolByDomain(this.poolDomain)!;
  }

  constructor(rootStore: RootStore, poolDomain: string) {
    this.poolDomain = poolDomain;
    this.rootStore = rootStore;
    makeAutoObservable(this);

    when(
      () => this.rootStore.accountStore.address != null && this.pool != null,
      () => this.updateUserIndexStaked()
    );
  }

  updateUserIndexStaked = async () => {
    if (this.rootStore.accountStore.address == null) return;
    const response = await this.pool.contractKeysRequest(
      `${this.rootStore.accountStore.address}_indexStaked`
    );
    if (response != null && response.length > 0) {
      this.setUserIndexStaked(new BN(response[0].value));
    }
  };

  get withdrawCompositionTokens(): any[] {
    if (this.pool.tokens == null) return [];
    return this.pool.tokens.reduce<(IToken & { withdraw: BN; inUsdn: BN })[]>(
      (acc, token) => {
        const withdraw =
          (this &&
            this.tokensToWithdrawAmounts &&
            this.tokensToWithdrawAmounts[token.assetId].amount) ??
          BN.ZERO;
        const inUsdn =
          (this &&
            this.tokensToWithdrawAmounts &&
            this.tokensToWithdrawAmounts[token.assetId].usdnEquivalent) ??
          BN.ZERO;
        return [
          ...acc,
          {
            ...token,
            withdraw,
            inUsdn,
          },
        ];
      },
      []
    );
  }

  get tokensToWithdrawAmounts(): Record<string, WithdrawToken> | null {
    if (this.pool == null || this.userIndexStaked == null) return null;
    return this.pool.tokens.reduce<Record<string, WithdrawToken>>(
      (acc, { assetId, decimals }) => {
        const top = this.pool.liquidity[assetId]
          .times(this.percentToWithdraw)
          .times(0.01)
          .times(this.userIndexStaked ?? BN.ZERO);
        const tokenAmountToGet = top.div(this.pool.globalPoolTokenAmount);
        const parserAmount = BN.formatUnits(tokenAmountToGet, decimals);
        const rate = this.rootStore.poolsStore.usdnRate(assetId, 1) ?? BN.ZERO;
        const usdnEquivalent = BN.formatUnits(
          tokenAmountToGet.times(rate),
          decimals
        );
        return {
          ...acc,
          [assetId]: {
            amount: parserAmount,
            usdnEquivalent: usdnEquivalent,
          },
        };
      },
      {}
    );
  }

  get totalAmountToWithdraw(): BN {
    const tokensToWithdrawAmounts = this.tokensToWithdrawAmounts;
    if (tokensToWithdrawAmounts == null || this.pool == null) return BN.ZERO;
    return Object.values(tokensToWithdrawAmounts).reduce<BN>(
      (acc, { usdnEquivalent }) => acc.plus(usdnEquivalent),
      BN.ZERO
    );
  }

  get totalAmountToWithdrawDisplay(): string {
    const total = this.totalAmountToWithdraw;
    return "$ " + total.toFormat(2);
  }

  withdraw = () => {
    const { notificationStore } = this.rootStore;
    if (this.percentToWithdraw.eq(0) || this.pool.layer2Address == null) return;
    if (this.userIndexStaked == null) return;

    this._setLoading(true);
    const value = this.userIndexStaked
      .times(0.01)
      .times(this.percentToWithdraw)
      .toSignificant(0)
      .toString();

    const args = this.pool.isCustom
      ? [
          { type: "integer", value },
          { type: "string", value: this.pool.contractAddress },
        ]
      : [{ type: "integer", value }];

    this.rootStore.accountStore
      .invoke({
        dApp: this.pool.layer2Address,
        payment: [],
        call: {
          function: "unstakeAndRedeemIndex",
          args: args as Array<{ type: "integer" | "string"; value: string }>,
        },
      })
      .then((txId) => {
        txId &&
          notificationStore.notify(
            `Liquidity is successfully withdrawn from the ${this.pool?.title}.`,
            {
              type: "success",
              title: "Successfully withdrawn",
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
      .then(this.updateUserIndexStaked)
      .finally(() => this._setLoading(false));
  };
}
