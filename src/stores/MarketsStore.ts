import RootStore from "@stores/RootStore";
import PoolStateFetchService, {
  TPoolToken
} from "@src/services/PoolStateFetchService";
import BN from "@src/utils/BN";
import { ASSETS_TYPE, POOLS, TOKENS_BY_SYMBOL } from "@src/constants";
import { getStateByKey } from "@src/utils/getStateByKey";
import { makeAutoObservable, reaction } from "mobx";
import nodeService from "@src/services/nodeService";
import { em } from "polished";

export type TPoolStats = {
  totalSupply: BN;
  totalBorrow: BN;
  supplyAPY: BN;
  borrowAPY: BN;
  selfSupply: BN;
  selfBorrow: BN;
  dailyIncome: BN;
  dailyLoan: BN;
  supplyLimit: BN;
  isAutostakeAvl?: boolean;
  prices: { min: BN; max: BN };
} & TPoolToken;

export type TPoolsStats = {
  name?: string;
  address?: string;
  poolStats: Array<TPoolStats>;
  tokensSetups: Array<TPoolToken>;
};

// fixme
const calcApy = (i: BN) => {
  if (!i || i.isNaN()) return BN.ZERO;

  return i.plus(1).pow(365).minus(1).times(100).toDecimalPlaces(2);
};

const calcAutostakeApy = (
  totalSupply: BN,
  interest: BN,
  ASpreLastEarned: BN,
  ASlastEarned: BN,
  ASpreLastBlock: BN,
  ASlastBlock: BN
) => {
  if (!interest || interest.isNaN()) return BN.ZERO;
  const lastBlockStakingRewards = ASlastEarned.minus(ASpreLastEarned).div(
    ASlastBlock.minus(ASpreLastBlock)
  );
  const fStaked = lastBlockStakingRewards
    .div(totalSupply)
    .times(60)
    .times(12)
    .times(0.8);
  return fStaked.plus(interest).plus(1).pow(365).minus(1);
};

class MarketsStore {
  public readonly rootStore: RootStore;
  private _fetchService?: PoolStateFetchService;
  get fetchService() {
    return this._fetchService!;
  }

  setFetchService = (pools: string[]) =>
    new Promise((res, rej) => {
      let num = pools.length;
      pools.forEach((e) => {
        this._fetchService = new PoolStateFetchService(e);
        this._fetchService
          .fetchSetups()
          .then((res) => this.setTokensSetups(res, e))
          .then(() => this.syncPoolsStats(e))
          .then(() => {
            num--;
            if (num === 0) res(true);
          })
          .catch((e) =>
            this.rootStore.notificationStore.notify(e.message, {
              type: "error"
            })
          );
      });
    });

  initialized = false;
  private setInitialized = (l: boolean) => (this.initialized = l);

  //fixme make scroll to borrow/supply block
  mobileDashboardAssets: ASSETS_TYPE = ASSETS_TYPE.HOME;
  setDashboardAssetType = (v: ASSETS_TYPE) => (this.mobileDashboardAssets = v);

  poolStats: Array<TPoolToken> = [];

  poolsStats: Array<TPoolStats> = [];
  private setPoolsStats = (v: Array<TPoolStats>) => (this.poolsStats = v);

  getStatByAssetId = (assetId: string) =>
    this.poolsStats.find((s) => s.assetId === assetId);

  pools = POOLS as TPoolsStats[];
  setPools = (pool: TPoolsStats[]) => (this.pools = pool);

  userCollateralPerPool: BN[] = Array.from({ length: this.pools.length }).map(
    (e) => BN.ZERO
  );
  private setUserCollateralPerPool = (v: BN[]) =>
    (this.userCollateralPerPool = v);

  poolsId = POOLS.map((e) => e.address);

  private setTokensSetups = (v: Array<TPoolToken>, poolId: string) => {
    const poolNum = this.pools.map((e) => e.address).indexOf(poolId);
    const pools = this.pools;
    pools[poolNum].tokensSetups = v;

    this.setPools(pools);
  };

  // get poolsId(): string {
  //   return this.pool.address;
  // }

  // get poolName(): string {
  //   return this.pool.name;
  // }

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.setFetchService(this.poolsId).then(() => this.setInitialized(true));
    // reaction(() => this.poolsId, this.setFetchService);
    setInterval(() => {
      this.poolsId.forEach((e) => this.syncPoolsStats(e));
    }, 60 * 1000);
  }

  syncPoolsStats = async (poolId: string) => {
    console.log("try pool", poolId);
    const address = this.rootStore.accountStore.address;
    const poolNum = this.pools.map((e) => e.address).indexOf(poolId);
    console.log(poolNum);
    console.log(this.pools);
    console.log(this.pools[poolNum].tokensSetups);
    const keys = this.pools[poolNum].tokensSetups.reduce(
      (acc, { assetId }) => [
        ...acc,
        `setup_maxSupply_${assetId}`,
        `total_supplied_${assetId}`,
        `total_borrowed_${assetId}`,
        `autostake_preLastEarned_${assetId}`,
        `autostake_lastEarned_${assetId}`,
        `autostake_preLastBlock_${assetId}`,
        `autostake_lastBlock_${assetId}`,
        ...(address
          ? [`${address}_supplied_${assetId}`, `${address}_borrowed_${assetId}`]
          : [])
      ],
      [] as string[]
    );

    console.log("1try");
    const [state, rates, prices, interests, userCollateral] = await Promise.all(
      [
        nodeService.nodeKeysRequest(poolId, keys),
        this.fetchService.calculateTokenRates(),
        this.fetchService.getPrices(),
        this.fetchService.calculateTokensInterest(),
        this.fetchService.getUserCollateral(address || "")
      ]
    );
    console.log("1");

    const stats = this.pools[poolNum].tokensSetups.map((token, index) => {
      const sup = getStateByKey(state, `total_supplied_${token.assetId}`);
      const totalSupply = new BN(sup ?? "0").times(rates[index].supplyRate);

      const sSup = getStateByKey(state, `${address}_supplied_${token.assetId}`);
      const selfSupply = new BN(sSup ?? "0").times(rates[index].supplyRate);

      const bor = getStateByKey(state, `total_borrowed_${token.assetId}`);
      const totalBorrow = new BN(bor ?? "0").times(rates[index].borrowRate);

      const sBor = getStateByKey(state, `${address}_borrowed_${token.assetId}`);
      const selfBorrow = new BN(sBor ?? "0").times(rates[index].borrowRate);

      const UR = totalBorrow.div(totalSupply);
      const supplyInterest = interests[index].times(UR).times(0.8);

      const p = prices ? prices[index] : { min: BN.ZERO, max: BN.ZERO };
      const dailyIncome = selfSupply.times(supplyInterest);
      const dailyLoan = selfBorrow.times(interests[index]);

      const limit = getStateByKey(state, `setup_maxSupply_${token.assetId}`);
      const assetMaxSupply = BN.formatUnits(
        limit ?? "0",
        TOKENS_BY_SYMBOL.USDN.decimals
      );

      const ASpreLastEarnedNum = getStateByKey(
        state,
        `autostake_preLastEarned_${token.assetId}`
      );
      const ASpreLastEarned = new BN(ASpreLastEarnedNum ?? 0);
      const ASlastEarnedNum = getStateByKey(
        state,
        `autostake_lastEarned_${token.assetId}`
      );
      const ASlastEarned = new BN(ASlastEarnedNum ?? 0);
      const ASpreLastBlockNum = getStateByKey(
        state,
        `autostake_preLastBlock_${token.assetId}`
      );
      const ASpreLastBlock = new BN(ASpreLastBlockNum ?? 0);
      const ASlastBlockNum = getStateByKey(
        state,
        `autostake_lastBlock_${token.assetId}`
      );
      const ASlastBlock = new BN(ASlastBlockNum ?? 0);
      console.log("stats ");
      return {
        ...token,
        interest: interests[index],
        prices: p,
        supplyLimit: assetMaxSupply,
        dailyIncome: dailyIncome.toDecimalPlaces(0),
        dailyLoan: dailyLoan.toDecimalPlaces(0),
        totalSupply: totalSupply.toDecimalPlaces(0),
        selfSupply: selfSupply.toDecimalPlaces(0),
        totalBorrow: totalBorrow.toDecimalPlaces(0),
        selfBorrow: selfBorrow.toDecimalPlaces(0),
        supplyAPY: ASlastBlockNum
          ? calcAutostakeApy(
              totalSupply,
              supplyInterest,
              ASpreLastEarned,
              ASlastEarned,
              ASpreLastBlock,
              ASlastBlock
            )
          : calcApy(supplyInterest),
        isAutostakeAvl: !!ASlastBlockNum,
        borrowAPY: calcApy(interests[index])
      };
    });
    const pools = this.pools;
    console.log("try");
    pools[poolNum].poolStats = stats;

    const userCollateralPerPool = this.userCollateralPerPool;
    userCollateralPerPool[poolNum] = new BN(userCollateral);
    console.log("1");
    console.log(pools);
    this.setPools(pools);
    this.setUserCollateralPerPool(userCollateralPerPool);
  };

  health = (poolId: string) => {
    const poolNum = this.pools.map((e) => e.address).indexOf(poolId);
    console.log(poolNum);
    console.log(this.pools);
    console.log(this.pools[poolNum].poolStats);
    const bc = this.pools[poolNum].poolStats.reduce((acc: BN, stat, index) => {
      const deposit = BN.formatUnits(stat.selfSupply, stat.decimals);
      const cf = this.pools[poolNum].tokensSetups[index]?.cf;
      if (deposit.eq(0) || !cf) return acc;
      const assetBc = cf.times(1).times(deposit).times(stat.prices.min);
      return acc.plus(assetBc);
    }, BN.ZERO);
    const bcu = this.pools[poolNum].poolStats.reduce((acc: BN, stat, index) => {
      const borrow = BN.formatUnits(stat.selfBorrow, stat.decimals);
      const lt = this.pools[poolNum].tokensSetups[index]?.lt;
      if (borrow.eq(0) || !lt) return acc;
      const assetBcu = borrow.times(stat.prices.max).div(lt);
      return acc.plus(assetBcu);
    }, BN.ZERO);
    const health = new BN(1).minus(bcu.div(bc)).times(100);
    if (health.isNaN() || health.gt(100)) return new BN(100);
    if (health.lte(0)) return BN.ZERO;
    else return health;
  };

  accountSupplyBalance = (poolId: string) => {
    const poolNum = this.pools.map((e) => e.address).indexOf(poolId);

    if (this.rootStore.accountStore.address == null) return BN.ZERO;
    return this.pools[poolNum].poolStats
      .filter(({ selfSupply }) => selfSupply.gt(0))
      .reduce((acc, v) => {
        const balance = v.prices.max.times(
          BN.formatUnits(v.selfSupply, v.decimals)
        );
        return acc.plus(balance);
      }, BN.ZERO);
  };

  accountBorrowBalance = (poolId: string) => {
    const poolNum = this.pools.map((e) => e.address).indexOf(poolId);
    if (this.rootStore.accountStore.address == null) return BN.ZERO;
    return this.pools[poolNum].poolStats
      .filter(({ selfBorrow }) => selfBorrow.gt(0))
      .reduce((acc, v) => {
        const balance = v.prices.max.times(
          BN.formatUnits(v.selfBorrow, v.decimals)
        );
        return acc.plus(balance);
      }, BN.ZERO);
  };

  totalLiquidity = (poolId: string) => {
    const poolNum = this.pools.map((e) => e.address).indexOf(poolId);
    return this.pools[poolNum].poolStats.reduce(
      (acc, stat) =>
        BN.formatUnits(stat.totalSupply, stat.decimals)
          .times(stat.prices.min)
          .plus(acc),
      BN.ZERO
    );
  };

  netApy = (poolId: string) => {
    const poolNum = this.pools.map((e) => e.address).indexOf(poolId);
    const supplyApy = this.pools[poolNum].poolStats.reduce(
      (acc, stat) =>
        BN.formatUnits(stat.selfSupply, stat.decimals)
          .times(stat.prices.min)
          .times(stat.supplyAPY)
          .plus(acc),
      BN.ZERO
    );

    const baseAmount = this.pools[poolNum].poolStats.reduce(
      (acc, stat) =>
        BN.formatUnits(stat.selfSupply, stat.decimals)
          .times(stat.prices.min)
          .plus(acc),
      BN.ZERO
    );

    const borrowApy = this.pools[poolNum].poolStats.reduce(
      (acc, stat) =>
        BN.formatUnits(stat.selfBorrow, stat.decimals)
          .times(stat.prices.min)
          .times(stat.borrowAPY)
          .plus(acc),
      BN.ZERO
    );

    return baseAmount.eq(0)
      ? BN.ZERO
      : supplyApy.minus(borrowApy).div(baseAmount);
  };

  accountSupply = (poolId: string) => {
    const poolNum = this.pools.map((e) => e.address).indexOf(poolId);
    if (this.rootStore.accountStore.address == null) return [];
    return this.pools[poolNum].poolStats.filter(({ selfSupply }) =>
      selfSupply.gt(0)
    );
  };

  accountBorrow = (poolId: string) => {
    const poolNum = this.pools.map((e) => e.address).indexOf(poolId);
    if (this.rootStore.accountStore.address == null) return [];
    return this.pools[poolNum].poolStats.filter(({ selfBorrow }) =>
      selfBorrow.gt(0)
    );
  };
}

export default MarketsStore;
