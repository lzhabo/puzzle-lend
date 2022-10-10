import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, when } from "mobx";
import { RootStore, useStores } from "@stores";
import BN from "@src/utils/BN";
import Balance from "@src/entities/Balance";
import { CONTRACT_ADDRESSES } from "@src/constants";
import {
  buildErrorDialogParams,
  buildSuccessBoostParams,
  IDialogNotificationProps,
} from "@components/Dialog/DialogNotification";
import dayjs from "dayjs";
import poolsService from "@src/services/poolsService";

const ctx = React.createContext<BoostApyVm | null>(null);

export const BoostApyVmProvider: React.FC<{
  poolDomain: string;
}> = ({ poolDomain, children }) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new BoostApyVm(rootStore, poolDomain),
    [rootStore, poolDomain]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useBoostApyVm = () => useVM(ctx);

class BoostApyVm {
  public poolDomain: string;
  public rootStore: RootStore;

  constructor(rootStore: RootStore, poolDomain: string) {
    this.poolDomain = poolDomain;
    this.rootStore = rootStore;
    makeAutoObservable(this);
    when(
      () => this.pool != null,
      () => {
        this.setAssetId(this.pool.tokens[0].assetId);
      }
    );
  }

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  public get pool() {
    return this.rootStore?.poolsStore.getPoolByDomain(this.poolDomain)!;
  }

  public days: number = 1;
  public setDays = (v: number) => (this.days = v);

  assetId: string = this.pool?.defaultAssetId0!;
  setAssetId = (assetId: string) => (this.assetId = assetId);

  amount: BN = BN.ZERO;
  setAmount = (amount: BN) => (this.amount = amount);

  public notificationParams: IDialogNotificationProps | null = null;
  public setNotificationParams = (params: IDialogNotificationProps | null) =>
    (this.notificationParams = params);

  get token() {
    return this.pool?.tokens.find(({ assetId }) => assetId === this.assetId);
  }

  get balance() {
    return this.balances?.find((b) => b.assetId === this.assetId)?.balance;
  }

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

  get amountMaxClickFunc(): (() => void) | undefined {
    const { token, balance } = this;
    return token != null && balance != null
      ? () => this.setAmount(balance)
      : undefined;
  }

  get usdnEquivalent(): string {
    const { token } = this;
    const usdnRate = this.rootStore?.poolsStore.usdnRate(this.assetId, 1);
    if (token == null || usdnRate == null) return "—";
    const result = usdnRate.times(BN.formatUnits(this.amount, token.decimals));
    if (!result.gt(0)) return "—";
    return `~ ${usdnRate
      .times(BN.formatUnits(this.amount, token.decimals))
      .toFormat(2)} $`;
  }

  get calcBoostedApy() {
    const usdnEquivalent = this.rootStore?.poolsStore
      .usdnRate(this.assetId, 1)
      ?.times(BN.formatUnits(this.amount, this.token?.decimals));

    if (
      this.amount.eq(0) ||
      this.days === 0 ||
      this.pool?.globalLiquidity.eq(0)
    )
      return "0.00 %";
    const amount = usdnEquivalent?.div(this.pool.globalLiquidity).plus(1);
    const days = new BN(365).div(this.days);
    const percent = Math.pow(amount?.toNumber() ?? 1, days.toNumber());

    return new BN(percent).times(100).minus(100)?.toFormat(2) + " %";
  }

  get isAllDataProvided() {
    return (
      this.days > 0 &&
      this.days <= 365 &&
      !this.amount.eq(0) &&
      !this.loading &&
      this.amount.lte(this.balance ?? 0)
    );
  }

  get formattedDays() {
    return dayjs().add(this.days, "day").format("MMM D, YYYY");
  }

  boost = async () => {
    if (this.pool?.contractAddress == null) return;
    if (this.token == null) return;
    if (this.amount.eq(0)) return;
    this._setLoading(true);
    this.setNotificationParams(null);

    this.rootStore.accountStore
      .invoke({
        dApp: CONTRACT_ADDRESSES.boost,
        payment: [
          { assetId: this.token.assetId, amount: this.amount.toString() },
        ],
        call: {
          function: "addBoosting",
          args: [
            { type: "string", value: this.pool.contractAddress },
            { type: "integer", value: this.days.toString() },
          ],
        },
      })
      .then((txId) => {
        txId &&
          this.setNotificationParams(
            buildSuccessBoostParams({
              domain: this.poolDomain,
              description: `${this.pool.title} APY boosted by ${this.calcBoostedApy} until ${this.formattedDays}`,
            })
          );
      })
      .then(async () => {
        await poolsService.updateStats(this.pool.domain);
      })
      .catch((e) => {
        console.error(e);
        this.setNotificationParams(
          buildErrorDialogParams({
            title: "Transaction is not completed",
            description: e.message ?? JSON.stringify(e),
            onTryAgain: this.boost,
          })
        );
      })
      .finally(() => this._setLoading(false));
  };
}
