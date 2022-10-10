import tokens from "./tokens.json";
import tokensDetails from "./tokenDetails.json";
import nftsPics from "@src/constants/nftsPics";
import tokenLogos from "@src/constants/tokenLogos";

export const ROUTES = {
  ROOT: "/",
  NOT_FOUND: "/404",
  STAKE: "/stake",
  TRADE: "/trade",
  LIMIT_ORDER: "/limitOrder",
  OLD_EXPLORE: "/classic-explore",
  EXPLORE: "/explore",
  EXPLORE_TOKEN: "/explore/token/:assetId",
  INVEST: "/invest",
  ULTRASTAKE: "/ultrastake",
  WALLET: "/wallet",
  TRANSFER: "/transfer",
  POOLS_WITHDRAW: "/pools/:poolDomain/withdraw",
  POOLS_ADD_LIQUIDITY: "/pools/:poolDomain/addLiquidity",
  POOLS_ADD_ONE_TOKEN: "/pools/:poolDomain/addOneToken",
  POOLS_INVEST: "/pools/:poolDomain/invest",
  POOLS_CREATE: "/pools/create",
  POOL_SWAP: "/pools/:poolDomain",
  POOL_BOOST: "/pools/:poolDomain/boost",
};

export const TOKEN_DETAILS_BY_SYMBOL: Record<string, string> = tokensDetails;

export const TOKENS_LIST: Array<IToken> = Object.values(tokens).map((t) => ({
  ...t,
  logo: tokenLogos[t.symbol],
}));
export const TOKENS_BY_SYMBOL: Record<string, IToken> = TOKENS_LIST.reduce(
  (acc, t) => ({ ...acc, [t.symbol]: t }),
  {}
);
export const TOKENS_BY_ASSET_ID: Record<string, IToken> = TOKENS_LIST.reduce(
  (acc, t) => ({ ...acc, [t.assetId]: t }),
  {}
);
export const POOL_CONFIG: IPoolConfig[] = [
  {
    domain: "tsunami",
    contractAddress: "3PN1eJpdhJyRptcN9iLTarsJBtR2Kb3NXSU",
    layer2Address: "3P9nxQiTo73ZASrxaVCA7o95gymQbSp7GXf",
    baseTokenId: TOKENS_BY_SYMBOL.TSN.assetId,
    title: "Tsunami ILO Pool",
    logo: tokenLogos.TSN,
    defaultAssetId0: TOKENS_BY_SYMBOL.TSN.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.USDN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.TSN, share: 90, logo: tokenLogos.TSN },
      { ...TOKENS_BY_SYMBOL.USDN, share: 10, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "pool10",
    contractAddress: "3PLiXyywNThdvf3vVEUxwc7TJTucjZvuegh",
    layer2Address: "3P4oa7KAvocZhPXQ1B6ncAopzLEZUtMwbHF",
    baseTokenId: TOKENS_BY_SYMBOL.BTC.assetId,
    title: "Pool 10",
    logo: tokenLogos.BTC,
    defaultAssetId0: TOKENS_BY_SYMBOL.BTC.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.USDN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.WAVES, share: 25, logo: tokenLogos.WAVES },
      { ...TOKENS_BY_SYMBOL.BTC, share: 25, logo: tokenLogos.BTC },
      { ...TOKENS_BY_SYMBOL.ETH, share: 25, logo: tokenLogos.ETH },
      { ...TOKENS_BY_SYMBOL.USDN, share: 25, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "nsbt",
    contractAddress: "3PEStCRPQuW3phthTtQ5upGeb4WZ47kssyM",
    layer2Address: "3PD7yAzyCEMNBnXzE8AuSsqogHUpSLjwAYA",
    baseTokenId: TOKENS_BY_SYMBOL.NSBT.assetId,
    title: "sNSBT/NSBT pool",
    logo: tokenLogos.SNSBT,
    defaultAssetId0: TOKENS_BY_SYMBOL.SNSBT.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.NSBT.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.SNSBT, share: 75, logo: tokenLogos.SNSBT },
      { ...TOKENS_BY_SYMBOL.NSBT, share: 20, logo: tokenLogos.NSBT },
      { ...TOKENS_BY_SYMBOL.USDN, share: 5, logo: tokenLogos.USDN },
    ],
  },
  // {
  //   domain: "vlad",
  //   contractAddress: "3P98RJpxfwZpNfAcLjLWMnesX65dpW64Rim",
  //   layer2Address: "3PEsmFNhWpPW9AA8Th95hfLWz3bCVY18QAA",
  //   baseTokenId: TOKENS_BY_SYMBOL.VLAD.assetId,
  //   title: "VLAD Pool",
  //   logo: tokenLogos.VLAD,
  //   defaultAssetId0: TOKENS_BY_SYMBOL.VLAD.assetId,
  //   defaultAssetId1: TOKENS_BY_SYMBOL.PUZZLE.assetId,
  //   tokens: [
  //     { ...TOKENS_BY_SYMBOL.VLAD, share: 50, logo: tokenLogos.VLAD },
  //     { ...TOKENS_BY_SYMBOL.PUZZLE, share: 50, logo: tokenLogos.PUZZLE }
  //   ],
  // },
  {
    domain: "vusd",
    contractAddress: "3PCq2VqxGMmEyB8gLoUi8KuV9tYSD3VMC74",
    layer2Address: "3P6oobNcfLt69HMzQC37JAAGBWtrygU4amc",
    baseTokenId: TOKENS_BY_SYMBOL.USDN.assetId,
    title: "Vires USD Pool",
    logo: tokenLogos.USDN,
    defaultAssetId0: TOKENS_BY_SYMBOL.VIRES_USDC_LP.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.USDN.assetId,
    tokens: [
      {
        ...TOKENS_BY_SYMBOL.VIRES_USDT_LP,
        share: 30,
        logo: tokenLogos.VIRES_USDT_LP,
      },
      {
        ...TOKENS_BY_SYMBOL.VIRES_USDC_LP,
        share: 30,
        logo: tokenLogos.VIRES_USDC_LP,
      },
      { ...TOKENS_BY_SYMBOL.USDN, share: 40, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "www",
    contractAddress: "3PAviuHPCX8fD7M5fGpFTQZb4HchWCJb3ct",
    layer2Address: "3PFF8UuNfvAGk6KvgyeD4HfZ4TRmHgtgt5W",
    baseTokenId: TOKENS_BY_SYMBOL.WX.assetId,
    title: "WWW Pool 🔥",
    logo: tokenLogos.WX,
    defaultAssetId0: TOKENS_BY_SYMBOL.WX.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.USDN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.WX, share: 60, logo: tokenLogos.WX },
      { ...TOKENS_BY_SYMBOL.WCT, share: 10, logo: tokenLogos.WCT },
      { ...TOKENS_BY_SYMBOL.WEST, share: 10, logo: tokenLogos.WEST },
      { ...TOKENS_BY_SYMBOL.USDN, share: 20, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "snsbttci",
    contractAddress: "3PPrsyW3VuxU15FuBKfbVh5JdmAkmU3ApPv",
    layer2Address: "3P44Y7if4hZAgUn9K3R7buzb3TQn6NzTcu7",
    baseTokenId: TOKENS_BY_SYMBOL.USDN.assetId,
    title: "sNSBT_TCI pool",
    logo: tokenLogos.SNSBTTCI,
    defaultAssetId0: TOKENS_BY_SYMBOL.SNSBTTCI.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.SNSBT.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.SNSBTTCI, share: 75, logo: tokenLogos.SNSBTTCI },
      { ...TOKENS_BY_SYMBOL.SNSBT, share: 10, logo: tokenLogos.SNSBT },
      { ...TOKENS_BY_SYMBOL.WAVES, share: 10, logo: tokenLogos.WAVES },
      { ...TOKENS_BY_SYMBOL.USDN, share: 5, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "sheg",
    contractAddress: "3PC87Z4vUzet6tTrTQmzJmW1UtouKjLhBJi",
    layer2Address: "3PJvGRBaL5FrK5tHax6cJvkZWrHtDUmiDdF",
    baseTokenId: TOKENS_BY_SYMBOL.SHEG.assetId,
    title: "Ducklization IDO Pool",
    logo: tokenLogos.SHEG,
    defaultAssetId0: TOKENS_BY_SYMBOL.SHEG.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.USDN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.SHEG, share: 50, logo: tokenLogos.SHEG },
      { ...TOKENS_BY_SYMBOL.USDN, share: 25, logo: tokenLogos.USDN },
      { ...TOKENS_BY_SYMBOL.WAVES, share: 13, logo: tokenLogos.WAVES },
      { ...TOKENS_BY_SYMBOL.EGG, share: 12, logo: tokenLogos.EGG },
    ],
  },
  {
    domain: "muna",
    contractAddress: "3P9EydokbUM5XFrHgEUT9bNVgfF7fGmtxLk",
    layer2Address: "3PLAM86Pm7jR3RTe7JSit2FDf8DnhF8ogG6",
    baseTokenId: TOKENS_BY_SYMBOL.MUNA.assetId,
    title: "Muna BNB Pool",
    logo: tokenLogos.MUNA,
    defaultAssetId0: TOKENS_BY_SYMBOL.MUNA.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.BNB.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.MUNA, share: 50, logo: tokenLogos.MUNA },
      { ...TOKENS_BY_SYMBOL.BNB, share: 25, logo: tokenLogos.BNB },
      { ...TOKENS_BY_SYMBOL.USDN, share: 25, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "winter",
    contractAddress: "3PEZe3Z2FqaVbMTjWJUpnQGxhWh2JRptujM",
    layer2Address: "3PNBamg45irg9R58gMBM6UvBaUhX5bVys2r",
    baseTokenId: TOKENS_BY_SYMBOL.USDN.assetId,
    title: "Warm Winter Pool ❄️",
    logo: tokenLogos.USDC,
    defaultAssetId0: TOKENS_BY_SYMBOL.EURN.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.USDN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.USDC, share: 30, logo: tokenLogos.USDC },
      { ...TOKENS_BY_SYMBOL.USDT, share: 10, logo: tokenLogos.USDT },
      { ...TOKENS_BY_SYMBOL.USDN, share: 20, logo: tokenLogos.USDN },
      { ...TOKENS_BY_SYMBOL.PUZZLE, share: 22, logo: tokenLogos.PUZZLE },
      { ...TOKENS_BY_SYMBOL.VIRES, share: 8, logo: tokenLogos.VIRES },
      { ...TOKENS_BY_SYMBOL.EURN, share: 10, logo: tokenLogos.EURN },
    ],
  },
  {
    domain: "defi",
    contractAddress: "3PDrYPF6izza2sXWffzTPF7e2Fcir2CMpki",
    layer2Address: "3PJAg4A4gPQXtSLKQNAf5VxbXV2QVM9wPei",
    baseTokenId: TOKENS_BY_SYMBOL.USDN.assetId,
    title: "Waves DeFi Pool 🔹",
    logo: tokenLogos.WAVES,
    defaultAssetId0: TOKENS_BY_SYMBOL.EGG.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.USDN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.WAVES, share: 20, logo: tokenLogos.WAVES },
      { ...TOKENS_BY_SYMBOL.EGG, share: 10, logo: tokenLogos.EGG },
      { ...TOKENS_BY_SYMBOL.SWOP, share: 5, logo: tokenLogos.SWOP },
      { ...TOKENS_BY_SYMBOL.VIRES, share: 5, logo: tokenLogos.VIRES },
      { ...TOKENS_BY_SYMBOL.NSBT, share: 5, logo: tokenLogos.NSBT },
      { ...TOKENS_BY_SYMBOL.ENNO, share: 5, logo: tokenLogos.ENNO },
      { ...TOKENS_BY_SYMBOL.SIGN, share: 5, logo: tokenLogos.SIGN },
      { ...TOKENS_BY_SYMBOL.PUZZLE, share: 20, logo: tokenLogos.PUZZLE },
      { ...TOKENS_BY_SYMBOL.USDT, share: 10, logo: tokenLogos.USDT },
      { ...TOKENS_BY_SYMBOL.USDN, share: 15, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "megapool",
    contractAddress: "3PLU2okk1GVdoGW7CGbtCwRqFmHfLhsQimc",
    layer2Address: "3P9rH2R75qNGhj9BfHT9t67hnofqLCJKGWx",
    baseTokenId: TOKENS_BY_SYMBOL.PUZZLE.assetId,
    title: "Mega Pool",
    logo: tokenLogos.CRV,
    defaultAssetId0: TOKENS_BY_SYMBOL.CRV.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.DAI.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.CRV, share: 10, logo: tokenLogos.CRV },
      { ...TOKENS_BY_SYMBOL.FTM, share: 10, logo: tokenLogos.FTM },
      { ...TOKENS_BY_SYMBOL.YFI, share: 10, logo: tokenLogos.YFI },
      { ...TOKENS_BY_SYMBOL.SHIB, share: 10, logo: tokenLogos.SHIB },
      { ...TOKENS_BY_SYMBOL.MATIC, share: 10, logo: tokenLogos.MATIC },
      { ...TOKENS_BY_SYMBOL.UNI, share: 10, logo: tokenLogos.UNI },
      { ...TOKENS_BY_SYMBOL.LINK, share: 10, logo: tokenLogos.LINK },
      { ...TOKENS_BY_SYMBOL.TN, share: 10, logo: tokenLogos.TN },
      { ...TOKENS_BY_SYMBOL.DAI, share: 10, logo: tokenLogos.DAI },
      { ...TOKENS_BY_SYMBOL.PUZZLE, share: 10, logo: tokenLogos.PUZZLE },
    ],
  },
  {
    domain: "farms",
    contractAddress: "3PPRHHF9JKvDLkAc3aHD3Kd5tRZp1CoqAJa",
    layer2Address: "3PDVDYZiwJzK3pu8vcknuLiKCYBPx6XZntG",
    baseTokenId: TOKENS_BY_SYMBOL.EGG.assetId,
    title: "Pool Farms 1",
    logo: tokenLogos.EGG,
    defaultAssetId0: TOKENS_BY_SYMBOL.MATH.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.USDN.assetId,
    tokens: [
      {
        ...TOKENS_BY_SYMBOL.DUXPLORER,
        share: 10,
        logo: tokenLogos.DUXPLORER,
      },
      { ...TOKENS_BY_SYMBOL.MATH, share: 10, logo: tokenLogos.MATH },
      { ...TOKENS_BY_SYMBOL.TURTLE, share: 10, logo: tokenLogos.TURTLE },
      {
        ...TOKENS_BY_SYMBOL.EGGSEGGS,
        share: 10,
        logo: tokenLogos.EGGSEGGS,
      },
      {
        ...TOKENS_BY_SYMBOL.PESOLATINO,
        share: 10,
        logo: tokenLogos.PESOLATINO,
      },
      { ...TOKENS_BY_SYMBOL.FOMO, share: 10, logo: tokenLogos.FOMO },
      { ...TOKENS_BY_SYMBOL.MUNDO, share: 10, logo: tokenLogos.MUNDO },
      {
        ...TOKENS_BY_SYMBOL.EGGPOINT,
        share: 10,
        logo: tokenLogos.EGGPOINT,
      },
      { ...TOKENS_BY_SYMBOL.EGG, share: 10, logo: tokenLogos.EGG },
      { ...TOKENS_BY_SYMBOL.USDN, share: 10, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "farms2",
    contractAddress: "3PKYPKJPHZENAAwH9e7TF5edDgukNxxBt3M",
    layer2Address: "3PLNxoMJYKzcA8qQ7hQidGDaUJNvM4w36nj",
    baseTokenId: TOKENS_BY_SYMBOL.EGG.assetId,
    title: "Pool Farms 2",
    logo: tokenLogos.EGG,
    defaultAssetId0: TOKENS_BY_SYMBOL.MARVIN.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.USDN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.ENDO, share: 10, logo: tokenLogos.ENDO },
      { ...TOKENS_BY_SYMBOL.MARVIN, share: 10, logo: tokenLogos.MARVIN },
      { ...TOKENS_BY_SYMBOL.EGGMOON, share: 10, logo: tokenLogos.EGGMOON },
      { ...TOKENS_BY_SYMBOL.STREET, share: 10, logo: tokenLogos.STREET },
      { ...TOKENS_BY_SYMBOL.KOLKHOZ, share: 10, logo: tokenLogos.KOLKHOZ },
      { ...TOKENS_BY_SYMBOL.FORKLOG, share: 10, logo: tokenLogos.FORKLOG },
      { ...TOKENS_BY_SYMBOL.CGU, share: 10, logo: tokenLogos.CGU },
      { ...TOKENS_BY_SYMBOL.EGG, share: 20, logo: tokenLogos.EGG },
      { ...TOKENS_BY_SYMBOL.USDN, share: 10, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "race",
    contractAddress: "3PNK5ypnPJioLmLUzfK6ezpaePHLxZd6QLj",
    layer2Address: "3PQSAdwsdyPVVpfBwjtgXboVXUZgeYHycWM",
    baseTokenId: TOKENS_BY_SYMBOL.USDN.assetId,
    title: "Race Mega Pool 🚜",
    logo: tokenLogos.RACE,
    defaultAssetId0: TOKENS_BY_SYMBOL.RACE.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.USDN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.EGG, share: 40, logo: tokenLogos.EGG },
      { ...TOKENS_BY_SYMBOL.RACE, share: 40, logo: tokenLogos.RACE },
      { ...TOKENS_BY_SYMBOL.USDN, share: 20, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "egg",
    contractAddress: "3PMHkdVCzeLAYuCh92FPtusuxdLk5xMB51y",
    layer2Address: "3P84BhX5dCVs1TCgYnGa57kCHrMz4mUBXyE",
    baseTokenId: TOKENS_BY_SYMBOL.EGG.assetId,
    title: "Egg Uneven Pool 🥚",
    logo: tokenLogos.EGG,
    defaultAssetId0: TOKENS_BY_SYMBOL.USDN.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.EGG.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.EGG, share: 80, logo: tokenLogos.EGG },
      { ...TOKENS_BY_SYMBOL.USDN, share: 20, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "puzzle",
    contractAddress: "3PFDgzu1UtswAkCMxqqQjbTeHaX4cMab8Kh",
    baseTokenId: TOKENS_BY_SYMBOL.USDN.assetId,
    title: "Puzzle Pool",
    logo: tokenLogos.PUZZLE,
    defaultAssetId0: TOKENS_BY_SYMBOL.PUZZLE.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.USDN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.USDT, share: 10, logo: tokenLogos.USDT },
      { ...TOKENS_BY_SYMBOL.PUZZLE, share: 80, logo: tokenLogos.PUZZLE },
      { ...TOKENS_BY_SYMBOL.USDN, share: 10, logo: tokenLogos.USDN },
    ],
  },
];
export const CONTRACT_ADDRESSES = {
  staking: "3PFTbywqxtFfukX3HyT881g4iW5K4QL3FAS",
  ultraStaking: "3PKUxbZaSYfsR7wu2HaAgiirHYwAMupDrYW",
  aggregator: "3PGFHzVGT4NTigwCKP1NcwoXkodVZwvBuuU",
  nfts: "3PFQjjDMiZKQZdu5JqTHD7HwgSXyp9Rw9By",
  createArtefacts: "3PFkgvC9y6zHy64zEAscKKgaNY3yipiLqbW",
  boost: "3PAeY7RgwuNUZNscGqahqJxFTFDkh7fbNwJ",
  calcReward: "3PAeY7RgwuNUZNscGqahqJxFTFDkh7fbNwJ",
  limitOrders: "3PPrfNMnk8z8QhZcqMyJk69mF65s2Rbz3B6",
  proxyLimitOrders: "3PM4Mn2iwQnUkeMxTJJAuriiVEGAcQwDU5H",
};
export const PUZZLE_NFTS = [
  {
    name: "Puzzle Surf",
    desc: "Puzzle Surf artefact can be used to launch a custom pool on Puzzle Swap (PuzzleSwap.org).",
    image: nftsPics.SURF,
  },
  {
    name: "Puzzle Desert",
    desc: "Puzzle Desert artefact can be used to launch a custom pool on Puzzle Swap (PuzzleSwap.org).",
    image: nftsPics.DESERT,
  },
  {
    name: "Puzzle Airplane",
    desc: "Puzzle Airplane artefact can be used to launch a custom pool on Puzzle Swap (PuzzleSwap.org).",
    image: nftsPics.AIRPLANE,
  },
  {
    name: "Puzzle Wheel",
    desc: "Puzzle Wheel artefact can be used to launch a custom pool on Puzzle Swap (PuzzleSwap.org).",
    image: nftsPics.WHEEL,
  },
  {
    name: "Puzzle Khalifa",
    desc: "Puzzle Khalifa artefact can be used to launch a custom pool on Puzzle Swap (PuzzleSwap.org).",
    image: nftsPics.KHALIFA,
  },
];

export const NODE_URL = "https://nodes-puzzle.wavesnodes.com";
export const EXPLORER_URL = "https://new.wavesexplorer.com";

export interface IToken {
  assetId: string;
  name: string;
  symbol: string;
  decimals: number;
  startPrice?: number;
  description?: string;
  logo: string;
  category?: string[];
}

export interface IPoolConfigStatistics {
  apy: string;
  boostedApy?: string;
  boostedDate?: string;
  monthlyVolume: string;
  weeklyVolume: string;
  monthlyFees: string;
  fees: string;
  liquidity: string;
  volume: Array<{ date: number; volume: string }>;
}

export interface IPoolConfig {
  domain: string;
  isCustom?: boolean;
  contractAddress: string;
  layer2Address?: string;
  baseTokenId: string;
  title: string;
  defaultAssetId0?: string;
  defaultAssetId1?: string;
  tokens: Array<IToken & { share: number }>;
  poolTokenName?: string;
  owner?: string;
  artefactOriginTransactionId?: string;
  swapFee?: number;
  createdAt?: string;
  logo?: string;
  statistics?: IPoolConfigStatistics;
}
