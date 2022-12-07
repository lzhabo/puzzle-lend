import tokens from "./tokens.json";
import tokenLogos from "@src/constants/tokenLogos";

export enum OPERATIONS_TYPE {
  WITHDRAW = "withdraw",
  SUPPLY = "supply",
  BORROW = "borrow",
  REPAY = "repay"
}

export const ROUTES = {
  ROOT: "/",
  MARKETS: "/markets",
  MARKET: "/:marketId",
  MARKET_MODALS: {
    [OPERATIONS_TYPE.SUPPLY]: "/:marketId/supply/:tokenId",
    [OPERATIONS_TYPE.WITHDRAW]: "/:marketId/withdraw/:tokenId",
    [OPERATIONS_TYPE.BORROW]: "/:marketId/borrow/:tokenId",
    [OPERATIONS_TYPE.REPAY]: "/:marketId/repay/:tokenId"
  },
  MARKET_TOKEN_DETAILS: "/:marketId/:assetId",
  ANALYTICS: "/analytics",
  NOT_FOUND: "/404"
};

export const TOKENS_LIST: Array<IToken> = Object.values(tokens).map((t) => ({
  ...t,
  logo: tokenLogos[t.symbol]
}));
export const TOKENS_BY_SYMBOL: Record<string, IToken> = TOKENS_LIST.reduce(
  (acc, t) => ({ ...acc, [t.symbol]: t }),
  {}
);
export const TOKENS_BY_ASSET_ID: Record<string, IToken> = TOKENS_LIST.reduce(
  (acc, t) => ({ ...acc, [t.assetId]: t }),
  {}
);

export const NODE_URL = "https://nodes-puzzle.wavesnodes.com";
export const EXPLORER_URL = "https://new.wavesexplorer.com";

export interface IPool {
  name: string;
  address: string;
}

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

export enum ASSETS_TYPE {
  SUPPLY_BLOCK,
  HOME,
  BORROW_BLOCK
}
