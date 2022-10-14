import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<DashboardModalVM | null>(null);

export const DashboardUseVM = () => useVM(ctx);

export const DashboardVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new DashboardModalVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

class DashboardModalVM {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  dashboardModalStep: 0 | 1 = 0;
  dashboardModalTitles = [];

  setDashboardModalStep = (step: 0 | 1) => {
    this.dashboardModalStep = step;
  };
}
