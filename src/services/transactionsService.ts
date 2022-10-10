import axios from "axios";

const transactionsService = {
  getTransactions: async (
    params: Array<[string, string | number | boolean]>
  ) => {
    const search =
      params.length > 0
        ? `?${params.map(([k, v]) => `${k}=${String(v)}`).join("&")}`
        : "";
    const url =
      `${process.env.REACT_APP_API_BASE}/api/v1/transactions` + search;
    const { data } = await axios.get(url);
    return data;
  },
};

export default transactionsService;
