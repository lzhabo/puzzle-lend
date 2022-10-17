import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import { EXPLORER_URL, OPERATIONS_TYPE } from "@src/constants";
import { TPoolStats } from "@src/stores/LendStore";
import BN from "@src/utils/BN";

const ctx = React.createContext<DashboardModalVM | null>(null);

export const DashboardUseVM = () => useVM(ctx);

export const DashboardVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new DashboardModalVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

type UrlParamsTypes = {
  tokenId?: string;
  modalPoolId?: string;
};

class DashboardModalVM {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // fixme
  //  Если метод не ридонли делаем его изменение только через сеттер
  //  Сеттеры делаем на следующей строке после поля класса
  dashboardModalStep: 0 | 1 = 0;
  setDashboardModalStep = (step: 0 | 1) => {
    this.dashboardModalStep = step;
  };
  dashboardModalTitles = [];
  modalAmount = BN.ZERO;
  operationName: OPERATIONS_TYPE | undefined;

  urlParams: UrlParamsTypes = {};
  isDollar = false;

  modalErrorText = "";
  accountHealth = 100;

  setOperationName = (operation: OPERATIONS_TYPE) =>
    (this.operationName = operation);

  setError = (error: string) => (this.modalErrorText = error);
  setAccountHealth = (health: number) => (this.accountHealth = health);

  get currentPoolId() {
    return this.rootStore.lendStore.poolId;
  }

  get userHealth() {
    return this.rootStore.lendStore.health;
  }

  get userCollateral() {
    return this.rootStore.lendStore.userCollateral;
  }

  get tokenBalance(): BN {
    return (
      this.rootStore.accountStore.balances.find(
        (tokenData) => tokenData.assetId === this.urlParams?.tokenId
      )?.balance || BN.ZERO
    );
  }

  get token(): TPoolStats {
    const { lendStore } = this.rootStore;

    // not sure
    return lendStore.poolsStats.find(
      (_) => _.assetId === this.urlParams.tokenId
    )!;
  }

  // REPAY MODAL
  get userRepayAmount(): string {
    let val = this.token?.selfBorrow.minus(this.modalFormattedVal);

    if (this.token?.selfBorrow.eq(0)) return "0";

    if (this.isDollar)
      return BN.formatUnits(
        val.times(this.token?.prices?.min),
        this.token?.decimals
      ).toFormat(2);

    return BN.formatUnits(val, this.token?.decimals).toFormat(2);
  }

  get countMaxBtn() {
    let selfVal = BN.ZERO;

    if (this.operationName === OPERATIONS_TYPE.WITHDRAW) {
      selfVal = this.token?.selfSupply;
    }
    if (this.operationName === OPERATIONS_TYPE.REPAY) {
      selfVal = this.token?.selfBorrow;
    }
    if (this.operationName === OPERATIONS_TYPE.SUPPLY) {
      selfVal = this.tokenBalance;
    }

    let countVal = selfVal;
    if (this.isDollar) countVal = countVal.times(this.token?.prices?.min);

    return countVal.toDecimalPlaces(0, 2);
  }

  get modalFormattedVal() {
    let countVal = this.modalAmount;

    if (this.isDollar) countVal = countVal.div(this.token?.prices?.min);

    return countVal;
  }

  get onNativeChange(): BN {
    let countVal = this.modalAmount;

    if (this.isDollar) countVal = countVal.div(this.token?.prices?.min);
    else countVal = countVal.times(this.token?.prices?.min);

    return countVal;
  }

  // BORROW MODAL
  // counting maximum after USER INPUT
  get userMaximumToBorrow(): BN {
    let maximum = BN.formatUnits(this.userCollateral, 6);

    if (!this.isDollar)
      maximum = BN.formatUnits(this.userCollateral, 6).div(
        this.token?.prices.min
      );

    maximum = maximum.times(this.token?.lt);

    const totalReserves = BN.formatUnits(
      this.token?.totalSupply,
      this.token?.decimals
    ).minus(BN.formatUnits(this.token?.totalBorrow, this.token?.decimals));

    // cause if market liquidity lower, asset cant provide requested amount of money to user
    if (totalReserves.lt(maximum)) {
      return totalReserves.minus(
        BN.formatUnits(this.modalAmount, this.token?.decimals)
      );
    }

    return maximum.minus(
      BN.formatUnits(this.modalAmount, this.token?.decimals)
    );
  }

  get tokenReserves(): string {
    const reserves = this.token?.totalSupply.minus(this.token?.totalBorrow);
    return BN.formatUnits(reserves, this.token?.decimals).toFormat(2);
  }

  get countUserBalance(): string {
    let val = this.tokenBalance;

    if (this.isDollar) val = val.times(this.token?.prices?.min);
    if (this.operationName === OPERATIONS_TYPE.WITHDRAW) {
      val = BN.formatUnits(val.plus(this.modalAmount), this.token?.decimals);
    }
    if (this.operationName === OPERATIONS_TYPE.SUPPLY) {
      val = BN.formatUnits(val.minus(this.modalAmount), this.token?.decimals);
    }

    return val.toFormat(4) || "0";
  }

  get userDailyIncome(): BN {
    return (
      this.token?.interest.times(
        BN.formatUnits(this.modalAmount, this.token?.decimals)
      ) || BN.ZERO
    );
  }

  setVMamount = (amount: BN) => {
    this.modalAmount = amount;
  };

  setVMisDollar = (isDollar: boolean) => {
    this.isDollar = isDollar;
  };

  setUrlParams = (params: UrlParamsTypes) => {
    this.urlParams = params;
  };

  triggerMaxClickFunc = (amount: BN) => {
    const { accountStore } = this.rootStore;
    console.log(+amount, "AMOUNT");

    const getAssetData = accountStore.balances.find(
      (tokenData) => tokenData.assetId === this.urlParams.tokenId
    );

    if (this.operationName === OPERATIONS_TYPE.SUPPLY && !getAssetData) return;

    this.setVMamount(amount);
  };

  // BORROW MODAL
  countBorrowAccountHealth = (currentBorrow: BN) => {
    const { lendStore } = this.rootStore;

    if (currentBorrow.eq(0)) {
      this.setAccountHealth(100);
      return 100;
    }

    let currentBorrowAmount = BN.formatUnits(
      currentBorrow,
      this.token?.decimals
    );

    if (this.isDollar)
      currentBorrowAmount = currentBorrowAmount.div(this.token?.prices?.min);
    //fixme вынести расчет здоровья в функцию
    // все что занимает больше 5 строк и повторяется больше 1 раза стоит выносить
    const bc = lendStore.poolsStats.reduce((acc: BN, stat: TPoolStats) => {
      const deposit = BN.formatUnits(stat.selfSupply, stat.decimals);
      if (deposit.eq(0)) return acc;
      const cf = stat.cf;
      const assetBc = cf.times(1).times(deposit).times(stat.prices.min);
      return acc.plus(assetBc);
    }, BN.ZERO);

    let bcu = lendStore.poolsStats.reduce((acc: BN, stat: TPoolStats) => {
      const borrow = BN.formatUnits(stat.selfBorrow, stat.decimals);
      const lt = stat.lt;
      let assetBcu = borrow.times(stat.prices.max).div(lt);

      // if same asset, adding to it INPUT value
      if (stat.assetId === this.token?.assetId) {
        assetBcu = BN.formatUnits(stat.selfBorrow, stat.decimals)
          .plus(currentBorrowAmount)
          .times(stat.prices.max)
          .div(lt);
      }

      return acc.plus(assetBcu);
    }, BN.ZERO);

    // case when user did'nt borrow anything
    if (bcu.eq(0))
      bcu = currentBorrowAmount
        .times(this.token?.prices.max)
        .div(this.token?.lt)
        .plus(bcu);

    const accountHealth: BN = new BN(1).minus(bcu.div(bc)).times(100);

    if (bcu.lt(0) || accountHealth.lt(0)) {
      this.setAccountHealth(0);
      return 0;
    }

    this.setAccountHealth(+accountHealth);
    return +accountHealth;
  };

  // counting maximum amount for MAX btn
  userMaximumToBorrowBN = () => {
    // fixme не делай let и 1000 переопределений, это невозможно читать
    let maximum = BN.formatUnits(this.userCollateral, 6).times(this.token?.lt);
    let isError = false;

    if (!this.isDollar) maximum = maximum.div(this.token?.prices.max);
    const totalReserves = this.token?.totalSupply.minus(
      this.token?.totalBorrow
    );

    // cause if market liquidity lower, asset cant provide requested amount of money to user
    if (BN.formatUnits(totalReserves, 6).lt(maximum)) {
      this.setError("Not enough Reserves in Pool");
      isError = true;
      return totalReserves.times(0.8);
    }

    // current recommended maximum borrow, no more than 80% of health
    const val = maximum.times(10 ** this.token.decimals).times(0.8);

    if (this.countBorrowAccountHealth(val) < 1) {
      this.setError(`Account health less than 1%, risk of liquidation`);
      isError = true;
    }

    if (!isError) this.setError("");
    return val;
  };

  borrowChangeAmount = (v: BN) => {
    const formattedVal = BN.formatUnits(v, this.token?.decimals);
    // if !isNative, show maximum in dollars, collateral in dollars by default
    let maxCollateral = BN.formatUnits(this.userCollateral, 6);
    // reserves in crypto amount by default
    let totalReserves = this.token?.totalSupply.minus(this.token?.totalBorrow);
    let isError = false;

    if (!this.isDollar)
      maxCollateral = BN.formatUnits(this.userCollateral, 6).div(
        this.token?.prices?.min
      );

    if (this.isDollar)
      totalReserves = totalReserves.times(this.token?.prices?.min);

    if (maxCollateral.isLessThanOrEqualTo(formattedVal)) {
      this.setError("Borrow amount less than your Collateral");
      isError = true;
    }

    if (BN.formatUnits(totalReserves, 6).isLessThanOrEqualTo(formattedVal)) {
      this.setError("Not enough Reserves in Pool");
      isError = true;
    }

    if (this.countBorrowAccountHealth(v) < 1) {
      this.setError(`Account health less than 1%, risk of liquidation`);
      isError = true;
    }

    if (!isError) this.setError("");
    return v;
  };

  // WITHDRAW MODAL
  countWithdrawAccountHealth = (currentWithdraw: any) => {
    const { lendStore } = this.rootStore;
    let currentWithdrawAmount = currentWithdraw;

    if (this.isDollar)
      currentWithdrawAmount = currentWithdrawAmount.div(
        this.token?.prices?.min
      );

    const bc = lendStore.poolsStats.reduce((acc: BN, stat: TPoolStats) => {
      const deposit = BN.formatUnits(stat.selfSupply, stat.decimals);
      if (deposit.eq(0)) return acc;
      const cf = stat.cf;
      let assetBc = cf.times(1).times(deposit).times(stat.prices.min);

      if (stat.assetId === this.token?.assetId) {
        assetBc = BN.formatUnits(
          stat.selfSupply.minus(currentWithdrawAmount),
          stat.decimals
        )
          .times(stat.prices.min)
          .times(cf);
      }

      return acc.plus(assetBc);
    }, BN.ZERO);

    const bcu = lendStore.poolsStats.reduce((acc: BN, stat: TPoolStats) => {
      const borrow = BN.formatUnits(stat.selfBorrow, stat.decimals);
      const lt = stat.lt;
      let assetBcu = borrow.times(stat.prices.max).div(lt);
      return acc.plus(assetBcu);
    }, BN.ZERO);

    const accountHealth: BN = new BN(1).minus(bcu.div(bc)).times(100);

    if (bc.lt(0) || accountHealth.lt(0)) {
      this.setAccountHealth(0);
      return 0;
    }

    this.setAccountHealth(+accountHealth);
    return +accountHealth;
  };

  withdrawChangeAmount = (v: BN) => {
    let isError = false;
    let selfSupply = this.token?.selfSupply;

    if (this.isDollar) {
      selfSupply = selfSupply.times(this.token?.prices?.min);
    }

    // need more review here
    const formattedVal = v.minus(100);

    if (
      formattedVal &&
      selfSupply &&
      selfSupply.toDecimalPlaces(0, 2).lt(formattedVal)
    ) {
      this.setError(`Amount of withdraw bigger than your supply`);
      isError = true;
    }

    if (this.countWithdrawAccountHealth(v) < 1) {
      this.setError(`Account health less than 1%, risk of liquidation`);
      isError = true;
    }

    if (!isError) this.setError("");
    this.setVMamount(v);
  };

  // REPAY MODAL
  repayChangeAmount = (v: BN) => {
    let isError = false;
    let walletBalance = this.tokenBalance;
    let forRepay = this.token?.selfBorrow;

    if (this.isDollar && walletBalance && forRepay) {
      walletBalance = walletBalance.times(this.token?.prices?.min);
      forRepay = forRepay.times(this.token?.prices?.min);
    }

    if (forRepay && forRepay.times(1.05).isLessThanOrEqualTo(v)) {
      this.setError(`Too big value for repaying`);
      isError = true;
    }

    if (walletBalance && walletBalance.isLessThanOrEqualTo(v)) {
      this.setError(`Amount of repay bigger than wallet balance`);
      isError = true;
    }

    if (!isError) this.setError("");
    this.setVMamount(v);
  };

  // SUPPLY MODAL
  supplyChangeAmount = (v: BN) => {
    const formattedVal = BN.formatUnits(v, this.token?.decimals);
    const walletBal = this.isDollar
      ? BN.formatUnits(this.tokenBalance, this.token?.decimals)
      : BN.formatUnits(this.tokenBalance, this.token?.decimals).times(
          this.token?.prices?.min
        );

    let isError = false;

    if (walletBal.lt(formattedVal)) {
      this.setError("Wallet Balance too low");
      isError = true;
    }

    if (!isError) this.setError("");
    this.setVMamount(v);
  };

  submitBorrow = async (
    amount: BN,
    assetId: string,
    contractAddress: string
  ) => {
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
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Oops, transaction is not completed"
        });
      })
      .finally(() => {
        accountStore.updateAccountAssets(true);
        lendStore.syncPoolsStats();
      });
  };

  submitSupply = async (
    amount: BN,
    assetId: string,
    contractAddress: string
  ) => {
    const { accountStore, notificationStore, lendStore } = this.rootStore;
    if (lendStore.poolId == null) return;

    await accountStore
      .invoke({
        dApp: contractAddress,
        payment: [{ assetId, amount: amount.toString() }],
        //todo обрати внимание как можно было короче вместить json чтобы было меньше строк
        call: { function: "supply", args: [] }
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
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Oops, transaction is not completed"
        });
      })
      .then(() => {
        accountStore.updateAccountAssets(true);
        lendStore.syncPoolsStats();
      });
  };

  submitWithdraw = async (
    amount: BN,
    assetId: string,
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
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Oops, transaction is not completed"
        });
      })
      .then(() => {
        accountStore.updateAccountAssets(true);
        lendStore.syncPoolsStats();
      });
  };

  submitRepay = async (
    amount: BN,
    assetId: string,
    contractAddress: string
  ) => {
    const { accountStore, notificationStore, lendStore } = this.rootStore;
    if (lendStore.poolId == null) return;

    await accountStore
      .invoke({
        dApp: contractAddress,
        payment: [{ assetId, amount: amount.toString() }],
        call: { function: "repay", args: [] }
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
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Oops, transaction is not completed"
        });
      })
      .then(() => {
        accountStore.updateAccountAssets(true);
        lendStore.syncPoolsStats();
      });
  };
}
