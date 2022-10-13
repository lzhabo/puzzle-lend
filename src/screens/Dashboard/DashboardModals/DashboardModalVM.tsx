import React, { useMemo } from 'react';
import { useVM } from '@src/hooks/useVM';
import { makeAutoObservable } from 'mobx';
import { RootStore, useStores } from '@stores';

const ctx = React.createContext<DashboardVM | null>(null);

export const DashboardUseVM = () => useVM(ctx);

class DashboardVM {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  onCloseModal = () => {
    this.setDashboardModalOpened(false, this.dashboardModalStep);
  };

  dashboardModalStep: 0 | 1 = 0;
  dashboardModalOpened = false;
  setDashboardModalOpened = (isOpen: boolean, step: 0 | 1) => {
    this.dashboardModalStep = step;
    this.dashboardModalOpened = isOpen;
  };
}

export const DashboardVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new DashboardVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};
