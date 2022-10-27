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
  DASHBOARD: "/",
  DASHBOARD_MODAL_WITHDRAW: "",
  DASHBOARD_MODALS: {
    [OPERATIONS_TYPE.SUPPLY]: ":modalPoolId/supply/:tokenId",
    [OPERATIONS_TYPE.WITHDRAW]: ":modalPoolId/withdraw/:tokenId",
    [OPERATIONS_TYPE.BORROW]: ":modalPoolId/borrow/:tokenId",
    [OPERATIONS_TYPE.REPAY]: ":modalPoolId/repay/:tokenId"
  },
  DASHBOARD_POOL: "/:poolId",
  DASHBOARD_TOKEN_DETAILS: "/:poolId/:assetId",
  ANALYTICS: "/:poolId/analytics",
  NOT_FOUND: "/404"
};

export const POOLS_PROD = [
  {
    name: "Main Pool",
    address: "3P4uA5etnZi4AmBabKinq2bMiWU8KcnHZdH"
  }
];

export const POOLS_DEV = [
  {
    name: "Main Pool",
    address: "3P6dkRGSqgsNpQFbSYn9m8n4Dd8KRaj5TUU"
  },
  {
    name: "Puzzle Pool",
    address: "3PEhGDwvjrjVKRPv5kHkjfDLmBJK1dd2frT"
  }
];

export const POOLS_LIST = {
  PROD: POOLS_PROD,
  DEV: POOLS_DEV
};

export const POOLS =
  POOLS_LIST[process?.env?.REACT_APP_NODE_ENV as keyof typeof POOLS_LIST] ??
  POOLS_LIST.PROD;

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
