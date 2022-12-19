import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import { IToken, POOLS, TOKENS_LIST } from "@src/constants";

const ctx = React.createContext<MarketsVM | null>(null);

interface IProps {
  poolId?: string;
}

export const MarketsVmProvider: React.FC<IProps> = ({ children, poolId }) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new MarketsVM(rootStore, poolId),
    [poolId, rootStore]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useMarketsVM = () => useVM(ctx);

class MarketsVM {
  public readonly poolId: string;
  public rootStore: RootStore;

  tokens: IToken[] = TOKENS_LIST.slice(0, 5);

  constructor(rootStore: RootStore, poolId?: string) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.poolId = poolId ?? POOLS[0].address;
    const pool = POOLS.find((pool) => pool.address === this.poolId)!;
    this.rootStore.lendStore.setPool(pool);
  }
}
