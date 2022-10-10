import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import copy from "copy-to-clipboard";
import Balance from "@src/entities/Balance";
import { LOGIN_TYPE } from "@src/stores/AccountStore";
import centerEllipsis from "@src/utils/centerEllipsis";
import BN from "@src/utils/BN";
import { ROUTES, TOKENS_LIST } from "@src/constants";

const ctx = React.createContext<WalletVM | null>(null);

export const WalletVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new WalletVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useWalletVM = () => useVM(ctx);

class WalletVM {
  rootStore: RootStore;

  headerExpanded: boolean = true;
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
        title: "Congratulations!",
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
      this.rootStore.accountStore.setLoginType(null),
      this.rootStore.poolsStore.setAccountPoolsLiquidity(null),
      this.rootStore.stakeStore.setStakedAccountPuzzle(null),
    ]);

  get signInInfo() {
    const { loginType, address } = this.rootStore.accountStore;
    return `${
      loginType === LOGIN_TYPE.KEEPER ? "Keeper" : "Signer"
    }: ${centerEllipsis(address ?? "", 6)}`;
  }

  get balances() {
    const { accountStore } = this.rootStore;
    return TOKENS_LIST.map((t) => {
      const balance = accountStore.findBalanceByAssetId(t.assetId);
      return balance ?? new Balance(t);
    })
      .filter(({ balance }) => balance && !balance.eq(0))
      .sort((a, b) => {
        if (a.usdnEquivalent == null && b.usdnEquivalent == null) return 0;
        if (a.usdnEquivalent == null && b.usdnEquivalent != null) return 1;
        if (a.usdnEquivalent == null && b.usdnEquivalent == null) return -1;
        return a.usdnEquivalent!.lt(b.usdnEquivalent!) ? 1 : -1;
      });
  }

  get totalInvestmentAmount() {
    const { balances } = this.rootStore.accountStore;
    const balancesAmount = balances.reduce(
      (acc, b) => acc.plus(b.usdnEquivalent ?? 0),
      BN.ZERO
    );
    return balancesAmount.plus(BN.ZERO).toFormat(2);
  }

  get investments() {
    const { poolsStore, stakeStore } = this.rootStore;
    const poolsData =
      poolsStore.accountPoolsLiquidity
        ?.filter(({ liquidityInUsdn }) => !liquidityInUsdn.eq(0))
        .map(
          ({
            pool,
            addressStaked,
            indexTokenRate,
            liquidityInUsdn,
            indexTokenName,
          }) => {
            const amount = BN.formatUnits(addressStaked, 8);
            return {
              onClickPath: `/pools/${pool.domain}/invest`,
              logo: pool?.logo,
              name: pool?.title,
              amount:
                (amount.gte(0.0001) ? amount.toFormat(4) : amount.toFormat(8)) +
                indexTokenName,
              nuclearValue:
                "$ " +
                (indexTokenRate.gte(0.0001)
                  ? indexTokenRate.toFormat(4)
                  : indexTokenRate.toFormat(8)),
              usdnEquivalent: "$ " + liquidityInUsdn.toFormat(2),
            };
          }
        ) ?? [];
    const stakedNftData = this.stakedNfts.map(
      ({ imageLink, marketPrice, name }) => {
        const price =
          marketPrice == null
            ? "-"
            : "$ " + new BN(marketPrice ?? 0).toFormat();

        return {
          onClickPath: ROUTES.ULTRASTAKE,
          logo: imageLink,
          amount: "1 NFT",
          name,
          nuclearValue: price,
          usdnEquivalent: price,
        };
      }
    );
    const stakedPuzzle = stakeStore.puzzleWallet;
    return [...stakedNftData, ...poolsData, ...stakedPuzzle].sort((a, b) =>
      new BN(a.usdnEquivalent).gt(b.usdnEquivalent) ? 1 : -1
    );
  }

  get stakedNfts() {
    const { nftStore } = this.rootStore;
    return nftStore.stakedAccountNFTs ?? [];
  }
}
