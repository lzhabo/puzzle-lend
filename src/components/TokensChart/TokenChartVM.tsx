import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction, when } from "mobx";
import { RootStore, useStores } from "@stores";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import axios from "axios";

const ctx = React.createContext<TokenChartVM | null>(null);

export const TokenChartVMProvider: React.FC<{
  assetId0: string;
  assetId1: string;
}> = ({ assetId0, assetId1, children }) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new TokenChartVM(rootStore, assetId0, assetId1),
    [assetId0, assetId1, rootStore]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useTokenChartVM = () => useVM(ctx);

type TChartData = Array<{ date: string; price: number }>;

export type TChartDataRecord = {
  "1d"?: TChartData;
  "1w"?: TChartData;
  "1m"?: TChartData;
  "3m"?: TChartData;
  "1y"?: TChartData;
  all?: TChartData;
};

class TokenChartVM {
  public rootStore: RootStore;
  private readonly assetId0: string;
  private readonly assetId1: string;

  chartUnavailable = false;
  setChartUnavailable = (v: boolean) => (this.chartUnavailable = v);

  loading = true;
  setLoading = (v: boolean) => (this.loading = v);

  chartLoading = true;
  setChartLoading = (v: boolean) => (this.chartLoading = v);

  get asset0() {
    return TOKENS_BY_ASSET_ID[this.assetId0];
  }

  get asset1() {
    return TOKENS_BY_ASSET_ID[this.assetId1];
  }

  get statistics0() {
    return this.rootStore.tokenStore.statisticsByAssetId[this.assetId0];
  }

  get statistics1() {
    return this.rootStore.tokenStore.statisticsByAssetId[this.assetId1];
  }

  get chartMin() {
    return Math.min(...this.chart.map(({ price }) => price));
  }

  get chartMax() {
    return Math.max(...this.chart.map(({ price }) => price));
  }

  selectedChartPeriod: keyof TChartDataRecord = "1d";
  setSelectedChartPeriod = (v: string) =>
    (this.selectedChartPeriod = v as keyof TChartDataRecord);

  chartData: TChartDataRecord = {};
  setChartData = (period: keyof TChartDataRecord, value: TChartData) =>
    (this.chartData = { ...this.chartData, [period]: value });

  getChartByPeriod(period: keyof TChartDataRecord) {
    console.log(this.chartData);
    return this.chartData[period ?? this.selectedChartPeriod] ?? [];
  }

  get chart() {
    return this.getChartByPeriod(this.selectedChartPeriod);
  }

  syncChart = async () => {
    // if (this.chartLoading) return;
    if (this.chartData[this.selectedChartPeriod] != null) return;
    this.setChartLoading(true);
    const marketsReq = `https://wavescap.com/api/markets/${this.assetId1}.json`;
    const { data: markets }: { data: any[] } = await axios.get(marketsReq);

    const market = markets.find(
      (m) => m.amount_asset_id === this.assetId0 && m.dapp != null
    );
    if (market == null) {
      this.setChartLoading(false);
      this.setChartUnavailable(true);
      return;
    }
    const req = `https://wavescap.com/api/chart/dapp/${market.dapp}-${market.dapp_func}-${this.assetId1}-${this.assetId0}-${this.selectedChartPeriod}.json`;
    const res = await axios.get(req).catch(() => {
      this.setChartUnavailable(true);
      return null;
    });
    if (res == null) return;
    this.setChartData(
      this.selectedChartPeriod,
      res.data.data.map(({ data }: any) => {
        return {
          date: data.time,
          price: data.weightedAveragePrice,
        };
      })
    );
    this.setChartLoading(false);
    this.setChartUnavailable(false);
  };

  constructor(rootStore: RootStore, assetId0: string, assetId1: string) {
    this.rootStore = rootStore;
    this.assetId0 = assetId0;
    this.assetId1 = assetId1;
    makeAutoObservable(this);
    when(
      () => this.rootStore.tokenStore.statistics.length > 0,
      () => this.syncChart().then(() => this.setLoading(false))
    );
    reaction(() => this.selectedChartPeriod, this.syncChart);
  }
}
