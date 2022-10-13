import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction } from "mobx";
import { RootStore, useStores } from "@stores";
import { POOLS, TOKENS_BY_ASSET_ID } from "@src/constants";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";
import transactionsService from "@src/services/transactionsService";
import nodeService from "@src/services/nodeService";
import BN from "@src/utils/BN";

const ctx = React.createContext<ExploreTokenVM | null>(null);

export const ExploreTokenVMProvider: React.FC<{
  assetId: string;
  poolId?: string;
}> = ({ assetId, poolId, children }) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new ExploreTokenVM(rootStore, poolId ?? "", assetId),
    [assetId, poolId, rootStore]
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

  get statistics() {
    return this.rootStore.lendStore.getStatByAssetId(this.asset.assetId);
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
      date: start.add(step * i, "milliseconds").toISOString()
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
      end: dayjs()
    });
    this.setChartLoading(false);
  };

  get pools() {
    return [];
  }

  users = { supply: BN.ZERO, borrow: BN.ZERO };
  setUsers = (users: { supply: BN; borrow: BN }) => (this.users = users);
  syncUsers = () =>
    nodeService
      .nodeMatchRequest(
        this.rootStore.lendStore.poolId,
        `(.*)_(supplied%7Cborrowed)_${this.assetId}`
      )
      .then((data) =>
        data.reduce(
          (acc, v) => ({
            supply: acc.supply.plus(v.key.includes("_supplied_") ? 1 : 0),
            borrow: acc.borrow.plus(v.key.includes("_borrowed_") ? 1 : 0)
          }),
          {
            supply: BN.ZERO,
            borrow: BN.ZERO
          }
        )
      )
      .then(this.setUsers);

  operations: any[] = [];
  private setOperations = (v: any[]) => (this.operations = v);
  private operationsSkip = 0;
  private setOperationsSkip = (v: number) => (this.operationsSkip = v);
  loadOperations = async () => {
    this.setLoading(true);

    const params = [
      ["assetId", this.assetId],
      ["after", this.operationsSkip]
    ] as Array<[string, string | number | boolean]>;
    const txs = await transactionsService.getTransactions(params);
    // console.log(txs);
    this.setOperationsSkip(this.operationsSkip + 5);
    this.setOperations([...this.operations, ...txs] as any[]);
    this.setLoading(false);
  };

  get isAssetOk() {
    return this.rootStore.lendStore.poolsStats.some(
      (t) => t.assetId === this.assetId
    );
  }
  constructor(rootStore: RootStore, poolId: string, assetId: string) {
    this.rootStore = rootStore;
    this.assetId = assetId;
    makeAutoObservable(this);
    const pool = POOLS.find((pool) => pool.address === poolId)!;
    this.rootStore.lendStore.setPool(pool);
    Promise.all([
      this.syncChart(),
      this.loadOperations(),
      this.syncUsers()
    ]).then(() => this.setLoading(false));
    reaction(() => this.selectedChartPeriod, this.syncChart);
  }
}
