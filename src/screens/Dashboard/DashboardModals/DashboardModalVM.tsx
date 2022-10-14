import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import { EXPLORER_URL } from "@src/constants";
import BN from "@src/utils/BN";
import LendStore from "@src/stores/LendStore";

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
  modalAmount = BN.ZERO;

  borrowAmount = BN.ZERO;
  repayAmount = BN.ZERO;
  withdrawAmount = BN.ZERO;

  get currentPoolId() {
    const { lendStore } = this.rootStore;
    return lendStore.poolId;
  }

  get userHealth() {
    const { lendStore } = this.rootStore;
    return lendStore.health;
  }

  get userCollateral() {
    const { lendStore } = this.rootStore;
    return lendStore.userCollateral;
  }

  setModalAmount = (amount: BN) => {
    console.log(amount.toString(), "AMOUNT");
    this.modalAmount = amount;
  };
  setDashboardModalStep = (step: 0 | 1) => {
    this.dashboardModalStep = step;
  };

  submitBorrow = async (amount: any, assetId: any, contractAddress: string) => {
    const { accountStore, notificationStore, lendStore } = this.rootStore;
    if (lendStore.poolId == null) return;

    await accountStore
      .invoke({
        dApp: contractAddress,
        payment: [],
        call: {
          function: "borrow",
          args: [
            { type: "string", value: assetId },
            { type: "integer", value: amount.toString() }
          ]
        }
      })
      .then((txId) => {
        txId &&
          notificationStore.notify(
            `Congrats, You successfully borrowed some money! You can track the transaction on Waves Explorer.`,
            {
              type: "success",
              title: `Success`,
              link: `${EXPLORER_URL}/tx/${txId}`,
              linkTitle: "View on Explorer"
            }
          );
      })
      .catch((e) => {
        console.log(e, "---e");
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Oops, transaction is not completed"
        });
      })
      .then(async () => {
        await accountStore.updateAccountAssets(true);
      });
  };

  submitSupply = async (amount: any, assetId: any, contractAddress: string) => {
    const { accountStore, notificationStore, lendStore } = this.rootStore;
    if (lendStore.poolId == null) return;

    await accountStore
      .invoke({
        dApp: contractAddress,
        payment: [
          {
            assetId,
            amount: amount.toString()
          }
        ],
        call: {
          function: "supply",
          args: []
        }
      })
      .then((txId) => {
        txId &&
          notificationStore.notify(
            `Congrats with successfull supply! You can track the transaction on Waves Explorer.`,
            {
              type: "success",
              title: `Success`,
              link: `${EXPLORER_URL}/tx/${txId}`,
              linkTitle: "View on Explorer"
            }
          );
      })
      .catch((e) => {
        console.log(e, "---e");
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Oops, transaction is not completed"
        });
      })
      .then(async () => {
        await accountStore.updateAccountAssets(true);
      });
  };

  submitWithdraw = async (
    amount: any,
    assetId: any,
    contractAddress: string
  ) => {
    const { accountStore, notificationStore, lendStore } = this.rootStore;
    if (lendStore.poolId == null) return;

    await accountStore
      .invoke({
        dApp: contractAddress,
        payment: [],
        call: {
          function: "withdraw",
          args: [
            { type: "string", value: assetId },
            { type: "integer", value: amount.toString() }
          ]
        }
      })
      .then((txId) => {
        txId &&
          notificationStore.notify(
            `Congrats, it's successfull Withdraw! You can track the transaction on Waves Explorer.`,
            {
              type: "success",
              title: `Success`,
              link: `${EXPLORER_URL}/tx/${txId}`,
              linkTitle: "View on Explorer"
            }
          );
      })
      .catch((e) => {
        console.log(e, "---e");
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Oops, transaction is not completed"
        });
      })
      .then(async () => {
        await accountStore.updateAccountAssets(true);
      });
  };

  submitRepay = async (amount: any, assetId: any, contractAddress: string) => {
    const { accountStore, notificationStore, lendStore } = this.rootStore;
    if (lendStore.poolId == null) return;

    await accountStore
      .invoke({
        dApp: contractAddress,
        payment: [
          {
            assetId,
            amount: amount.toString()
          }
        ],
        call: {
          function: "repay",
          args: []
        }
      })
      .then((txId) => {
        txId &&
          notificationStore.notify(
            `Congrats, successfully Repaid you'r loan! You can track the transaction on Waves Explorer.`,
            {
              type: "success",
              title: `Success`,
              link: `${EXPLORER_URL}/tx/${txId}`,
              linkTitle: "View on Explorer"
            }
          );
      })
      .catch((e) => {
        console.log(e, "---e");
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Oops, transaction is not completed"
        });
      })
      .then(async () => {
        await accountStore.updateAccountAssets(true);
      });
  };
}
