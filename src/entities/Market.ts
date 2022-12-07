import RootStore from "@stores/RootStore";
import BN from "@src/utils/BN";
import { TOKENS_BY_SYMBOL } from "@src/constants";
import { getStateByKey } from "@src/utils/getStateByKey";
import nodeService from "@src/services/nodeService";
import MarketStateFetchService, {
  TMarketToken
} from "@src/services/MarketStateFetchService";
import { IMarketConfig } from "@src/services/marketsSeervice";
import { makeAutoObservable } from "mobx";

export type TMarketStats = {
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
} & TMarketToken;

export interface IData {
  key: string;
  type: "integer" | "string";
  value: number | string;
}

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
    .times(24)
    .times(0.8);
  return fStaked.plus(interest).plus(1).pow(365).minus(1).times(100);
};

class Market {
  public readonly rootStore: RootStore;
  private _fetchService?: MarketStateFetchService;

  public readonly title: string;
  public readonly description: string;
  public readonly contractAddress: string;
  public readonly assets: string[];

  private readonly _logo?: string;

  get fetchService() {
    return this._fetchService!;
  }

  market: { name: string; contractAddress: string };

  setFetchService = async (market: string) => {
    if (!market) return;
    this._fetchService = new MarketStateFetchService(market);
    return await this._fetchService
      .fetchSetups()
      .then(this.setTokensSetups)
      .then(this.syncMarketsStats)
      .catch((e) =>
        this.rootStore.notificationStore.notify(e.message, { type: "error" })
      );
  };
  initialized = false;
  private setInitialized = (l: boolean) => (this.initialized = l);

  tokensSetups: Array<TMarketToken> = [];
  private setTokensSetups = (v: Array<TMarketToken>) => (this.tokensSetups = v);

  marketStats: Array<TMarketStats> = [];
  private setMarketsStats = (v: Array<TMarketStats>) => (this.marketStats = v);

  userCollateral: BN = BN.ZERO;
  private setUserCollateral = (v: BN) => (this.userCollateral = v);

  getStatByAssetId = (assetId: string) =>
    this.marketStats.find((s) => s.assetId === assetId);

  get marketId(): string {
    return this.market.contractAddress;
  }

  syncMarketsStats = async () => {
    const address = this.rootStore.accountStore.address;
    const keys = this.tokensSetups.reduce(
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

    const [state, rates, prices, interests, userCollateral] = await Promise.all(
      [
        nodeService.nodeKeysRequest(this.marketId, keys),
        this.fetchService.calculateTokenRates(),
        this.fetchService.getPrices(),
        this.fetchService.calculateTokensInterest(),
        this.fetchService.getUserCollateral(address || "")
      ]
    );

    const stats = this.tokensSetups.map((token, index) => {
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
    this.setMarketsStats(stats);
    this.setUserCollateral(new BN(userCollateral));
  };

  get health() {
    const bc = this.marketStats.reduce((acc: BN, stat, index) => {
      const deposit = BN.formatUnits(stat.selfSupply, stat.decimals);
      const cf = this.tokensSetups[index]?.cf;
      if (deposit.eq(0) || !cf) return acc;
      const assetBc = cf.times(1).times(deposit).times(stat.prices.min);
      return acc.plus(assetBc);
    }, BN.ZERO);
    const bcu = this.marketStats.reduce((acc: BN, stat, index) => {
      const borrow = BN.formatUnits(stat.selfBorrow, stat.decimals);
      const lt = this.tokensSetups[index]?.lt;
      if (borrow.eq(0) || !lt) return acc;
      const assetBcu = borrow.times(stat.prices.max).div(lt);
      return acc.plus(assetBcu);
    }, BN.ZERO);
    const health = new BN(1).minus(bcu.div(bc)).times(100);
    if (health.isNaN() || health.gt(100)) return new BN(100);
    if (health.lte(0)) return BN.ZERO;
    else return health;
  }

  get accountSupplyBalance() {
    if (this.rootStore.accountStore.address == null) return BN.ZERO;
    const accountSupplyBalance = this.marketStats
      .filter(({ selfSupply }) => selfSupply.gt(0))
      .reduce((acc, v) => {
        const balance = v.prices.max.times(
          BN.formatUnits(v.selfSupply, v.decimals)
        );
        return acc.plus(balance);
      }, BN.ZERO);
    return accountSupplyBalance;
  }

  get accountBorrowBalance() {
    if (this.rootStore.accountStore.address == null) return BN.ZERO;
    return this.marketStats
      .filter(({ selfBorrow }) => selfBorrow.gt(0))
      .reduce((acc, v) => {
        const balance = v.prices.max.times(
          BN.formatUnits(v.selfBorrow, v.decimals)
        );
        return acc.plus(balance);
      }, BN.ZERO);
  }

  get totalLiquidity() {
    return this.marketStats.reduce(
      (acc, stat) =>
        BN.formatUnits(stat.totalSupply, stat.decimals)
          .times(stat.prices.min)
          .plus(acc),
      BN.ZERO
    );
  }

  get netApy() {
    try {
      const supplyApy = this.marketStats.reduce(
        (acc, stat) =>
          BN.formatUnits(stat.selfSupply, stat.decimals)
            .times(stat.prices.min)
            .times(stat.supplyAPY)
            .plus(acc),
        BN.ZERO
      );

      const baseAmount = this.marketStats.reduce(
        (acc, stat) =>
          BN.formatUnits(stat.selfSupply, stat.decimals)
            .times(stat.prices.min)
            .plus(acc),
        BN.ZERO
      );

      const borrowApy = this.marketStats.reduce(
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
    } catch (e) {
      return BN.ZERO;
    }
  }

  get accountSupply() {
    if (this.rootStore.accountStore.address == null) return [];
    return this.marketStats.filter(({ selfSupply }) => selfSupply.gt(0));
  }

  get accountBorrow() {
    if (this.rootStore.accountStore.address == null) return [];
    return this.marketStats.filter(({ selfBorrow }) => selfBorrow.gt(0));
  }

  constructor(rootStore: RootStore, params: IMarketConfig) {
    this.rootStore = rootStore;
    this.title = params.title;
    this.description = params.description;
    this.contractAddress = params.contractAddress;
    this.assets = params.assets ?? [];
    this.market = {
      contractAddress: params.contractAddress,
      name: params.title
    };
    this.setFetchService(params.contractAddress).then(() =>
      this.setInitialized(true)
    );
    setInterval(this.syncMarketsStats, 60 * 1000);
    makeAutoObservable(this);
  }
}

export default Market;
