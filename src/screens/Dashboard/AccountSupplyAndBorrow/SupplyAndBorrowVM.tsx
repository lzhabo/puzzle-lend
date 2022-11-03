import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import { TPoolStats } from "@src/stores/LendStore";
import BN from "@src/utils/BN";

const ctx = React.createContext<SupplyAndBorrowVM | null>(null);

interface IProps {
  poolId?: string;
}

type TSortModes = "descending" | "ascending";
type ISortTypes =
  | "borrowAPY"
  | "supplyAPY"
  | "selfSupply"
  | "selfBorrow"
  | "dailyIncome"
  | "dailyLoan";

export const SupplyAndBorrowVMProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new SupplyAndBorrowVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useSupplyAndBorrowVM = () => useVM(ctx);

class SupplyAndBorrowVM {
  public rootStore: RootStore;

  sortSupply: ISortTypes = "selfSupply";
  sortBorrow: ISortTypes = "selfBorrow";
  setActiveSort = (v: ISortTypes, isSupply: boolean) => {
    isSupply ? (this.sortSupply = v) : (this.sortBorrow = v);
  };

  setActiveBorrowSort = (v: ISortTypes) => (this.sortBorrow = v);

  sortModeBorrow: TSortModes = "descending";
  sortModeSupply: TSortModes = "descending";
  setActiveSortMode = (v: TSortModes, isSupply: boolean) => {
    isSupply ? (this.sortModeSupply = v) : (this.sortModeBorrow = v);
  };

  sortData = (poolsData: TPoolStats[], isSupply: boolean) => {
    const sort = isSupply ? this.sortSupply : this.sortBorrow;
    const sortMode = isSupply ? this.sortModeSupply : this.sortModeBorrow;
    return poolsData.slice().sort((a, b) => {
      const stats1: TPoolStats = a;
      const stats2: TPoolStats = b;
      let key: keyof TPoolStats | undefined;
      if (sort === "borrowAPY") key = "borrowAPY";
      if (sort === "supplyAPY") key = "supplyAPY";
      if (sort === "selfSupply") key = "selfSupply";
      if (sort === "selfBorrow") key = "selfBorrow";
      if (sort === "dailyIncome") key = "dailyIncome";
      if (sort === "dailyLoan") key = "dailyLoan";
      if (key == null) return 0;

      if (stats1 == null || stats2 == null) return 0;
      if (stats1[key] == null && stats2[key] != null)
        return sortMode === "descending" ? 1 : -1;
      if (stats1[key] == null && stats2[key] == null)
        return sortMode === "descending" ? -1 : 1;

      const stat1 = stats1[key] as keyof TPoolStats;
      const stat2 = stats2[key] as keyof TPoolStats;

      // if filtering in $ equivalent
      if (
        ["selfSupply", "selfBorrow", "dailyIncome", "dailyLoan"].includes(sort)
      ) {
        const val1 = (BN.formatUnits(stat1, stats1.decimals) as BN)
          .times(stats1?.prices.min)
          .toDecimalPlaces(0);
        const val2 = (BN.formatUnits(stat2, stats2.decimals) as BN)
          .times(stats2?.prices.min)
          .toDecimalPlaces(0);

        if (sortMode === "descending") return val1.lt(val2) ? 1 : -1;
        else return val1.lt(val2) ? -1 : 1;
      }

      if (sortMode === "descending") {
        return BN.formatUnits(stat1, 0).lt(stat2) ? 1 : -1;
      } else return BN.formatUnits(stat1, 0).lt(stat2) ? -1 : 1;
    });
  };

  selectSort = (v: ISortTypes, isSupply: boolean) => {
    const sort = isSupply ? this.sortSupply : this.sortBorrow;
    const sortMode = isSupply ? this.sortModeSupply : this.sortModeBorrow;

    if (sort === v) {
      this.setActiveSortMode(
        sortMode === "ascending" ? "descending" : "ascending",
        isSupply
      );
    } else {
      this.setActiveSort(v, isSupply);
      this.setActiveSortMode("descending", isSupply);
    }
  };

  isSupplyDisabled = (token: TPoolStats): boolean => {
    if (this.rootStore?.lendStore?.pool?.supplyLimit.eq(0)) return false;
    if (!token?.totalSupply || !token?.totalBorrow) return false;
    const reserves = BN.formatUnits(
      token?.totalSupply?.minus(token?.totalBorrow),
      token?.decimals
    );
    return reserves.gt(this.rootStore?.lendStore?.pool?.supplyLimit);
  };

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
}
