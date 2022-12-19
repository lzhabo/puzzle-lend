import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import { IToken, POOLS, TOKENS_LIST } from "@src/constants";

const ctx = React.createContext<WidgetsVM | null>(null);

interface IProps {
  poolId?: string;
}

export const WidgetsVmProvider: React.FC<IProps> = ({ children, poolId }) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new WidgetsVM(rootStore, poolId),
    [poolId, rootStore]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useWidgetsVM = () => useVM(ctx);

class WidgetsVM {
  public readonly poolId: string;
  public rootStore: RootStore;
  searchValue = "";
  setSearchValue = (v: string) => (this.searchValue = v);

  tokens: IToken[] = TOKENS_LIST.slice(0, 5);

  sortApy = true;
  setSortApy = (v: boolean) => (this.sortApy = v);

  sortLiquidity = true;
  setSortLiquidity = (v: boolean) => (this.sortLiquidity = v);

  poolCategoryFilter = 0;
  setPoolCategoryFilter = (v: number) => (this.poolCategoryFilter = v);

  customPoolFilter = 0;
  setCustomPoolFilter = (v: number) => (this.customPoolFilter = v);

  constructor(rootStore: RootStore, poolId?: string) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.poolId = poolId ?? POOLS[0].address;
    const pool = POOLS.find((pool) => pool.address === this.poolId)!;
    this.rootStore.lendStore.setPool(pool);
  }
}
