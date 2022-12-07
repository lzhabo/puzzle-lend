import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import {
  EXPLORER_URL,
  OPERATIONS_TYPE,
  TOKENS_BY_SYMBOL
} from "@src/constants";
import BN from "@src/utils/BN";
import Market, { TMarketStats } from "@src/entities/Market";

const notifications = {
  [OPERATIONS_TYPE.WITHDRAW]: `The withdrawal is successful! You can view the transaction on Waves Explorer`,
  [OPERATIONS_TYPE.SUPPLY]: `You successfully supplied assets! You can view the transaction on Waves Explorer`,
  [OPERATIONS_TYPE.REPAY]: `You successfully repaid your loan! You can view the transaction on Waves Explorer`,
  [OPERATIONS_TYPE.BORROW]: `You successfully borrowed some money! You can view the transaction on Waves Explorer`
};

type UrlParamsTypes = {
  tokenId: string;
  marketId: string;
};

const ctx = React.createContext<MarketModalVM | null>(null);

export const useMarketModalVM = () => useVM(ctx);

export const MarketModalVMProvider: React.FC<{
  operationName: OPERATIONS_TYPE;
  urlParams: UrlParamsTypes;
  market: Market | null;
}> = ({ operationName, urlParams, market, children }) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new MarketModalVM(rootStore, operationName, urlParams, market),
    [rootStore, operationName, urlParams, market]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

class MarketModalVM {
  rootStore: RootStore;

  constructor(
    rootStore: RootStore,
    operationName: OPERATIONS_TYPE,
    urlParams: UrlParamsTypes,
    market: Market | null
  ) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.urlParams = urlParams;
    market && this.setMarket(market);
    this.setOperationName(operationName);
  }

  market: Market | null = null;
  setMarket = (v: Market | null) => (this.market = v);

  urlParams: UrlParamsTypes;
  setUrlParams = (params: UrlParamsTypes) => {
    this.urlParams = params;
  };

  modalAmount = BN.ZERO;
  setVMamount = (amount: BN) => {
    this.modalAmount = amount;
  };

  isDollar = false;
  setVMisDollar = (isDollar: boolean) => {
    this.isDollar = isDollar;
  };

  dashboardModalStep: 0 | 1 = 0;
  setMarketModalStep = (step: 0 | 1) => {
    this.dashboardModalStep = step;
  };

  borrowAmount = BN.ZERO;
  setBorrowAmount = (amount: BN) => (this.borrowAmount = amount);

  modalBtnErrorText = "";
  setError = (error: string) => (this.modalBtnErrorText = error);

  operationName: OPERATIONS_TYPE = OPERATIONS_TYPE.SUPPLY;
  setOperationName = (operation: OPERATIONS_TYPE) =>
    (this.operationName = operation);

  accountHealth = 100;
  setAccountHealth = (health: number) => (this.accountHealth = health);

  get modalWarningText(): string | null {
    if (
      this.operationName === OPERATIONS_TYPE.BORROW &&
      this.countBorrowAccountHealth(this.borrowAmount) < 30
    ) {
      return "In case of market insolvency borrow limit of assets may decrease which may cause liquidation of your assets";
    }

    if (
      this.operationName === OPERATIONS_TYPE.SUPPLY &&
      !this.token?.supplyLimit.eq(0)
    ) {
      const minPrice = this.token?.prices.min;
      if (minPrice == null) return null;

      const currentVal = this.isDollar
        ? BN.formatUnits(this.modalFormattedVal, this.token?.decimals).times(
            this.token?.prices.min ?? 0
          )
        : BN.formatUnits(this.modalFormattedVal, this.token?.decimals);

      const reservesConverted = this.isDollar
        ? this.poolTotalReserves.times(minPrice)
        : this.poolTotalReserves.div(minPrice);

      const limitConverted = this.isDollar
        ? this.token?.supplyLimit
        : this.token?.supplyLimit.div(minPrice);
      if (limitConverted == null) return null;
      const staticLimit = limitConverted.minus(reservesConverted);

      const dynamicLimit = limitConverted.minus(
        reservesConverted.plus(currentVal)
      );

      if (dynamicLimit.lt(0)) {
        this.setError(
          `Should be less than ${staticLimit.toFixed(2)} ${this.currentSymbol}`
        );
      }
      if (
        reservesConverted.gt(limitConverted.times(0.5)) &&
        reservesConverted.lt(limitConverted)
      ) {
        return `There are ${dynamicLimit.toFixed(2)} ${
          this.currentSymbol
        } left to the limit. You can provide this amount or less`;
      }

      return null;
    }

    return null;
  }

  get borrowLink() {
    return {
      href: "https://puzzle-lend.gitbook.io/guidebook/suppliers-guide/safety-features",
      text: "Learn more"
    };
  }

  get currentSymbol() {
    return this.isDollar ? "$" : this.token?.symbol;
  }

  get currentMarketId() {
    //fixme
    return BN.ZERO;
    // return this.rootStore.lendStore.marketId;
  }

  get userHealth() {
    return BN.ZERO;
  }

  get userCollateral() {
    return BN.ZERO;
    // return this.rootStore.lendStore.userCollateral;
  }

  get tokenBalance(): BN {
    return (
      this.rootStore.accountStore.balances.find(
        (tokenData) => tokenData.assetId === this.urlParams?.tokenId
      )?.balance ?? BN.ZERO
    );
  }

  //todo check
  get token(): TMarketStats | undefined {
    return this.market?.marketStats.find(
      (_) => _.assetId === this.urlParams.tokenId
    );
  }

  // REPAY MODAL
  get userRepayAmount(): string {
    const token = this.token;
    if (token == null) return "0";
    const val = !this.isDollar
      ? this.token?.selfBorrow.minus(this.modalFormattedVal)
      : BN.formatUnits(
          token.selfBorrow
            .minus(this.modalFormattedVal)
            .times(token?.prices?.min),
          this.token?.decimals
        ).toFormat(2);

    if (this.token?.selfBorrow.eq(0)) return "0";

    return BN.formatUnits(val ?? 0, this.token?.decimals).toFormat(2);
  }

  get countMaxBtn() {
    let selfVal = BN.ZERO;
    const token = this.token;
    if (token == null) return selfVal;

    if (this.operationName === OPERATIONS_TYPE.WITHDRAW) {
      selfVal = token?.selfSupply;
    }
    if (this.operationName === OPERATIONS_TYPE.REPAY) {
      selfVal = BN.min(this.tokenBalance, token.selfBorrow);
    }
    if (this.operationName === OPERATIONS_TYPE.SUPPLY) {
      selfVal = this.tokenBalance;
    }

    //fixme
    const isWavesMarket = false;

    const reservesConverted = this.isDollar
      ? this.poolTotalReserves.times(token?.prices.min)
      : this.poolTotalReserves.div(token?.prices.min);

    const limitConverted = this.isDollar
      ? token?.supplyLimit
      : token?.supplyLimit.div(token?.prices.min);

    const dynamicLimit = limitConverted.minus(reservesConverted);
    const isUSDN = token.assetId === TOKENS_BY_SYMBOL.USDN.assetId;
    const isWAVES = token.assetId === TOKENS_BY_SYMBOL.WAVES.assetId;

    let countVal = BN.min(
      dynamicLimit.times(new BN(10, 10).pow(token?.decimals)),
      selfVal
    );

    if (!isWavesMarket || isUSDN || isWAVES) countVal = selfVal;

    return countVal.toDecimalPlaces(0, 2);
  }

  get modalFormattedVal() {
    const countVal = !this.isDollar
      ? this.modalAmount
      : this.modalAmount.div(this.token?.prices?.min ?? 0);

    return countVal;
  }

  get onNativeChange(): BN {
    if (this.token == null) return BN.ZERO;
    return this.isDollar
      ? this.modalAmount.div(this.token?.prices?.min)
      : this.modalAmount.times(this.token?.prices?.min);
  }

  get staticMaximum(): BN {
    if (this.token == null) return BN.ZERO;
    return this.isDollar
      ? BN.formatUnits(this.userCollateral, 6).times(this.token?.lt)
      : BN.formatUnits(this.userCollateral, 6)
          .div(this.token?.prices.min)
          .times(this.token?.lt);
  }

  get staticTokenAmount(): BN {
    if (this.token == null) return BN.ZERO;
    return !this.isDollar
      ? this.tokenBalance
      : this.tokenBalance.times(this.token?.prices?.min);
  }

  //in native token
  get poolTotalReservesInToken(): BN {
    if (!this.token?.totalSupply || !this.token?.totalBorrow) return BN.ZERO;
    const reserves = this.token?.totalSupply?.minus(this.token?.totalBorrow);

    return BN.formatUnits(reserves, this.token?.decimals);
  }

  //in USD
  get poolTotalReserves(): BN {
    if (!this.token?.totalSupply || !this.token?.totalBorrow) return BN.ZERO;
    const reserves = this.token?.totalSupply?.minus(this.token?.totalBorrow);

    return this.isDollar
      ? BN.formatUnits(reserves, this.token?.decimals)
      : BN.formatUnits(reserves, this.token?.decimals).times(
          this.token?.prices?.min
        );
  }

  // BORROW MODAL
  get countUserBalance(): string {
    return (
      BN.formatUnits(this.staticTokenAmount, this.token?.decimals).toFormat(
        4
      ) ?? "0"
    );
  }

  get userDailyIncome(): BN {
    if (this.token == null) return BN.ZERO;
    const UR = this.token?.totalBorrow.div(this.token?.totalSupply);
    const supplyInterest = this.token?.interest.times(UR).times(0.8);
    if (supplyInterest.isNaN()) return BN.ZERO;
    return BN.formatUnits(this.modalAmount, this.token?.decimals).times(
      supplyInterest
    );
  }

  triggerMaxClickFunc = (amount: BN) => {
    const { accountStore } = this.rootStore;

    const getAssetData = accountStore.balances.find(
      (tokenData) => tokenData.assetId === this.urlParams.tokenId
    );

    if (this.operationName === OPERATIONS_TYPE.SUPPLY && !getAssetData) return;

    this.setVMamount(amount);
  };

  // BORROW MODAL
  countBorrowAccountHealth = (currentBorrow: BN) => {
    if (currentBorrow.eq(0)) {
      this.setAccountHealth(100);
      return 100;
    }
    if (this.token == null) return BN.ZERO;
    const currentBorrowAmount = !this.isDollar
      ? BN.formatUnits(currentBorrow, this.token?.decimals)
      : BN.formatUnits(currentBorrow, this.token?.decimals).div(
          this.token?.prices?.min
        );

    const bc = this.market?.marketStats.reduce(
      (acc: BN, stat: TMarketStats) => {
        const deposit = BN.formatUnits(stat.selfSupply, stat.decimals);
        if (deposit.eq(0)) return acc;
        const cf = stat.cf;
        const assetBc = cf.times(1).times(deposit).times(stat.prices.min);
        return acc.plus(assetBc);
      },
      BN.ZERO
    );

    let bcu = this.market?.marketStats.reduce((acc: BN, stat: TMarketStats) => {
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

    //todo check
    // if (bcu == null) return 0;

    // case when user didn't borrow anything
    if (bcu == null || bcu.eq(0))
      bcu = currentBorrowAmount
        .times(this.token?.prices.max)
        .div(this.token?.lt)
        .plus(bcu ?? 0);

    const accountHealth: BN = new BN(1).minus(bcu.div(bc ?? 0)).times(100);

    if (bcu.lt(0) || accountHealth.lt(0)) {
      this.setAccountHealth(0);
      return 0;
    }

    this.setAccountHealth(+accountHealth);
    return +accountHealth;
  };

  // counting maximum amount for MAX btn
  userMaximumToBorrowBN = () => {
    if (this.token == null) return BN.ZERO;
    const maximum = this.isDollar
      ? BN.formatUnits(this.userCollateral, 6).times(this.token?.lt)
      : BN.formatUnits(this.userCollateral, 6)
          .times(this.token?.lt)
          .div(this.token?.prices.max);
    // current recommended maximum borrow, no more than 80% of health
    const val = maximum.times(10 ** this.token.decimals).times(0.8);

    let isError = false;

    // cause if market liquidity lower, asset cant provide requested amount of money to user
    if (this.poolTotalReserves.lt(maximum)) {
      this.setError("Not enough Reserves in Market");
      isError = true;
      return val;
    }

    if (this.countBorrowAccountHealth(val) < 1) {
      this.setError(`Account health less than 1%, risk of liquidation`);
      isError = true;
    }

    if (!isError) this.setError("");
    return val;
  };

  borrowChangeAmount = (v: BN) => {
    this.setBorrowAmount(v);

    const formattedVal = BN.formatUnits(v, this.token?.decimals);

    // if !isNative, show maximum in dollars, collateral in dollars by default
    if (this.token == null) return BN.ZERO;
    const maxCollateral = this.isDollar
      ? BN.formatUnits(this.userCollateral, 6)
      : BN.formatUnits(this.userCollateral, 6).div(this.token?.prices?.min);

    let isError = false;

    if (maxCollateral.isLessThanOrEqualTo(formattedVal)) {
      this.setError("Borrow amount less than your Collateral");
      isError = true;
    }

    if (this.poolTotalReserves.isLessThanOrEqualTo(formattedVal)) {
      this.setError("Not enough Reserves in Market");
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
  countWithdrawAccountHealth = (currentWithdraw: BN) => {
    if (this.token == null || this.market == null) return BN.ZERO;
    const currentWithdrawAmount = !this.isDollar
      ? currentWithdraw
      : currentWithdraw.div(this.token?.prices?.min);

    let bc = this.market.marketStats.reduce((acc: BN, stat: TMarketStats) => {
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

    const bcu = this.market.marketStats.reduce(
      (acc: BN, stat: TMarketStats) => {
        const borrow = BN.formatUnits(stat.selfBorrow, stat.decimals);
        const lt = stat.lt;
        let assetBcu = borrow.times(stat.prices.max).div(lt);
        return acc.plus(assetBcu);
      },
      BN.ZERO
    );

    const accountHealth = new BN(1).minus(bcu.div(bc)).times(100);

    //todo check
    if (bc == null || bc.lt(0) || accountHealth.lt(0)) {
      this.setAccountHealth(0);
      return 0;
    }

    this.setAccountHealth(+accountHealth);
    return +accountHealth;
  };

  withdrawChangeAmount = (v: BN) => {
    const selfSupply = !this.isDollar
      ? this.token?.selfSupply
      : this.token?.selfSupply.times(this.token?.prices?.min);

    // need more review here
    const formattedVal = v.minus(100);
    let isError = false;

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
    if (this.token == null) return BN.ZERO;
    const walletBalance = !this.isDollar
      ? this.tokenBalance
      : this.tokenBalance.times(this.token?.prices?.min);

    const forRepay = !this.isDollar
      ? this.token?.selfBorrow
      : this.token?.selfBorrow.times(this.token?.prices?.min);

    let isError = false;

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
    if (this.token == null) return BN.ZERO;
    const formattedVal = BN.formatUnits(v, this.token?.decimals);
    const walletBal = !this.isDollar
      ? BN.formatUnits(this.tokenBalance, this.token?.decimals)
      : BN.formatUnits(this.tokenBalance, this.token?.decimals).times(
          this.token?.prices?.min
        );

    let isError = false;

    if (formattedVal.gt(walletBal)) {
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
  ): Promise<boolean> => {
    const { accountStore } = this.rootStore;
    let result = Promise.resolve(false);
    if (this.market == null) return result;
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
        this.showNotify(txId, OPERATIONS_TYPE.BORROW);
        result = Promise.resolve(true);
      })
      .catch((e) => {
        this.showErrorNotify(e);
        result = Promise.resolve(false);
      })
      .finally(() => {
        accountStore.updateAccountAssets(true);
        // lendStore.syncMarketsStats();
      });

    return result;
  };

  submitSupply = async (
    amount: BN,
    assetId: string,
    contractAddress: string
  ): Promise<boolean> => {
    //fixme
    const { accountStore } = this.rootStore;
    let result = Promise.resolve(false);
    if (this.market == null) return result;

    await accountStore
      .invoke({
        dApp: contractAddress,
        payment: [{ assetId, amount: amount.toString() }],
        call: { function: "supply", args: [] }
      })
      .then((txId) => {
        this.showNotify(txId, OPERATIONS_TYPE.SUPPLY);
        result = Promise.resolve(true);
      })
      .catch((e) => {
        this.showErrorNotify(e);
        result = Promise.resolve(false);
      })
      .then(() => {
        accountStore.updateAccountAssets(true);
        // lendStore.syncMarketsStats();
      });

    return result;
  };

  submitWithdraw = async (
    amount: BN,
    assetId: string,
    contractAddress: string
  ): Promise<boolean> => {
    const { accountStore } = this.rootStore;
    //fixme
    let result = Promise.resolve(false);
    if (this.market == null) return result;

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
        this.showNotify(txId, OPERATIONS_TYPE.WITHDRAW);
        result = Promise.resolve(true);
      })
      .catch((e) => {
        this.showErrorNotify(e);
        result = Promise.resolve(false);
      })
      .then(() => {
        accountStore.updateAccountAssets(true);
        // lendStore.syncMarketsStats();
      });

    return result;
  };

  submitRepay = async (
    amount: BN,
    assetId: string,
    contractAddress: string
  ): Promise<boolean> => {
    const { accountStore } = this.rootStore;
    let result = Promise.resolve(false);
    if (this.market == null) return result;

    await accountStore
      .invoke({
        dApp: contractAddress,
        payment: [{ assetId, amount: amount.toString() }],
        call: { function: "repay", args: [] }
      })
      .then((txId) => {
        this.showNotify(txId, OPERATIONS_TYPE.REPAY);
        result = Promise.resolve(true);
      })
      .catch((e) => {
        this.showErrorNotify(e);
        result = Promise.resolve(false);
      })
      .then(() => {
        accountStore.updateAccountAssets(true);
      });

    return result;
  };

  showNotify = (txId: string | null, operationName: OPERATIONS_TYPE) => {
    this.rootStore.notificationStore.notify(notifications[operationName], {
      type: "success",
      title: `Success`,
      link: `${EXPLORER_URL}/tx/${txId}`,
      linkTitle: "View on Explorer"
    });
  };

  showErrorNotify = (e: any) => {
    this.rootStore.notificationStore.notify(e.message ?? JSON.stringify(e), {
      type: "error",
      title: "Oops, transaction is not completed"
    });
  };
}
