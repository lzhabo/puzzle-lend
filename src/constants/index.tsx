import tokens from './tokens.json';
import tokenLogos from '@src/constants/tokenLogos';

export enum OPERATIONS_TYPE {
  WITHDRAW = 'withdraw',
  SUPPLY = 'supply',
  BORROW = 'borrow',
  REPAY = 'repay',
}

export const ROUTES = {
  ROOT: '/',
  DASHBOARD: '/',
  DASHBOARD_MODAL_WITHDRAW: '',
  DASHBOARD_MODALS: {
    [OPERATIONS_TYPE.SUPPLY]: ':modalPoolId/supply/:tokenId',
    [OPERATIONS_TYPE.WITHDRAW]: ':modalPoolId/withdraw/:tokenId',
  },
  DASHBOARD_POOL: '/:poolId',
  DASHBOARD_TOKEN_DETAILS: '/:poolId/:assetId',
  NOT_FOUND: '/404',
};

export const POOLS = [
  { name: 'Main Pool', address: '3P4uA5etnZi4AmBabKinq2bMiWU8KcnHZdH' },
];

export const TOKENS_LIST: Array<IToken> = Object.values(tokens).map(t => ({
  ...t,
  logo: tokenLogos[t.symbol],
}));
export const TOKENS_BY_SYMBOL: Record<string, IToken> = TOKENS_LIST.reduce(
  (acc, t) => ({ ...acc, [t.symbol]: t }),
  {},
);
export const TOKENS_BY_ASSET_ID: Record<string, IToken> = TOKENS_LIST.reduce(
  (acc, t) => ({ ...acc, [t.assetId]: t }),
  {},
);

export const NODE_URL = 'https://nodes-puzzle.wavesnodes.com';
export const EXPLORER_URL = 'https://new.wavesexplorer.com';

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
