import { RootStore } from "./index";
import { makeAutoObservable, reaction } from "mobx";
import marketService, { IMarketConfig } from "@src/services/marketsSeervice";
import BN from "@src/utils/BN";
import { IData } from "@src/entities/Market";

export type TMarketState = {
  state: IData[];
  contractAddress: string;
};

export type TUserState = {
  marketId: string;
  borrowed: any[];
  supplied: any[];
};

export interface ISerializedMarketsStore {
  slippage: number;
}

export default class MarketsStore {
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    // this.syncMarkets().then(() => this.setInitialized(true));
    Promise.all([this.updateUserDataState(), this.syncMarkets()]).then(() =>
      this.setInitialized(true)
    );
    setInterval(this.syncMarkets, 15 * 1000);
    reaction(
      () => this.rootStore.accountStore.address,
      () => Promise.all([this.updateUserDataState()])
    );
  }

  initialized = false;
  private setInitialized = (v: boolean) => (this.initialized = v);

  public rootStore: RootStore;

  markets: IMarketConfig[] = [];
  setMarkets = (markets: IMarketConfig[]) => (this.markets = markets);

  getMarketByContractAddress = (v: string) =>
    this.markets.find((market) => market.contractAddress === v);

  public userState: TUserState[] | null = null;
  private setUserState = (value: TUserState[]) => (this.userState = value);

  syncMarkets = async () => {
    const configs = await marketService.getMarkets();
    this.setMarkets(configs);
  };

  //todo add types
  updateUserDataState = async () => {
    const address = this.rootStore.accountStore.address;
    const state = await marketService.getMarketsStateByUserAddress(address);
    const userState = state.reduce((acc, v) => {
      const borrowed = v.state
        .filter(({ key, value }) => key.includes("_totalSupplied"))
        .reduce((bAcc, b) => {
          const bTokenId = b.key.split("_")[0];
          return [...bAcc, { assetId: bTokenId, value: b.value }];
        }, [] as any);
      const supplied = v.state
        .filter(({ key }) => key.includes("_totalBorrowed"))
        .reduce((sAcc, s) => {
          const sTokenId = s.key.split("_")[0];
          return [...sAcc, { assetId: sTokenId, value: s.value }];
        }, [] as any);
      return [
        ...acc,
        {
          marketId: v.contractAddress,
          borrowed,
          supplied
        }
      ];
    }, [] as TUserState[]);
    this.setUserState(userState);
  };

  get totalBorrowed() {
    return this.markets.reduce(
      (acc, v) => new BN(v.statistics?.totalBorrowed ?? 0).plus(acc),
      BN.ZERO
    );
  }

  get totalSupplied() {
    return this.markets.reduce(
      (acc, v) => new BN(v.statistics?.totalSupplied ?? 0).plus(acc),
      BN.ZERO
    );
  }

  assetPrice = (assetId: string): BN | null => {
    const market = this.markets.find(({ assets }) => assets?.includes(assetId));
    if (market == null) return null;
    const price = market.prices?.find((v) => v.assetId === assetId);
    return price == null ? null : new BN(price.min);
  };
}
