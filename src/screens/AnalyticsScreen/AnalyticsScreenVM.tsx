import React, { useMemo } from "react";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import { useVM } from "@src/hooks/useVM";
import nodeService from "@src/services/nodeService";
import { IToken, POOLS, TOKENS_BY_ASSET_ID } from "@src/constants";
import BN from "@src/utils/BN";
import PoolStateFetchService from "@src/services/PoolStateFetchService";

const ctx = React.createContext<AnalyticsScreenVM | null>(null);

interface IProps {}

export const AnalyticsScreenVMProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new AnalyticsScreenVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useAnalyticsScreenVM = () => useVM(ctx);

type TAssetPrices = Record<
  string,
  { assetId: string; prices: { min: BN; max: BN } }[]
>;

type TStatisticItem = {
  amount: BN;
  type: "borrow" | "supply";
  address: string;
  asset: IToken;
  poolId: string;
  amountTotal: number;
  nBorrowed?: number;
  nSupplied?: number;
};

interface ITStatisticItem extends TStatisticItem {}

export type { ITStatisticItem };

export enum SORT_TYPE {
  mostBorrowed = "Most borrowed",
  mostSupplied = "Most supplied",
  leastBorrowed = "Least borrowed",
  leastSupplied = "Least supplied"
}

class AnalyticsScreenVM {
  poolId: string | null = null;
  setPoolId = (poolId: string | null) => (this.poolId = poolId);

  assetId: string | null = null;
  setAssetId = (assetId: string | null) => (this.assetId = assetId);

  statistics: TStatisticItem[] = [];
  setStatistics = (s: TStatisticItem[]) => (this.statistics = s);

  prices: TAssetPrices = {};
  setPrices = (p: TAssetPrices) => (this.prices = p);

  sort: SORT_TYPE = SORT_TYPE.mostBorrowed;
  setSort = (s: SORT_TYPE) => (this.sort = s);

  sortOptions = Object.entries(SORT_TYPE);

  get tokens() {
    return this.statistics
      .filter((v) => this.poolId == null || this.poolId === v.poolId)
      .reduce(
        (acc, { asset: { assetId } }) =>
          acc.includes(assetId) ? acc : [...acc, assetId],
        [] as string[]
      );
  }

  get priceForToken() {
    return (token: TStatisticItem) => {
      return (
        this.prices[token.poolId]?.find(
          ({ assetId }) => assetId === token.asset.assetId
        )?.prices.min ?? BN.ZERO
      );
    };
  }

  get uniqueUsers() {
    return this.statistics
      .filter((v) => this.poolId == null || this.poolId === v.poolId)
      .reduce(
        (acc, { address }) => (acc.includes(address) ? acc : [...acc, address]),
        [] as string[]
      );
  }

  get tableData() {
    return this.statistics
      .filter((v) => this.poolId == null || this.poolId === v.poolId)
      .filter((v) => this.assetId == null || this.assetId === v.asset.assetId)
      .reduce((acc, s) => {
        if (s.address === "total") return acc;
        const userIndex = acc.findIndex((v) => v.user === s.address);
        if (userIndex === -1) {
          acc.push({ user: s.address, supplied: BN.ZERO, borrowed: BN.ZERO });
        }
        const rate = this.prices[s.poolId]?.find(
          ({ assetId }) => assetId === s.asset.assetId
        )?.prices.min;
        const index = acc.findIndex((v) => v.user === s.address);
        if (rate != null) {
          const val = BN.formatUnits(s.amount, s.asset.decimals).times(rate);
          const key = s.type === "supply" ? "supplied" : "borrowed";
          acc[index][key] = acc[index][key].plus(val);
        }
        return acc;
      }, [] as Array<{ user: string; supplied: BN; borrowed: BN }>)
      .sort((a, b) => (a.supplied.gt(b.supplied) ? -1 : 1))
      .map((v) => ({
        ...v,
        borrowed: "$" + v.borrowed.toFormat(2),
        supplied: "$" + v.supplied.toFormat(2),
        nBorrowed: v.borrowed.toNumber(),
        nSupplied: v.supplied.toNumber()
      }))
      .sort((prev, curr) =>
        this.sort === SORT_TYPE.mostBorrowed
          ? curr.nBorrowed - prev.nBorrowed
          : this.sort === SORT_TYPE.mostSupplied
          ? curr.nSupplied - prev.nSupplied
          : this.sort === SORT_TYPE.leastBorrowed
          ? prev.nBorrowed - curr.nBorrowed
          : prev.nSupplied - curr.nSupplied
      );
  }

  totalOf = (type: string) =>
    this.statistics
      .filter((v) => this.poolId == null || this.poolId === v.poolId)
      .filter((v: TStatisticItem) => v.type === type)
      .reduce((prev, { amount, poolId, asset }) => {
        const rate = this.prices[poolId]?.find(
          ({ assetId }) => assetId === asset.assetId
        )?.prices.min;

        return rate
          ? prev.plus(BN.formatUnits(amount, asset.decimals).times(rate))
          : prev;
      }, BN.ZERO);

  popularOf = (type: string) =>
    this.statistics
      .filter(
        (v: TStatisticItem) =>
          v.type === type && (this.poolId === null || this.poolId === v.poolId)
      )
      .reduce((prev, curr) => {
        const rate = this.prices[curr.poolId]?.find(
          ({ assetId }) => assetId === curr.asset.assetId
        )?.prices.min;

        const index = prev
          .map((e: TStatisticItem) => (e.asset ? e.asset.assetId : null))
          .indexOf(curr.asset.assetId);

        const dataObj = index >= 0 ? prev[index] : curr;

        const resultWithTotal = rate
          ? {
              ...dataObj,
              amountTotal: dataObj.amountTotal
                ? dataObj.amountTotal +
                  BN.formatUnits(curr.amount, curr.asset.decimals)
                    .times(rate)
                    .toNumber()
                : BN.formatUnits(curr.amount, curr.asset.decimals)
                    .times(rate)
                    .toNumber()
            }
          : curr;

        if (index >= 0) prev[index] = resultWithTotal;

        return index >= 0 ? prev : [...prev, resultWithTotal];
      }, [] as TStatisticItem[])
      .sort((prev, curr) => curr.amountTotal - prev.amountTotal);

  syncPrices = async () => {
    const poolIds = POOLS.map((pool) => pool.address);
    const res = await Promise.all(
      poolIds.map(async (id) => {
        const fetchService = new PoolStateFetchService(id);
        const tokenSetups = await nodeService.nodeKeysRequest(
          id,
          "setup_tokens"
        );
        const prices = await fetchService.getPrices();
        return (tokenSetups[0].value as string)
          .split(",")
          .map((assetId, index) => ({
            assetId,
            prices: prices ? prices[index] : { min: BN.ZERO, max: BN.ZERO }
          }));
      })
    );
    const prices = res.reduce(
      (acc, item, i) => ({ ...acc, [poolIds[i]]: item }),
      {} as TAssetPrices
    );
    this.setPrices(prices);
  };

  syncData = async () => {
    const poolIds = POOLS.map((pool) => pool.address);
    const rgxp = "(.*)_(supplied%7Cborrowed)_(.*)";
    const req = poolIds.map((pool) => nodeService.nodeMatchRequest(pool, rgxp));
    const res = await Promise.all(req).then((data) =>
      data.reduce(
        (acc, arr, index) => [
          ...acc,
          ...arr
            .map(parseInfoFromDataEntry)
            .filter((v) => v != null)
            .map((v) => {
              const poolId = POOLS[index].address;
              return { ...v, poolId } as TStatisticItem;
            })
        ],
        [] as Array<TStatisticItem>
      )
    );
    this.setStatistics(res);
  };

  constructor(private rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.syncPrices().then(this.syncData);
  }
}

const parseInfoFromDataEntry = (v: { key: string; value: string | number }) => {
  const { key, value } = v;
  if (!new RegExp("(.*)_(supplied|borrowed)_(.*)").test(key) || isNaN(+value)) {
    return null;
  }
  if (key.includes("_total_")) return null;
  const type: "borrow" | "supply" = key.includes("_supplied_")
    ? "supply"
    : "borrow";
  const [address, assetId] = key.split(
    type === "supply" ? "_supplied_" : "_borrowed_"
  );
  return {
    amount: new BN(value),
    type,
    address: address as string,
    asset: TOKENS_BY_ASSET_ID[assetId]
  };
};
