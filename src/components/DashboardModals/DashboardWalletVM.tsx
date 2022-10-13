import React, { useMemo } from 'react';
import { useVM } from '@src/hooks/useVM';
import { makeAutoObservable } from 'mobx';
import { RootStore, useStores } from "@stores";
import BN from "@src/utils/BN";

const ctx = React.createContext<DashboardWalletVM | null>(null);

export const DashboardWalletUseVM = () => useVM(ctx);

class DashboardWalletVM {
  rootStore: RootStore;

  assetsStats: Record<string, BN> | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  onCloseModal = () => {
    const { lendStore } = this.rootStore;
    lendStore.setDashboardModalOpened(false, lendStore.dashboardModalStep);
  };
}

export const DashboardWalletVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new DashboardWalletVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};
