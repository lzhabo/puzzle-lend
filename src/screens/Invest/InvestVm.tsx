import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import Pool from "@src/entities/Pool";
import BN from "@src/utils/BN";
import poolService from "@src/services/poolsService";
import { TOKENS_BY_ASSET_ID } from "@src/constants";

const ctx = React.createContext<InvestVM | null>(null);

export const InvestVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new InvestVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useInvestVM = () => useVM(ctx);

class InvestVM {
  public rootStore: RootStore;
  searchValue = "";
  setSearchValue = (v: string) => (this.searchValue = v);

  sortApy = true;
  setSortApy = (v: boolean) => (this.sortApy = v);

  sortLiquidity = true;
  setSortLiquidity = (v: boolean) => (this.sortLiquidity = v);

  customPools: Pool[] = [];
  setCustomPools = (v: Pool[]) => (this.customPools = v);

  poolCategoryFilter: number = 0;
  setPoolCategoryFilter = (v: number) => (this.poolCategoryFilter = v);

  customPoolFilter: number = 0;
  setCustomPoolFilter = (v: number) => (this.customPoolFilter = v);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.syncCustomPools();
    makeAutoObservable(this);
  }

  syncCustomPools = async () => {
    const rawPools = await poolService.getPools();
    const pools = rawPools.map((p) => {
      const tokens = p.assets.map(({ assetId, share }) => ({
        ...TOKENS_BY_ASSET_ID[assetId],
        share,
      }));
      return new Pool({ ...p, tokens });
    });
    this.setCustomPools(pools);
  };

  get pools() {
    return this.rootStore.poolsStore.pools;
  }

  get totalInvestmentBalance(): string | null {
    const { accountPoolsLiquidity } = this.rootStore.poolsStore;
    if (accountPoolsLiquidity == null) return null;
    const value = accountPoolsLiquidity?.reduce(
      (acc, v) => acc.plus(v.liquidityInUsdn),
      BN.ZERO
    );
    return "$ " + value?.toFormat(2);
  }
}
