import { RootStore } from "./index";
import { action, makeAutoObservable, reaction } from "mobx";
import Pool, { IData, IShortPoolInfo } from "@src/entities/Pool";
import BN from "@src/utils/BN";
import {
  POOL_CONFIG,
  TOKENS_BY_ASSET_ID,
  TOKENS_BY_SYMBOL,
} from "@src/constants";
import poolsService from "@src/services/poolsService";
import poolService from "@src/services/poolsService";
import wavesCapService from "@src/services/wavesCapService";

export type TPoolState = {
  state: IData[];
  contractAddress: string;
};

export interface ISerializedPoolsStore {
  slippage: number;
}

export default class PoolsStore {
  slippage: number;
  setSlippage = (v: number) =>
    !isNaN(v) && v > 1 && v < 100 && (v ^ 0) === v && (this.slippage = v);

  serialize = (): ISerializedPoolsStore => ({
    slippage: this.slippage,
  });

  constructor(rootStore: RootStore, initialState?: ISerializedPoolsStore) {
    this.rootStore = rootStore;
    this.slippage = initialState?.slippage ?? 5;
    makeAutoObservable(this);
    this.syncPools().then();
    this.syncCustomPools().then(this.updatePoolsState);
    this.updateAccountPoolsLiquidityInfo().then();
    this.syncPuzzleRate().then();
    setInterval(() => {
      this.syncPoolsLiquidity();
      Promise.all([
        this.updateAccountPoolsLiquidityInfo(),
        this.updatePoolsState(),
        this.syncPuzzleRate(),
        this.syncCustomPools(),
      ]);
    }, 5 * 1000);
    reaction(
      () => this.rootStore.accountStore.address,
      () =>
        Promise.all([
          this.updateAccountPoolsLiquidityInfo(true),
          this.updatePoolsState(),
        ])
    );
  }

  public rootStore: RootStore;

  public puzzleRate: BN = BN.ZERO;
  public setPuzzleRate = (value: BN) => (this.puzzleRate = value);

  get customPools() {
    return this.pools.filter(({ isCustom }) => isCustom);
  }

  get mainPools() {
    return this.pools.filter(({ isCustom }) => !isCustom);
  }

  pools: Pool[] = [];
  @action.bound setPools = (pools: Pool[]) => (this.pools = pools);
  getPoolByDomain = (domain: string) =>
    this.pools.find((pool) => pool.domain === domain);

  public poolsState: TPoolState[] | null = null;
  private setPoolState = (value: TPoolState[]) => (this.poolsState = value);
  private getStateByAddress = (contractAddress: string) =>
    this.poolsState?.find((v) => v.contractAddress === contractAddress);

  accountPoolsLiquidity: IShortPoolInfo[] | null = null;
  setAccountPoolsLiquidity = (
    v: IShortPoolInfo[] | null,
    options?: { onlyMain?: boolean; onlyCustom?: boolean }
  ) => {
    if (v == null) {
      this.accountPoolsLiquidity = null;
    } else if (options?.onlyCustom) {
      const mainPoolsInfo = this.accountPoolsLiquidity?.filter(
        ({ pool }) => !pool.isCustom
      );
      this.accountPoolsLiquidity =
        mainPoolsInfo != null ? [...mainPoolsInfo, ...v] : v;
    } else if (options?.onlyMain) {
      const customPoolsInfo = this.accountPoolsLiquidity?.filter(
        ({ pool }) => pool.isCustom
      );
      this.accountPoolsLiquidity =
        customPoolsInfo != null ? [...customPoolsInfo, ...v] : v;
    } else {
      this.accountPoolsLiquidity = v;
    }
  };

  accountPoolsLiquidityLoading = false;
  @action.bound setAccountPoolsLiquidityLoading = (state: boolean) =>
    (this.accountPoolsLiquidityLoading = state);

  get liquidity(): Record<string, BN> {
    return this.pools.reduce<Record<string, BN>>(
      (acc, pool) => ({ ...acc, ...pool.liquidity }),
      {}
    );
  }

  get globalVolume(): BN {
    return this.pools.reduce(
      (acc, pool) => acc.plus(pool.globalVolume ?? BN.ZERO),
      BN.ZERO
    );
  }

  usdnRate = (assetId: string, coefficient = 1): BN | null => {
    const { tokenStore } = this.rootStore;
    const usdn = TOKENS_BY_SYMBOL.USDN.assetId;
    const puzzle = TOKENS_BY_SYMBOL.PUZZLE.assetId;
    const pool = this.pools.find(({ tokens }) =>
      tokens.some((t) => t.assetId === assetId)
    );
    const startPrice = TOKENS_BY_ASSET_ID[assetId]?.startPrice;
    //todo fix this pizdez !!!
    if (pool == null && startPrice != null) {
      return new BN(startPrice ?? 0);
    }
    if (pool == null) return null;
    if (
      pool.currentPrice(assetId, puzzle) == null &&
      pool.tokens.some((t) => t.assetId === puzzle)
    ) {
      return new BN(startPrice ?? 0);
    }
    if (
      pool.currentPrice(assetId, usdn) == null &&
      pool.tokens.some((t) => t.assetId === usdn)
    ) {
      return new BN(startPrice ?? 0);
    }

    if (pool.tokens.some(({ assetId }) => assetId === usdn)) {
      return pool.currentPrice(assetId, usdn, coefficient);
    } else if (pool.tokens.some(({ assetId }) => assetId === puzzle)) {
      const puzzleRate = tokenStore.statisticsByAssetId[puzzle]?.currentPrice;
      const priceInPuzzle = pool.currentPrice(assetId, puzzle, coefficient);
      return priceInPuzzle != null && puzzleRate != null
        ? priceInPuzzle.times(puzzleRate)
        : null;
    } else {
      return null;
    }
  };

  syncPools = async () => {
    const pools = Object.values(POOL_CONFIG).map(
      (pool) => new Pool({ ...pool, isCustom: false })
    );
    this.setPools(pools);
    await Promise.all(this.pools.map((pool) => pool.syncLiquidity()));
  };

  syncCustomPools = async () => {
    const configs = await poolService.getPools();
    const newPools: Array<Pool> = [];
    configs.forEach((config) => {
      const pool = this.getPoolByDomain(config.domain);
      if (pool != null && config.statistics != null) {
        pool.setStatistics(config.statistics);
      }
      if (config.isCustom && pool == null) {
        const tokens = config.assets.map(({ assetId, share }) => ({
          ...TOKENS_BY_ASSET_ID[assetId],
          share,
        }));
        newPools.push(new Pool({ ...config, tokens }));
      }
    });
    this.setPools([...this.pools, ...newPools]);
  };

  updateAccountPoolsLiquidityInfo = async (force = false) => {
    const { address } = this.rootStore.accountStore;
    if (address == null) {
      this.setAccountPoolsLiquidity(null);
      return;
    }
    if (!force && this.accountPoolsLiquidityLoading) return;
    this.setAccountPoolsLiquidityLoading(true);
    this.updateAccountCustomPoolsLiquidityInfo(address);
    await this.updateAccountMainPoolsLiquidityInfo(address);
    this.setAccountPoolsLiquidityLoading(false);
  };

  private updateAccountCustomPoolsLiquidityInfo = (address: string) => {
    const customPoolsInfo = this.customPools.reduce((acc, pool) => {
      const state = this.getStateByAddress(pool.contractAddress)?.state;
      return state
        ? [...acc, pool.getAccountLiquidityInfoByState(address, state)]
        : acc;
    }, [] as Array<IShortPoolInfo>);
    this.setAccountPoolsLiquidity(customPoolsInfo, { onlyCustom: true });
  };

  private updateAccountMainPoolsLiquidityInfo = async (address: string) => {
    const mainPoolsAccountLiquidity = await Promise.all(
      this.mainPools.map((p) => p.getAccountLiquidityInfo(address))
    );
    const newAddress = this.rootStore.accountStore.address;
    if (address !== newAddress) return;
    this.setAccountPoolsLiquidity(mainPoolsAccountLiquidity, {
      onlyMain: true,
    });
  };

  updatePoolsState = async () => {
    const address = this.rootStore.accountStore.address;
    const state = await poolsService.getPoolsStateByUserAddress(address);
    this.setPoolState(state);
    this.syncPoolsLiquidity();
    address && this.updateAccountCustomPoolsLiquidityInfo(address);
  };

  syncPoolsLiquidity = () =>
    this.pools.forEach((pool) => {
      const state = this.getStateByAddress(pool.contractAddress)?.state;
      state && pool.syncLiquidity(state);
    });

  private syncPuzzleRate = () =>
    wavesCapService
      .getAssetRate(TOKENS_BY_SYMBOL.PUZZLE.assetId)
      .then((rate) => {
        rate != null && this.setPuzzleRate(rate);
        this.pools.forEach((pool) => pool.setPuzzleRate(rate ?? BN.ZERO));
      });
}
