import axios from "axios";
import BN from "@src/utils/BN";

export type TCalcRouteExchangeItem = {
  amountIn: number;
  amountOut: number;
  from: string;
  pool: string;
  to: string;
  type: string;
};

export type TCalcRoute = {
  exchanges: Array<TCalcRouteExchangeItem>;
  in: number;
};

export interface ICalcResponse {
  aggregatedProfit: number;
  estimatedOut: number;
  priceImpact: number;
  parameters: string;
  routes: Array<TCalcRoute>;
}

const aggregatorService = {
  calc: async (
    assetId0: string,
    assetId1: string,
    amount: BN
  ): Promise<ICalcResponse> => {
    const url = `https://waves.puzzle-aggr-api.com/aggregator/calc?token0=${assetId0}&token1=${assetId1}&amountIn=${amount.toString()}`;
    // const url = `https://stage.puzzle-aggr-api.com/aggregator/calc?token0=${assetId0}&token1=${assetId1}&amountIn=${amount.toString()}`;
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_AGGREGATOR_KEY}`,
      },
    });
    return data;
  },
};
export default aggregatorService;
