import { RootStore } from "./index";
import { makeAutoObservable, reaction } from "mobx";
import { IData } from "@src/entities/Market";
import marketService, { IMarketConfig } from "@src/services/marketsSeervice";
import BN from "@src/utils/BN";

export type TMarketState = {
  state: IData[];
  contractAddress: string;
};

export interface ISerializedMarketsStore {
  slippage: number;
}

export default class MarketsStore {
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.syncMarkets().then(() => {
      console.log("MarketsStore- markets", this.markets.length);
      this.setInitialized(true);
    });
    //todo add more
    setInterval(this.syncMarkets, 15 * 1000);
    reaction(
      () => this.rootStore.accountStore.address,
      () => Promise.all([this.updateMarketsState()])
    );
  }

  initialized = false;
  private setInitialized = (v: boolean) => (this.initialized = v);

  public rootStore: RootStore;

  markets: IMarketConfig[] = [];
  setMarkets = (markets: IMarketConfig[]) => (this.markets = markets);

  getMarketByContractAddress = (v: string) =>
    this.markets.find((market) => market.contractAddress === v);

  public marketsState: TMarketState[] | null = null;
  private setMarketState = (value: TMarketState[]) =>
    (this.marketsState = value);

  syncMarkets = async () => {
    const configs = await marketService.getMarkets();
    this.setMarkets(configs);
  };

  updateMarketsState = async () => {
    const address = this.rootStore.accountStore.address;
    const state = await marketService.getMarketsStateByUserAddress(address);
    this.setMarketState(state);
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
}
