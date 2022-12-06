import { RootStore } from "./index";
import { makeAutoObservable, reaction } from "mobx";
import Market, { IData } from "@src/entities/Market";
import marketService, { IMarketWithStats } from "@src/services/marketsSeervice";
import BN from "@src/utils/BN";

export type TMarketState = {
  state: IData[];
  contractAddress: string;
};
export type TMarketsStatistic = {
  totalBorrowed: BN | null;
  totalSupplied: BN | null;
};

export interface ISerializedMarketsStore {
  slippage: number;
}

export default class MarketsStore {
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    Promise.all([this.syncMarkets(), this.syncMarketsStatistic()]).then(() =>
      this.setInitialized(true)
    );
    //todo add more
    setInterval(this.syncMarkets, 15 * 1000);
    reaction(
      () => this.rootStore.accountStore.address,
      () => Promise.all([this.updateMarketsState()])
    );
  }

  initialized = false;
  private setInitialized = (v: boolean) => (this.initialized = v);

  marketsStatistic: TMarketsStatistic = {
    totalBorrowed: null,
    totalSupplied: null
  };
  setMarketsStatistic = (b: string, s: string) =>
    (this.marketsStatistic = {
      totalBorrowed: new BN(b),
      totalSupplied: new BN(s)
    });

  public rootStore: RootStore;

  markets: IMarketWithStats[] = [];
  setMarkets = (markets: IMarketWithStats[]) => (this.markets = markets);

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

  syncMarketsStatistic = async () => {
    // const state = await marketService.getStats();
    console.log("syncMarketsStatistic");
    this.setMarketsStatistic("35000", "45000");
  };
}
