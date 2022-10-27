import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import copy from "copy-to-clipboard";
import Balance from "@src/entities/Balance";
import { LOGIN_TYPE } from "@src/stores/AccountStore";
import centerEllipsis from "@src/utils/centerEllipsis";
import BN from "@src/utils/BN";
import { TPoolStats } from "@src/stores/LendStore";
import { TOKENS_LIST } from "@src/constants";

const ctx = React.createContext<WalletVM | null>(null);
//fixme review wallet and fix issues
export const WalletVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new WalletVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useWalletVM = () => useVM(ctx);

class WalletVM {
  rootStore: RootStore;

  headerExpanded = true;
  setHeaderExpanded = (state: boolean) => (this.headerExpanded = state);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  handleCopyAddress = () => {
    const { accountStore, notificationStore } = this.rootStore;
    if (accountStore.address) {
      copy(accountStore.address ?? "");
      notificationStore.notify("Your address was copied", {
        type: "success",
        title: "Congratulations!"
      });
    } else {
      notificationStore.notify("There is no address", { type: "error" });
    }
  };

  handleLogOut = async () =>
    Promise.all([
      this.rootStore.accountStore.setWalletModalOpened(false),
      this.rootStore.accountStore.setAssetBalances(null),
      this.rootStore.accountStore.setAddress(null),
      this.rootStore.accountStore.setLoginType(null)
    ]);

  get signInInfo() {
    const { loginType, address } = this.rootStore.accountStore;
    return `${
      loginType === LOGIN_TYPE.KEEPER ? "Keeper" : "Signer"
    }: ${centerEllipsis(address ?? "", 6)}`;
  }

  get userAssets() {
    const { accountStore, lendStore } = this.rootStore;
    return TOKENS_LIST.map((t) => {
      const balance = accountStore.findBalanceByAssetId(t.assetId);
      return balance ?? new Balance(t);
    })
      .filter((balance) =>
        lendStore.poolsStats.find((item) => item.assetId === balance.assetId)
      )
      .filter(({ balance }) => balance && !balance.eq(0))
      .sort((a, b) => {
        if (a.usdnEquivalent == null && b.usdnEquivalent == null) return 0;
        if (a.usdnEquivalent == null && b.usdnEquivalent != null) return 1;
        if (a.usdnEquivalent == null && b.usdnEquivalent == null) return -1;
        return a.usdnEquivalent!.lt(b.usdnEquivalent!) ? 1 : -1;
      });
  }

  get totalInvestmentAmount() {
    const { userAssets } = this;
    const balancesAmount = userAssets.reduce((acc, b) => {
      const rate = this.tokenStats(b.assetId)?.prices.min || BN.ZERO;
      const balance = BN.formatUnits(b?.balance || BN.ZERO, b?.decimals);
      return acc.plus(balance.times(rate));
    }, BN.ZERO);
    return balancesAmount.plus(BN.ZERO).toFormat(2);
  }

  tokenStats = (tokenAssetId: string): TPoolStats | null => {
    const tokenIndex = this.rootStore.lendStore.poolsStats
      .map((item: TPoolStats) => item.assetId)
      .indexOf(tokenAssetId);

    return tokenIndex !== -1
      ? this.rootStore.lendStore.poolsStats[tokenIndex]
      : null;
  };
}
