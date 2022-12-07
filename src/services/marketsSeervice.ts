import axios from "axios";
import { IData } from "@src/entities/Market";

export interface IMarket {
  title: string;
  description: string;
  contractAddress: string;
  assets?: string[];
  statistics?: {
    totalBorrowed: string;
    totalSupplied: string;
  };
}

export interface IMarketConfig extends IMarket {
  statistics?: {
    totalBorrowed: string;
    totalSupplied: string;
  };
}

export type IMarketState = {
  state: IData[];
  contractAddress: string;
};

export interface IMarketsStatsResponse {
  totalBorrowed: string;
  totalSupplied: string;
}

const marketService = {
  getMarketByContractAddress: async (
    address: string
  ): Promise<IMarketConfig> => {
    const req = `${process.env.REACT_APP_API_BASE}/api/v1/markets/${address}`;
    const { data } = await axios.get(req);
    return data;
  },
  getMarkets: async (): Promise<Array<IMarketConfig>> => {
    const { data } = await axios.get(
      `${process.env.REACT_APP_API_BASE}/api/v1/markets`
    );
    return data;
  },
  getStats: async (): Promise<IMarketsStatsResponse> => {
    const { data } = await axios.get(
      `${process.env.REACT_APP_API_BASE}/api/v1/stats`
    );
    return data;
  },

  //fixme
  getMarketsStateByUserAddress: async (
    address?: string | null
  ): Promise<IMarketState[]> => {
    const req = `${process.env.REACT_APP_API_BASE}/api/v1/state/${
      address ?? ""
    }`;
    const { data } = await axios.get(req);
    return data;
  }
};
export default marketService;
