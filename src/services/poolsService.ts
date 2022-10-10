import axios from "axios";
import { TPoolState } from "@stores/PoolsStore";
import { IPoolConfigStatistics } from "@src/constants";

interface IAssetConfig {
  assetId: string;
  share: number;
}

export interface IStakingStatsResponse {
  stakingApy: string;
  aniaApy: string;
  eagleApy: string;
}

interface ICreatePoolData {
  domain: string;
  image: string;
  swapFee: number;
  owner: string;
  assets: IAssetConfig[];
  title: string;
  artefactOriginTransactionId: string;
}

interface IPoolSettings {
  domain: string;
  isCustom?: boolean;
  contractAddress: string;
  layer2Address?: string;
  baseTokenId: string;
  title: string;
  assets: Array<IAssetConfig>;
  logo: string;
  artefactOriginTransactionId?: string;
  owner: string;
}

const poolService = {
  getPoolByDomain: async (domain: string): Promise<IPoolSettings> => {
    const req = `${process.env.REACT_APP_API_BASE}/api/v1/pools/${domain}`;
    const { data } = await axios.get(req);
    return data;
  },
  updateStats: async (domain: string): Promise<void> => {
    await axios(
      `${process.env.REACT_APP_API_BASE}/api/v1/pools/update-stats/${domain}`,
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        data: { domain },
      }
    );
  },
  checkDomain: async (domain: string): Promise<boolean> => {
    await axios(`${process.env.REACT_APP_API_BASE}/api/v1/pools/check-domain`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      data: { domain },
    });
    return true;
  },
  createPool: async (data: ICreatePoolData): Promise<boolean> => {
    await axios(
      `${process.env.REACT_APP_API_BASE}/api/v1/pools/pool/${data.domain}`,
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        data,
      }
    );
    return true;
  },
  getPools: async (): Promise<
    Array<IPoolSettings & { statistics?: IPoolConfigStatistics }>
  > => {
    const { data } = await axios.get(
      `${process.env.REACT_APP_API_BASE}/api/v1/pools`
    );
    return data;
  },
  getStats: async (): Promise<IStakingStatsResponse> => {
    console.log(process.env.REACT_APP_API_BASE);
    const { data } = await axios.get(
      `${process.env.REACT_APP_API_BASE}/api/v1/stats`
    );
    return data;
  },
  getPoolsStateByUserAddress: async (
    address?: string | null
  ): Promise<TPoolState[]> => {
    const req = `${process.env.REACT_APP_API_BASE}/api/v1/state/${
      address ?? ""
    }`;
    const { data } = await axios.get(req);
    return data;
  },
  checkCustomPoolLimit: async (): Promise<boolean> => {
    const req = `${process.env.REACT_APP_API_BASE}/api/v1/pools/limit`;
    const { data } = await axios.get(req);
    return data.isLimited;
  },
};
export default poolService;
