import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import Market from "@src/entities/Market";

const ctx = React.createContext<MarketVm | null>(null);

interface IProps {
  marketId: string;
}

export const MarketVMProvider: React.FC<IProps> = ({ children, marketId }) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new MarketVm(rootStore, marketId),
    [marketId, rootStore]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useMarketVM = () => useVM(ctx);

class MarketVm {
  public rootStore: RootStore;
  searchValue = "";
  setSearchValue = (v: string) => (this.searchValue = v);

  private _market: Market | null = null;
  private setMarket = (v: Market | null) => (this._market = v);

  get market() {
    return this._market!;
  }

  get initialized() {
    return this.market.marketStats.length > 0;
  }

  get marketId() {
    return this.market.marketId;
  }

  sortApy = true;
  setSortApy = (v: boolean) => (this.sortApy = v);

  sortLiquidity = true;
  setSortLiquidity = (v: boolean) => (this.sortLiquidity = v);

  poolCategoryFilter = 0;
  setPoolCategoryFilter = (v: number) => (this.poolCategoryFilter = v);

  constructor(rootStore: RootStore, marketId: string) {
    this.rootStore = rootStore;
    const market =
      this.rootStore.marketsStore.getMarketByContractAddress(marketId);
    market != null && this.setMarket(new Market(this.rootStore, market));
    makeAutoObservable(this);
  }
}
