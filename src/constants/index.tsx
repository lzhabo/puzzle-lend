import tokens from "./tokens.json";
import tokenLogos from "@src/constants/tokenLogos";

export const ROUTES = {
  ROOT: "/",
  DASHBOARD: "/dashboard",
  NOT_FOUND: "/404",
};

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
