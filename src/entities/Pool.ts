import { IPoolConfig, IPoolConfigStatistics, IToken } from "@src/constants";
import { makeAutoObservable } from "mobx";
import BN from "@src/utils/BN";
import tokenLogos from "@src/constants/tokenLogos";
import nodeService from "@src/services/nodeService";
import { getStateByKey } from "@src/utils/getStateByKey";

export interface IData {
  key: string;
  type: "integer" | "string";
  value: number | string;
}

export interface IShortPoolInfo {
  pool: IPoolConfig;
  liquidityInUsdn: BN;
  addressStaked: BN;
  shareOfPool: BN;
  indexTokenRate: BN;
  indexTokenName: string;
}

class Pool implements IPoolConfig {
  public readonly owner?: string;
  public readonly domain: string;
  public readonly contractAddress: string;
  public readonly layer2Address?: string;
  public readonly baseTokenId: string;
  public readonly title: string;
  public readonly isCustom?: boolean;
  public readonly artefactOriginTransactionId?: string;
  public readonly swapFee: number;
  public readonly createdAt: string;
  public readonly defaultAssetId0: string;
  public readonly defaultAssetId1: string;
  public readonly tokens: Array<IToken & { share: number }> = [];
  private readonly _logo?: string;

  public statistics?: IPoolConfigStatistics;
  public setStatistics = (statistics: IPoolConfigStatistics) =>
    (this.statistics = statistics);

  public get logo() {
    return this._logo ?? tokenLogos.UNKNOWN;
  }

  public getAssetById = (assetId: string) =>
    this.tokens.find((t) => assetId === t.assetId);

  public globalVolume: BN | null = null;
  setGlobalVolume = (value: BN) => (this.globalVolume = value);

  public globalLiquidityByUSDN: BN | null = null;
  setGlobalLiquidityByUSDN = (value: BN | null) =>
    (this.globalLiquidityByUSDN = value);

  public globalLiquidityByPUZZLE: BN | null = null;
  setGlobalLiquidityByPUZZLE = (value: BN | null) =>
    (this.globalLiquidityByPUZZLE = value);

  public get globalLiquidity(): BN {
    if (this.globalLiquidityByUSDN != null) return this.globalLiquidityByUSDN;
    else if (this.globalLiquidityByPUZZLE != null && this.puzzleRate.gt(0)) {
      return this.globalLiquidityByPUZZLE.times(this.puzzleRate);
    } else {
      return BN.ZERO;
    }
  }

  public globalPoolTokenAmount: BN = BN.ZERO;
  setGlobalPoolTokenAmount = (value: BN) =>
    (this.globalPoolTokenAmount = value);

  public globalEarnedByOwner: BN | null = null;
  setGlobalEarnedByOwner = (value: BN) => (this.globalEarnedByOwner = value);

  public liquidity: Record<string, BN> = {};
  private setLiquidity = (value: Record<string, BN>) =>
    (this.liquidity = value);

  public puzzleRate: BN = BN.ZERO;
  public setPuzzleRate = (value: BN) => (this.puzzleRate = value);

  constructor(params: IPoolConfig) {
    this.contractAddress = params.contractAddress;
    this.layer2Address = params.layer2Address;
    this.baseTokenId = params.baseTokenId;
    this.title = params.title;
    this._logo = params.logo;
    this.tokens = params.tokens;
    this.defaultAssetId0 = params.defaultAssetId0 ?? params.tokens[0].assetId;
    this.defaultAssetId1 = params.defaultAssetId1 ?? params.tokens[1].assetId;
    this.domain = params.domain;
    this.isCustom = params.isCustom;
    this.artefactOriginTransactionId = params.artefactOriginTransactionId;
    this.owner = params.owner;
    this.swapFee = params.swapFee ?? 2;
    this.createdAt = params.createdAt ?? "";
    this.statistics = params.statistics;

    makeAutoObservable(this);
  }

  currentPrice = (
    assetId0: string,
    assetId1: string,
    coefficient = 1
  ): BN | null => {
    if (this.tokens == null) return null;
    const asset0 = this.getAssetById(assetId0);
    const asset1 = this.getAssetById(assetId1);
    if (asset0?.share == null || asset1?.share == null) return null;
    const { decimals: decimals0, share: shareAmount0 } = asset0;
    const { decimals: decimals1, share: shareAmount1 } = asset1;
    const liquidity0 = this.liquidity[assetId0];
    const liquidity1 = this.liquidity[assetId1];
    if (liquidity0 == null || liquidity1 == null) return null;
    const topValue = BN.formatUnits(liquidity1, decimals1).div(shareAmount1);
    const bottomValue = BN.formatUnits(liquidity0, decimals0).div(shareAmount0);
    return topValue.div(bottomValue).times(coefficient);
  };

  get indexTokenRate() {
    if (this.globalPoolTokenAmount == null || this.globalPoolTokenAmount.eq(0))
      return BN.ZERO;
    return this.globalLiquidity.div(
      BN.formatUnits(this.globalPoolTokenAmount, 8)
    );
  }

  syncLiquidity = (data?: IData[]) => {
    if (data == null) return;
    const balances = data.reduce<Record<string, BN>>((acc, { key, value }) => {
      const regexp = new RegExp("global_(.*)_balance");
      regexp.test(key) && (acc[key.match(regexp)![1]] = new BN(value));
      return acc;
    }, {});
    this.setLiquidity(balances);

    const globalPoolTokenAmount = data.find(
      (v) => v.key === "global_poolToken_amount"
    );
    if (globalPoolTokenAmount?.value != null) {
      this.setGlobalPoolTokenAmount(new BN(globalPoolTokenAmount.value));
    }

    const globalVolumeValue = data.find((v) => v.key === "global_volume");
    if (globalVolumeValue?.value != null) {
      const globalVolume = new BN(globalVolumeValue.value).div(1e6);
      this.setGlobalVolume(globalVolume);
    }
    const usdnAsset = this.tokens.find(({ symbol }) => symbol === "USDN")!;
    const usdnLiquidity = this.liquidity[usdnAsset?.assetId];

    const puzzleAsset = this.tokens.find(({ symbol }) => symbol === "PUZZLE")!;
    const puzzleLiquidity = this.liquidity[puzzleAsset?.assetId];

    let globalLiquidityByUSDN = null;
    let globalLiquidityByPuzzle = null;
    if (usdnAsset && usdnLiquidity) {
      globalLiquidityByUSDN = new BN(usdnLiquidity)
        .div(usdnAsset.share)
        .times(100)
        .div(1e6);
    } else if (puzzleAsset && puzzleLiquidity) {
      globalLiquidityByPuzzle = new BN(puzzleLiquidity)
        .div(puzzleAsset.share)
        .times(100)
        .div(1e8);
    }
    this.setGlobalLiquidityByUSDN(globalLiquidityByUSDN);
    this.setGlobalLiquidityByPUZZLE(globalLiquidityByPuzzle);
  };

  getAccountLiquidityInfo = async (user: string): Promise<IShortPoolInfo> => {
    const keysArray = {
      addressIndexStaked: `${user}_indexStaked`,
      globalIndexStaked: `global_indexStaked`,
      globalPoolTokenAmount: "global_poolToken_amount",
      globalEarnedByOwner: "global_earnedByOwner",
    };
    const [values, staticPoolDomainValue] = await Promise.all([
      this.contractKeysRequest(Object.values(keysArray)),
      this.contractKeysRequest(`static_poolDomain`),
    ]);
    const staticPoolDomain =
      staticPoolDomainValue?.length === 1 ? staticPoolDomainValue[0].value : "";
    const parsedNodeResponse = [...(values ?? [])].reduce<Record<string, BN>>(
      (acc, { key, value }) => {
        Object.entries(keysArray).forEach(([regName, regValue]) => {
          const regexp = new RegExp(regValue);
          if (regexp.test(key)) {
            acc[regName] = new BN(value);
          }
        });
        return acc;
      },
      {}
    );
    const globalEarnedByOwner = parsedNodeResponse["globalEarnedByOwner"];
    this.setGlobalEarnedByOwner(globalEarnedByOwner);
    const addressIndexStaked = parsedNodeResponse["addressIndexStaked"];
    const globalIndexStaked = parsedNodeResponse["globalIndexStaked"];
    const globalPoolTokenAmount = parsedNodeResponse["globalPoolTokenAmount"];
    const indexTokenRate = this.globalLiquidity.div(
      BN.formatUnits(globalPoolTokenAmount, 8)
    );

    if (addressIndexStaked == null || addressIndexStaked.eq(0)) {
      return {
        addressStaked: BN.ZERO,
        liquidityInUsdn: BN.ZERO,
        shareOfPool: BN.ZERO,
        pool: this,
        indexTokenRate,
        indexTokenName: " PZ" + staticPoolDomain,
      };
    }

    const liquidityInUsdn = this.globalLiquidity
      .times(addressIndexStaked)
      .div(globalIndexStaked);
    const percent = liquidityInUsdn
      .times(new BN(100))
      .div(this.globalLiquidity);

    return {
      liquidityInUsdn,
      addressStaked: addressIndexStaked,
      shareOfPool: percent,
      pool: this,
      indexTokenRate,
      indexTokenName: " PZ " + staticPoolDomain,
    };
  };

  getAccountLiquidityInfoByState = (
    user: string,
    state: IData[]
  ): IShortPoolInfo => {
    const addressIndexStaked = new BN(
      getStateByKey(state, `${user}_indexStaked`) ?? 0
    );
    const globalIndexStaked = new BN(
      getStateByKey(state, `global_indexStaked`) ?? 0
    );
    const globalPoolTokenAmount = new BN(
      getStateByKey(state, "globalPoolTokenAmount") ?? 0
    );
    const indexTokenRate =
      globalPoolTokenAmount && globalPoolTokenAmount.gt(0)
        ? this.globalLiquidity.div(BN.formatUnits(globalPoolTokenAmount, 8))
        : BN.ZERO;

    if (addressIndexStaked == null || addressIndexStaked.eq(0)) {
      return {
        addressStaked: BN.ZERO,
        liquidityInUsdn: BN.ZERO,
        shareOfPool: BN.ZERO,
        pool: this,
        indexTokenRate,
        indexTokenName: " PZ " + this.domain,
      };
    }

    const liquidityInUsdn = this.globalLiquidity
      .times(addressIndexStaked)
      .div(globalIndexStaked);
    const percent = liquidityInUsdn
      .times(new BN(100))
      .div(this.globalLiquidity);
    return {
      liquidityInUsdn,
      addressStaked: addressIndexStaked,
      shareOfPool: percent,
      pool: this,
      indexTokenRate,
      indexTokenName: " PZ " + this.domain,
    };
  };

  contractKeysRequest = (keys: string[] | string) =>
    nodeService.nodeKeysRequest(this.contractAddress, keys);
}

export default Pool;
