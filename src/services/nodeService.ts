import { IEvaluateScript, ITransaction } from "@src/utils/types";
import makeNodeRequest from "@src/utils/makeNodeRequest";
import axios from "axios";

export interface INodeData {
  key: string;
  type: "integer" | "string";
  value: number | string;
}

export interface IAsset {
  assetId: string;
  issueHeight: number;
  issueTimestamp: number;
  issuer: string;
  issuerPublicKey: string;
  name: string;
  description: string;
  decimals: number;
  reissuable: boolean;
  quantity: number;
  scripted: boolean;
  minSponsoredAssetFee: null | number;
  originTransactionId: string;
}

export interface INFT {
  assetId: string;
  decimals: number;
  description: string;
  issueHeight: number;
  issueTimestamp: number;
  issuer: string;
  issuerPublicKey: string;
  minSponsoredAssetFee: null | any;
  name: string;
  originTransactionId: string;
  quantity: number;
  reissuable: boolean;
  scripted: boolean;
  typeId?: string;
}

interface IBalance {
  assetId: string;
  balance: number;
}

interface IAssetDetails {
  assetId: string;
  issueHeight: number;
  issueTimestamp: number;
  issuer: string;
  issuerPublicKey: string;
  name: string;
  description: string;
  decimals: number;
  reissuable: boolean;
  quantity: number;
  scripted: boolean;
  minSponsoredAssetFee: null | any;
  originTransactionId: string;
}

const testnetNodes = ["https://nodes-testnet.wavesnodes.com"];

const mainnetNodes = [
  "https://nodes-puzzle.wavesnodes.com",
  "https://nodes.wavesnodes.com",
  "https://wavesducks.wavesnodes.com",
  "https://nodes.swop.fi"
];

interface IParams {
  chainId?: "T" | "W";
  postData?: any;
}

const request = async (request: string, params?: IParams): Promise<any> => {
  const nodes =
    params?.chainId == null || params.chainId === "W"
      ? mainnetNodes
      : testnetNodes;
  return new Promise(async (resolve, reject) => {
    let nodeIndex = 0;
    let success = false;
    while (!success) {
      const url = nodes[nodeIndex] + request;
      try {
        const response = await (params?.postData == null
          ? axios.get(url)
          : axios.post(url, params.postData));
        success = true;
        resolve(response);
      } catch (reason) {
        if (nodeIndex === nodes.length - 1) {
          success = true;
          reject(reason);
        } else {
          nodeIndex = nodeIndex + 1;
        }
      }
    }
  });
};
const getAddressNfts = async (address: string): Promise<INFT[]> => {
  const url = `/assets/nft/${address}/limit/1000`;
  const { data } = await makeNodeRequest(url);
  return data;
};
const evaluate = async (
  address: string,
  expression: string
): Promise<IEvaluateScript> => {
  const url = `/utils/script/evaluate/${address}`;
  const { data } = await makeNodeRequest(url, {
    postData: { expr: expression }
  });
  return data;
};
const getAssetDetails = async (assetId: string): Promise<IAsset | null> => {
  const url = `/assets/details/${assetId}`;
  const { data } = await makeNodeRequest(url);
  return data;
};
const getAddressBalances = async (
  address: string | null
): Promise<IBalance[]> => {
  if (address == null) return [];
  const assetsUrl = `/assets/balance/${address}`;
  const wavesUrl = `/addresses/balance/details/${address}`;
  return (
    await Promise.all([
      makeNodeRequest(assetsUrl).then(({ data }) => data),
      makeNodeRequest(wavesUrl).then(({ data }) => ({
        balances: [{ balance: data.regular, assetId: "WAVES" }]
      }))
    ])
  ).reduce<{ assetId: string; balance: number }[]>(
    (acc, { balances }) => [...acc, ...balances],
    []
  );
};
const nodeKeysRequest = async (
  contract: string,
  keys: string[] | string
): Promise<INodeData[]> => {
  if (keys.length === 0) return [];
  const req = `/addresses/data/${contract}`;
  const postData = { keys: typeof keys === "string" ? [keys] : keys };
  const response = await makeNodeRequest(req, { postData })
    .then(({ data }) => data)
    .catch((e) => {
      console.error(e);
      return [];
    });
  if (response) {
    return response;
  } else {
    return [];
  }
};
const nodeMatchRequest = async (
  contract: string,
  match: string
): Promise<INodeData[]> => {
  const url = `/addresses/data/${contract}?matches=${match}`;
  const response: { data: INodeData[] } = await makeNodeRequest(url);
  if (response.data) {
    return response.data;
  } else {
    return [];
  }
};
const transactionInfo = async (txId: string): Promise<ITransaction | null> => {
  const url = `/transactions/info/${txId}`;
  const response: { data: ITransaction } = await makeNodeRequest(url);
  if (response.data) {
    return response.data;
  } else {
    return null;
  }
};
const transactions = async (
  address: string,
  limit = 10,
  after?: string
): Promise<ITransaction[] | null> => {
  const urlSearchParams = new URLSearchParams();
  if (after != null) {
    urlSearchParams.set("after", after);
  }
  const url = `/transactions/address/${address}/limit/${limit}?${
    after != null ? urlSearchParams.toString() : ""
  }`;
  const response: { data: [ITransaction[]] } = await makeNodeRequest(url);
  if (response.data[0]) {
    return response.data[0];
  } else {
    return null;
  }
};
const assetDetails = async (assetId: string): Promise<IAssetDetails | null> => {
  const url = `/assets/details/${assetId}`;
  const response: { data: IAssetDetails } = await makeNodeRequest(url);
  if (response.data) {
    return response.data;
  } else {
    return null;
  }
};

export default {
  request,
  getAddressNfts,
  evaluate,
  getAssetDetails,
  getAddressBalances,
  nodeKeysRequest,
  nodeMatchRequest,
  transactionInfo,
  transactions,
  assetDetails
};
