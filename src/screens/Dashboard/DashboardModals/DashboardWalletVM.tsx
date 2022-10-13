import React, { useMemo } from 'react';
import { useVM } from '@src/hooks/useVM';
import { makeAutoObservable, action } from 'mobx';
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<DashboardWalletVM | null>(null);

export const DashboardWalletUseVM = () => useVM(ctx);

class DashboardWalletVM {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  onCloseModal = () => {
    this.setDashboardModalOpened(false, this.dashboardModalStep);
  };

  dashboardModalStep: 0 | 1 = 0;
  dashboardModalOpened: boolean = false;
  @action.bound setDashboardModalOpened = (isOpen: boolean, step: 0 | 1) => {
    this.dashboardModalStep = step;
    this.dashboardModalOpened = isOpen
  };

}

export const DashboardWalletVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new DashboardWalletVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};
