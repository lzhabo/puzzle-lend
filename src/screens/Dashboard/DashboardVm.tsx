import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import { IToken, TOKENS_LIST } from "@src/constants";

const ctx = React.createContext<DashboardVM | null>(null);

export const DashboardVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new DashboardVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useDashboardVM = () => useVM(ctx);

class DashboardVM {
  public rootStore: RootStore;
  searchValue = "";
  setSearchValue = (v: string) => (this.searchValue = v);

  tokens: IToken[] = TOKENS_LIST.slice(0, 5);

  sortApy = true;
  setSortApy = (v: boolean) => (this.sortApy = v);

  sortLiquidity = true;
  setSortLiquidity = (v: boolean) => (this.sortLiquidity = v);

  poolCategoryFilter: number = 0;
  setPoolCategoryFilter = (v: number) => (this.poolCategoryFilter = v);

  customPoolFilter: number = 0;
  setCustomPoolFilter = (v: number) => (this.customPoolFilter = v);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
}
