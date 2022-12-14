import RootStore from "@stores/RootStore";
import PoolStateFetchService, {
  TPoolToken
} from "@src/services/PoolStateFetchService";
import BN from "@src/utils/BN";
import { ASSETS_TYPE, POOLS, TOKENS_BY_SYMBOL } from "@src/constants";
import { getStateByKey } from "@src/utils/getStateByKey";
import { makeAutoObservable, reaction } from "mobx";
import nodeService from "@src/services/nodeService";

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
  additionalSupplyAPY: { value: BN; assetId: string } | null;
  additionalBorrowAPY: { value: BN; assetId: string } | null;
  prices: { min: BN; max: BN; assetId?: string };
} & TPoolToken;

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
    .multipliedBy(60)
    .multipliedBy(24)
    .multipliedBy(0.8);
  return fStaked.plus(interest).plus(1).pow(365).minus(1).multipliedBy(100);
};

const calcAdditionalSupRewardsApy = (
  reward: BN,
  rewardToken: { max: BN; min: BN; assetId: string; decimals: number },
  totalSupply: BN,
  supplyToken: TPoolToken,
  supplyInterest: BN,
  ASpreLastEarned: BN,
  ASlastEarned: BN,
  ASpreLastBlock: BN,
  ASlastBlock: BN
) => {
  const lastBlockStakingRewards = ASlastEarned.minus(ASpreLastEarned).div(
    ASlastBlock.minus(ASpreLastBlock)
  );
  const rewardTokenPrice = rewardToken.min.plus(rewardToken.max).div(2);
  const rewardAssetMultiplier = new BN(10).pow(rewardToken.decimals);
  const supAssetMultiplier = new BN(10).pow(supplyToken.decimals);
  const fStaked = lastBlockStakingRewards
    .div(totalSupply)
    .multipliedBy(60)
    .multipliedBy(24)
    .multipliedBy(0.8);

  const fReward = reward
    .div(rewardAssetMultiplier)
    .multipliedBy(rewardTokenPrice)
    .div(
      totalSupply
        .div(supAssetMultiplier)
        .multipliedBy(supplyToken.price || BN.ZERO)
    );
  const value = fStaked
    .plus(supplyInterest)
    .plus(fReward)
    .plus(1)
    .pow(365)
    .minus(1)
    .multipliedBy(100);

  return { value: value, assetId: rewardToken.assetId };
};

const calcAdditionalBorRewardsApy = (
  reward: BN,
  rewardToken: { max: BN; min: BN; assetId: string; decimals: number },
  totalBorrow: BN,
  borrowToken: TPoolToken,
  supplyInterest: BN
) => {
  const medianRewardTokenPrice = rewardToken.min.plus(rewardToken.max).div(2);
  const rewardAssetMultiplier = new BN(10).pow(rewardToken.decimals);
  const borAssetMultiplier = new BN(10).pow(borrowToken.decimals);
  const fStaked = reward
    .div(rewardAssetMultiplier)
    .multipliedBy(medianRewardTokenPrice)
    .div(
      totalBorrow
        .div(borAssetMultiplier)
        .multipliedBy(borrowToken.price || BN.ZERO)
    );
  const value = supplyInterest
    .minus(fStaked)
    .plus(1)
    .pow(365)
    .minus(1)
    .multipliedBy(100);
  return { value: value, assetId: rewardToken.assetId };
};

class LendStore {
  public readonly rootStore: RootStore;
  private _fetchService?: PoolStateFetchService;
  get fetchService() {
    return this._fetchService!;
  }

  setFetchService = async (pool: string) => {
    if (!pool) return;
    this._fetchService = new PoolStateFetchService(pool);
    return await this._fetchService
      .fetchSetups()
      .then(this.setTokensSetups)
      .then(() => this.syncPoolsStats())
      .catch((e) =>
        this.rootStore.notificationStore.notify(e.message, { type: "error" })
      );
  };
  initialized = false;
  private setInitialized = (l: boolean) => (this.initialized = l);

  //fixme make scroll to borrow/supply block
  mobileDashboardAssets: ASSETS_TYPE = ASSETS_TYPE.HOME;
  setDashboardAssetType = (v: ASSETS_TYPE) => (this.mobileDashboardAssets = v);

  tokensSetups: Array<TPoolToken> = [];
  private setTokensSetups = (v: Array<TPoolToken>) => (this.tokensSetups = v);

  poolsStats: Array<TPoolStats> = [];
  private setPoolsStats = (v: Array<TPoolStats>) => (this.poolsStats = v);

  userCollateral: BN = BN.ZERO;
  private setUserCollateral = (v: BN) => (this.userCollateral = v);

  getStatByAssetId = (assetId: string) =>
    this.poolsStats.find((s) => s.assetId === assetId);

  pool = { name: "", address: "" };
  setPool = (pool: { name: string; address: string }) => (this.pool = pool);

  get poolId(): string {
    return this.pool.address;
  }

  get poolName(): string {
    return this.pool.name;
  }

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.setFetchService(this.poolId).then(() => this.setInitialized(true));
    reaction(() => this.poolId, this.setFetchService);
    setInterval(this.syncPoolsStats, 60 * 1000);
  }

  syncPoolsStats = async () => {
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
        `${assetId}_reward_borrow_id`,
        `${assetId}_reward_supply_id`,
        `${assetId}_reward_borrow_amount`,
        `${assetId}_reward_supply_amount`,
        ...(address
          ? [`${address}_supplied_${assetId}`, `${address}_borrowed_${assetId}`]
          : [])
      ],
      [] as string[]
    );

    const [state, rates, prices, interests, userCollateral] = await Promise.all(
      [
        nodeService.nodeKeysRequest(this.poolId, keys),
        this.fetchService.calculateTokenRates(),
        this.fetchService.getPrices(),
        this.fetchService.calculateTokensInterest(),
        this.fetchService.getUserCollateral(address || "")
      ]
    );

    const pricesWithId = prices?.reduce((acc, p, i) => {
      return [
        ...acc,
        {
          ...p,
          assetId: this.tokensSetups[i]?.assetId || "WAVES"
        }
      ];
    }, [] as { min: BN; max: BN; assetId: string }[]);

    const stats = this.tokensSetups.map((token, index) => {
      const sup = getStateByKey(state, `total_supplied_${token.assetId}`);
      const totalSupply = new BN(sup ?? "0").times(rates[index]?.supplyRate);

      const sSup = getStateByKey(state, `${address}_supplied_${token.assetId}`);
      const selfSupply = new BN(sSup ?? "0").times(rates[index].supplyRate);

      const bor = getStateByKey(state, `total_borrowed_${token.assetId}`);
      const totalBorrow = new BN(bor ?? "0").times(rates[index].borrowRate);

      const sBor = getStateByKey(state, `${address}_borrowed_${token.assetId}`);
      const selfBorrow = new BN(sBor ?? "0").times(rates[index].borrowRate);

      let additionalSupplyRewards;
      let additionalSupplyToken;
      let additionalBorrowRewards;
      let additionalBorrowToken;

      const borRewardAmount = getStateByKey(
        state,
        `${token.assetId}_reward_borrow_amount`
      );
      const borRewardId = getStateByKey(
        state,
        `${token.assetId}_reward_borrow_id`
      );
      const supRewardAmount = getStateByKey(
        state,
        `${token.assetId}_reward_supply_amount`
      );
      const supRewardId = getStateByKey(
        state,
        `${token.assetId}_reward_supply_id`
      );

      if (borRewardAmount && borRewardId && pricesWithId) {
        additionalBorrowRewards = new BN(borRewardAmount);
        additionalBorrowToken = {
          ...pricesWithId.find((p) => p.assetId === borRewardId),
          assetId: borRewardId,
          decimals: this.tokensSetups.find(
            (token) => token.assetId === borRewardId
          )?.decimals
        } as { max: BN; min: BN; assetId: string; decimals: number };
      }

      if (supRewardAmount && supRewardId && pricesWithId) {
        additionalSupplyRewards = new BN(supRewardAmount);
        additionalSupplyToken = {
          ...pricesWithId.find((p) => p.assetId === supRewardId),
          assetId: supRewardId,
          decimals: this.tokensSetups.find(
            (token) => token.assetId === supRewardId
          )?.decimals
        } as { max: BN; min: BN; assetId: string; decimals: number };
      }

      const UR = totalBorrow.div(totalSupply);
      const supplyInterest = interests[index]
        .multipliedBy(UR)
        .multipliedBy(0.8);
      const p = pricesWithId
        ? pricesWithId[index]
        : {
            min: BN.ZERO,
            max: BN.ZERO,
            assetId: this.tokensSetups[index].assetId
          };
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
      const supplyAPY = ASlastBlockNum
        ? calcAutostakeApy(
            totalSupply,
            supplyInterest,
            ASpreLastEarned,
            ASlastEarned,
            ASpreLastBlock,
            ASlastBlock
          )
        : calcApy(supplyInterest);
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
        supplyAPY: supplyAPY,
        additionalSupplyAPY:
          additionalSupplyRewards && token.price && additionalSupplyToken
            ? calcAdditionalSupRewardsApy(
                additionalSupplyRewards,
                additionalSupplyToken,
                totalSupply,
                token,
                supplyInterest,
                ASpreLastEarned,
                ASlastEarned,
                ASpreLastBlock,
                ASlastBlock
              )
            : null,
        additionalBorrowAPY:
          additionalBorrowRewards && token.price && additionalBorrowToken
            ? calcAdditionalBorRewardsApy(
                additionalBorrowRewards,
                additionalBorrowToken,
                totalBorrow,
                token,
                supplyInterest
              )
            : null,
        isAutostakeAvl: !!ASlastBlockNum,
        borrowAPY: calcApy(interests[index])
      };
    });
    this.setPoolsStats(stats);
    this.setUserCollateral(new BN(userCollateral));
  };

  get health() {
    const bc = this.poolsStats.reduce((acc: BN, stat, index) => {
      const deposit = BN.formatUnits(stat.selfSupply, stat.decimals);
      const cf = this.tokensSetups[index]?.cf;
      if (deposit.eq(0) || !cf) return acc;
      const assetBc = cf.times(1).times(deposit).times(stat.prices.min);
      return acc.plus(assetBc);
    }, BN.ZERO);
    const bcu = this.poolsStats.reduce((acc: BN, stat, index) => {
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
    return this.poolsStats
      .filter(({ selfSupply }) => selfSupply.gt(0))
      .reduce((acc, v) => {
        const balance = v.prices.max.times(
          BN.formatUnits(v.selfSupply, v.decimals)
        );
        return acc.plus(balance);
      }, BN.ZERO);
  }

  get accountBorrowBalance() {
    if (this.rootStore.accountStore.address == null) return BN.ZERO;
    return this.poolsStats
      .filter(({ selfBorrow }) => selfBorrow.gt(0))
      .reduce((acc, v) => {
        const balance = v.prices.max.times(
          BN.formatUnits(v.selfBorrow, v.decimals)
        );
        return acc.plus(balance);
      }, BN.ZERO);
  }

  get totalLiquidity() {
    return this.poolsStats.reduce(
      (acc, stat) =>
        BN.formatUnits(stat.totalSupply, stat.decimals)
          .times(stat.prices.min)
          .plus(acc),
      BN.ZERO
    );
  }

  get netApy() {
    const supplyApy = this.poolsStats.reduce(
      (acc, stat) =>
        BN.formatUnits(stat.selfSupply, stat.decimals)
          .times(stat.prices.min)
          .times(stat.supplyAPY)
          .plus(acc),
      BN.ZERO
    );

    const baseAmount = this.poolsStats.reduce(
      (acc, stat) =>
        BN.formatUnits(stat.selfSupply, stat.decimals)
          .times(stat.prices.min)
          .plus(acc),
      BN.ZERO
    );

    const borrowApy = this.poolsStats.reduce(
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
  }

  get accountSupply() {
    if (this.rootStore.accountStore.address == null) return [];
    return this.poolsStats.filter(({ selfSupply }) => selfSupply.gt(0));
  }

  get accountBorrow() {
    if (this.rootStore.accountStore.address == null) return [];
    return this.poolsStats.filter(({ selfBorrow }) => selfBorrow.gt(0));
  }
}

export default LendStore;
