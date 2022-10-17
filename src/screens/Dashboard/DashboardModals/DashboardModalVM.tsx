import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, action } from "mobx";
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

  // fixme
  //  Тут лучше сделать undefined или ""
  //  переименуй в modalErrorText, это ведь не Error класс
  modalError?: string;
  accountHealth = 100;

  setOperationName = (operation: OPERATIONS_TYPE) =>
    (this.operationName = operation);

  //fixme
  // Убрать @action.bound
  // На будущее: если ты не знаешь для чего используется что-то, то лучше это не использовать
  @action.bound setError = (error: string) => (this.modalError = error);
  @action.bound setAccountHealth = (health: number) =>
    (this.accountHealth = health);

  //fixme старайся писать код так, чтоб он занимал минимум строк и при этом не терял читсемость
  // переделай геттеры по образцу currentPoolId
  get currentPoolId() {
    return this.rootStore.lendStore.poolId;
  }

  get userHealth() {
    const { lendStore } = this.rootStore;
    return lendStore.health;
  }

  get userCollateral() {
    const { lendStore } = this.rootStore;
    return lendStore.userCollateral;
  }

  get getTokenBalance(): BN {
    const { accountStore } = this.rootStore;

    // fixme нельзя использовать any, убери
    //  сделай геттер в одну строчку
    const getAssetData = accountStore.balances.find(
      (tokenData) => tokenData.assetId === this.urlParams?.tokenId
    );

    return getAssetData?.balance || BN.ZERO;
  }

  // fixme
  //  getToken - это функция
  //  переименуй в token
  //  сделай так во всех геттерах
  get getToken(): TPoolStats {
    const { lendStore } = this.rootStore;

    // not sure
    return lendStore.poolsStats.find(
      (_) => _.assetId === this.urlParams.tokenId
    )!;
  }

  // REPAY MODAL
  get getUserRepay(): string {
    let val = this.getToken?.selfBorrow.minus(this.getFormattedVal);

    if (this.getToken?.selfBorrow.eq(0)) return "0";

    if (this.isDollar)
      return this.formatVal(
        val.times(this.getToken?.prices?.min),
        this.getToken?.decimals
      ).toFormat(2);

    return this.formatVal(val, this.getToken?.decimals).toFormat(2);
  }

  get getMaxBtn() {
    let selfVal = BN.ZERO;
    //fixme оборачивай тело в ковыычки если if не помещается на одну строку
    if (this.operationName === OPERATIONS_TYPE.WITHDRAW)
      selfVal = this.getToken?.selfSupply;
    if (this.operationName === OPERATIONS_TYPE.REPAY)
      selfVal = this.getToken?.selfBorrow;
    if (this.operationName === OPERATIONS_TYPE.SUPPLY)
      selfVal = this.getTokenBalance;

    //
    let countVal = selfVal;
    if (this.isDollar) countVal = countVal.times(this.getToken?.prices?.min);

    return countVal.toDecimalPlaces(0, 2);
  }

  get getFormattedVal() {
    let countVal = this.modalAmount;

    if (this.isDollar) countVal = countVal.div(this.getToken?.prices?.min);

    return countVal;
  }

  get getOnNativeChange(): BN {
    let countVal = this.modalAmount;

    if (this.isDollar) countVal = countVal.div(this.getToken?.prices?.min);
    else countVal = countVal.times(this.getToken?.prices?.min);

    return countVal;
  }

  // BORROW MODAL
  // counting maximum after USER INPUT
  get userMaximumToBorrow(): BN {
    let maximum = this.formatVal(this.userCollateral, 6);

    if (!this.isDollar)
      maximum = this.formatVal(this.userCollateral, 6).div(
        this.getToken?.prices.min
      );

    maximum = maximum.times(this.getToken?.lt);

    const totalReserves = this.formatVal(
      this.getToken?.totalSupply,
      this.getToken?.decimals
    ).minus(
      this.formatVal(this.getToken?.totalBorrow, this.getToken?.decimals)
    );

    // cause if market liquidity lower, asset cant provide requested amount of money to user
    if (totalReserves.lt(maximum)) {
      return totalReserves.minus(
        this.formatVal(this.modalAmount, this.getToken?.decimals)
      );
    }

    return maximum.minus(
      this.formatVal(this.modalAmount, this.getToken?.decimals)
    );
  }

  get getReserves(): string {
    const reserves = this.getToken?.totalSupply.minus(
      this.getToken?.totalBorrow
    );
    return this.formatVal(reserves, this.getToken?.decimals).toFormat(2);
  }

  //fixme  не нужно писать в названии геттера get
  get getUserBalance(): string {
    let val = this.getTokenBalance;

    if (this.isDollar) val = val.times(this.getToken?.prices?.min);
    if (this.operationName === OPERATIONS_TYPE.WITHDRAW) {
      val = this.formatVal(val.plus(this.modalAmount), this.getToken?.decimals);
    }
    if (this.operationName === OPERATIONS_TYPE.SUPPLY) {
      val = this.formatVal(
        val.minus(this.modalAmount),
        this.getToken?.decimals
      );
    }

    return val.toFormat(4) || "0";
  }

  get getDailyIncome(): BN {
    return (
      this.getToken?.interest.times(
        this.formatVal(this.modalAmount, this.getToken?.decimals)
      ) || BN.ZERO
    );
  }

  formatVal = (valArg: BN | number, decimal: number) => {
    return BN.formatUnits(valArg, decimal);
  };

  setVMamount = (amount: BN) => {
    this.modalAmount = amount;
  };

  setVMisDollar = (isDollar: boolean) => {
    this.isDollar = isDollar;
  };

  setUrlParams = (params: UrlParamsTypes) => {
    this.urlParams = params;
  };

  // BORROW MODAL
  countBorrowAccountHealth = (currentBorrow: BN) => {
    const { lendStore } = this.rootStore;

    if (currentBorrow.eq(0)) {
      this.setAccountHealth(100);
      return 100;
    }

    let currentBorrowAmount = this.formatVal(
      currentBorrow,
      this.getToken?.decimals
    );

    if (this.isDollar)
      currentBorrowAmount = currentBorrowAmount.div(this.getToken?.prices?.min);
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
      if (stat.assetId === this.getToken?.assetId) {
        assetBcu = this.formatVal(stat.selfBorrow, stat.decimals)
          .plus(currentBorrowAmount)
          .times(stat.prices.max)
          .div(lt);
      }

      return acc.plus(assetBcu);
    }, BN.ZERO);

    // case when user did'nt borrow anything
    if (bcu.eq(0))
      bcu = currentBorrowAmount
        .times(this.getToken?.prices.max)
        .div(this.getToken?.lt)
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
    let maximum = BN.ZERO;
    let isError = false;

    maximum = this.formatVal(this.userCollateral, 6);
    maximum = maximum.times(this.getToken?.lt);

    if (!this.isDollar) maximum = maximum.div(this.getToken?.prices.max);
    const totalReserves = this.getToken?.totalSupply.minus(
      this.getToken?.totalBorrow
    );

    // cause if market liquidity lower, asset cant provide requested amount of money to user
    if (this.formatVal(totalReserves, 6).lt(maximum)) {
      this.setError("Not enough Reserves in Pool");
      isError = true;
      return totalReserves.times(0.8);
    }

    // current recommended maximum borrow, no more than 80% of health
    const val = maximum.times(10 ** this.getToken.decimals).times(0.8);

    if (this.countBorrowAccountHealth(val) < 1) {
      this.setError(`Account health less than 1%, risk of liquidation`);
      isError = true;
    }

    if (!isError) this.setError("");
    return val;
  };

  borrowChangeAmount = (v: BN) => {
    const formattedVal = this.formatVal(v, this.getToken?.decimals);
    // if !isNative, show maximum in dollars, collateral in dollars by default
    let maxCollateral = this.formatVal(this.userCollateral, 6);
    // reserves in crypto amount by default
    let totalReserves = this.getToken?.totalSupply.minus(
      this.getToken?.totalBorrow
    );
    let isError = false;

    if (!this.isDollar)
      maxCollateral = this.formatVal(this.userCollateral, 6).div(
        this.getToken?.prices?.min
      );

    if (this.isDollar)
      totalReserves = totalReserves.times(this.getToken?.prices?.min);

    if (maxCollateral.isLessThanOrEqualTo(formattedVal)) {
      this.setError("Borrow amount less than your Collateral");
      isError = true;
    }

    if (this.formatVal(totalReserves, 6).isLessThanOrEqualTo(formattedVal)) {
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
        this.getToken?.prices?.min
      );

    const bc = lendStore.poolsStats.reduce((acc: BN, stat: TPoolStats) => {
      const deposit = this.formatVal(stat.selfSupply, stat.decimals);
      if (deposit.eq(0)) return acc;
      const cf = stat.cf;
      let assetBc = cf.times(1).times(deposit).times(stat.prices.min);

      if (stat.assetId === this.getToken?.assetId) {
        assetBc = this.formatVal(
          stat.selfSupply.minus(currentWithdrawAmount),
          stat.decimals
        )
          .times(stat.prices.min)
          .times(cf);
      }

      return acc.plus(assetBc);
    }, BN.ZERO);

    //fixme to const
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
    let selfSupply = this.getToken?.selfSupply;

    if (this.isDollar)
      selfSupply = selfSupply.times(this.getToken?.prices?.min);

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
    let walletBalance = this.getTokenBalance;
    let forRepay = this.getToken?.selfBorrow;

    if (this.isDollar && walletBalance && forRepay) {
      walletBalance = walletBalance.times(this.getToken?.prices?.min);
      forRepay = forRepay.times(this.getToken?.prices?.min);
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
    const formattedVal = this.formatVal(v, this.getToken?.decimals);
    let walletBal = this.formatVal(
      this.getTokenBalance,
      this.getToken?.decimals
    );
    //todo  зачем юзать столько много let если можно обойтись const
    let isError = false;

    if (!this.isDollar) walletBal = walletBal.times(this.getToken?.prices?.min);

    if (walletBal.lt(formattedVal)) {
      this.setError("Wallet Balance too low");
      isError = true;
    }

    if (!isError) this.setError("");
    this.setVMamount(v);
  };

  submitBorrow = async (amount: any, assetId: any, contractAddress: string) => {
    const { accountStore, notificationStore, lendStore } = this.rootStore;
    if (lendStore.poolId == null) return;
    // fixme слишком много строк на вызовах, надо придумать как оптимизировать, сложно читать такой код
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
      //fixme либо делай finally, либо в первый then перенеси
      // в таком случае await не нужен, сделай так
      // .finally(() => accountStore.updateAccountAssets(true));
      .finally(async () => {
        await accountStore.updateAccountAssets(true);
      });
  };

  submitSupply = async (amount: any, assetId: any, contractAddress: string) => {
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
      .then(async () => {
        await accountStore.updateAccountAssets(true);
      });
  };
}
