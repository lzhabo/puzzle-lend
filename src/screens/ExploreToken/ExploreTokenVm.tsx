import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction } from "mobx";
import { RootStore, useStores } from "@stores";
import { TOKEN_DETAILS_BY_SYMBOL, TOKENS_BY_ASSET_ID } from "@src/constants";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";
import transactionsService from "@src/services/transactionsService";

const ctx = React.createContext<ExploreTokenVM | null>(null);

export const ExploreTokenVMProvider: React.FC<{ assetId: string }> = ({
  assetId,
  children,
}) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new ExploreTokenVM(rootStore, assetId),
    [assetId, rootStore]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useExploreTokenVM = () => useVM(ctx);

type TChartData = {
  start: Dayjs;
  end: Dayjs;
  data: Array<[number, number]>;
};

export type TChartDataRecord = {
  "1d"?: TChartData;
  "1w"?: TChartData;
  "1m"?: TChartData;
  "3m"?: TChartData;
  "1y"?: TChartData;
  all?: TChartData;
};

class ExploreTokenVM {
  public rootStore: RootStore;
  private readonly assetId: string;

  loading = true;
  setLoading = (v: boolean) => (this.loading = v);

  chartLoading = true;
  setChartLoading = (v: boolean) => (this.chartLoading = v);

  get asset() {
    return TOKENS_BY_ASSET_ID[this.assetId];
  }

  get tokenLifeData() {
    const symbol = this.asset.symbol;
    const currentPrice = this.statistics?.currentPrice?.toFormat(2) ?? "–";
    const volume24 = this.statistics?.volume24?.toFormat(2) ?? "–";
    const sign = this.statistics?.change24H?.gte(0) ? "up" : "down";
    const descr = this.asset?.description ?? "";
    const change24H = this.statistics?.change24H
      ?.times(this.statistics?.change24H?.gte(0) ? 1 : -1)
      .toFormat(2);
    return [
      `The live ${symbol} price today is $${currentPrice} USDN with a 24-hour trading volume of $${volume24} USDN. We update our ${symbol} to USDN price in real-time.`,
      `\n${symbol} is ${sign} ${change24H}% in the last 24 hours. Trade ${symbol} using puzzleswap.org aggregator to get the best price!\n${descr}`,
    ];
  }

  get about() {
    return TOKEN_DETAILS_BY_SYMBOL[this.asset.symbol];
  }

  get statistics() {
    return this.rootStore.tokenStore.statisticsByAssetId[this.assetId];
  }

  selectedChartPeriod: keyof TChartDataRecord = "1d";
  setSelectedChartPeriod = (v: string) =>
    (this.selectedChartPeriod = v as keyof TChartDataRecord);

  chartData: TChartDataRecord = {};
  setChartData = (period: keyof TChartDataRecord, value: TChartData) =>
    (this.chartData = { ...this.chartData, [period]: value });

  getChartByPeriod(period: keyof TChartDataRecord) {
    const { start, end, data } =
      this.chartData[period ?? this.selectedChartPeriod] ?? {};
    if (start == null || data == null || end == null) return [];
    const step = +(
      end.diff(dayjs(start), "milliseconds") / data.length
    ).toFixed(0);
    return data.map(([volume], i) => ({
      volume,
      date: start.add(step * i, "milliseconds").toISOString(),
    }));
  }

  get chart() {
    return this.getChartByPeriod(this.selectedChartPeriod);
  }

  syncChart = async () => {
    if (this.chartData[this.selectedChartPeriod] != null) return;
    this.setChartLoading(true);
    const req = `https://wavescap.com/api/chart/asset/${this.assetId}-usd-n-${this.selectedChartPeriod}.json`;
    const { data } = await axios.get(req);
    this.setChartData(this.selectedChartPeriod, {
      ...data,
      start: dayjs(data.start),
      end: dayjs(),
    });
    this.setChartLoading(false);
  };

  get pools() {
    return this.rootStore.poolsStore.pools.filter((p) =>
      p.tokens.some(({ assetId }) => assetId === this.assetId)
    );
  }

  operations: any[] = [];
  private setOperations = (v: any[]) => (this.operations = v);
  private operationsSkip = 0;
  private setOperationsSkip = (v: number) => (this.operationsSkip = v);
  loadOperations = async () => {
    this.setLoading(true);

    const params = [
      ["assetId", this.assetId],
      ["after", this.operationsSkip],
    ] as Array<[string, string | number | boolean]>;
    const txs = await transactionsService.getTransactions(params);
    // console.log(txs);
    this.setOperationsSkip(this.operationsSkip + 5);
    this.setOperations([...this.operations, ...txs] as any[]);
    this.setLoading(false);
  };

  constructor(rootStore: RootStore, assetId: string) {
    this.rootStore = rootStore;
    this.assetId = assetId;
    makeAutoObservable(this);
    Promise.all([this.syncChart(), this.loadOperations()]).then(() =>
      this.setLoading(false)
    );
    reaction(() => this.selectedChartPeriod, this.syncChart);
  }
}
