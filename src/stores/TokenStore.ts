import RootStore from "@stores/RootStore";
import { makeAutoObservable } from "mobx";
import { TOKENS_BY_ASSET_ID, TOKENS_LIST } from "@src/constants";
import wavesCapService from "@src/services/wavesCapService";
import BN from "@src/utils/BN";

export interface ISerializedTokenStore {
  watchList: string[];
}

export type TTokenStatistics = {
  assetId: string;
  decimals: number;
  name: string;
  symbol: string;
  totalSupply: BN;
  circulatingSupply: BN;
  totalBurned: BN;
  fullyDilutedMC: BN;
  marketCap: BN;
  currentPrice: BN;
  change24H: BN;
  change24HUsd: BN;
  volume24: BN;
  changeStr: string;
};

export default class TokenStore {
  public rootStore: RootStore;

  initialized: boolean = false;
  private setInitialized = (v: boolean) => (this.initialized = v);

  statistics: Array<TTokenStatistics> = [];
  private setStatistics = (v: Array<TTokenStatistics>) => (this.statistics = v);

  get statisticsByAssetId() {
    return this.statistics.reduce(
      (acc, stats) => ({ ...acc, [stats.assetId]: stats }),
      {} as Record<string, TTokenStatistics>
    );
  }

  public watchList: string[];
  public addToWatchList = (assetId: string) => this.watchList.push(assetId);
  public removeFromWatchList = (assetId: string) => {
    const index = this.watchList.indexOf(assetId);
    index !== -1 && this.watchList.splice(index, 1);
  };

  private syncTokenStatistics = async () => {
    const { notificationStore } = this.rootStore;
    const assets = TOKENS_LIST.map(({ assetId }) => assetId);
    const stats = await wavesCapService.getAssetsStats(assets).catch((e) => {
      notificationStore.notify(e.message ?? e.toString(), {
        type: "error",
      });
      return [];
    });
    const statistics = stats.map((details) => {
      const asset = TOKENS_BY_ASSET_ID[details.id] ?? details.precision;
      const decimals = asset.decimals;
      const firstPrice = new BN(details.data?.["firstPrice_usd-n"] ?? 0);
      const currentPrice = new BN(details.data?.["lastPrice_usd-n"] ?? 0);

      const totalSupply = BN.formatUnits(details.totalSupply, decimals);
      const circulatingSupply = BN.formatUnits(details.circulating, decimals);

      const change24H = currentPrice.div(firstPrice).minus(1).times(100);
      const change24HUsd = change24H.div(100).times(currentPrice);

      const changePrefix = change24H?.gte(0) ? "+" : "-";
      const formatChange24HUsd = change24HUsd
        ?.times(change24H?.gte(0) ? 1 : -1)
        .toFormat(2);
      const formatChange24H = change24H
        ?.times(change24H?.gte(0) ? 1 : -1)
        .toFormat(2);
      const changeStr = `${changePrefix} $${formatChange24HUsd} (${formatChange24H}%)`;
      return {
        assetId: details.id,
        decimals,
        name: details.name,
        symbol: details.shortcode,
        totalSupply,
        circulatingSupply: BN.formatUnits(details.circulating, decimals),
        change24H,
        change24HUsd,
        currentPrice,
        changeStr,
        fullyDilutedMC: totalSupply.times(currentPrice),
        marketCap: circulatingSupply.times(currentPrice),
        totalBurned: totalSupply.minus(circulatingSupply),
        volume24: new BN(details["24h_vol_usd-n"]),
      };
    });
    this.setStatistics(statistics);
  };

  constructor(rootStore: RootStore, initState?: ISerializedTokenStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.watchList = initState?.watchList ?? [];
    Promise.all([this.syncTokenStatistics()]).then(() =>
      this.setInitialized(true)
    );
    setInterval(this.syncTokenStatistics, 60 * 1000);
  }

  serialize = (): ISerializedTokenStore => ({
    watchList: this.watchList,
  });
}
