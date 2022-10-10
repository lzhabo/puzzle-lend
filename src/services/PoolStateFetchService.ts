import nodeService from "@src/services/nodeService";
import { getStateByKey } from "@src/utils/getStateByKey";
import BN from "@src/utils/BN";
import { IToken, TOKENS_BY_ASSET_ID } from "@src/constants";

export type TPoolToken = {
  cf: BN;
  lt: BN;
  penalty: BN;
  interest: BN;
} & IToken;

class PoolStateFetchService {
  private readonly pool: string;
  constructor(pool: string) {
    this.pool = pool;
  }
  fetchSetups = async (): Promise<TPoolToken[]> => {
    const settingKeys = [
      "setup_tokens",
      "setup_ltvs",
      "setup_lts",
      "setup_penalties",
      "setup_interest",
      "setup_active",
    ];

    const settings = await nodeService.nodeKeysRequest(this.pool, settingKeys);

    const splitRecord = (rec?: string | number) =>
      rec ? String(rec).split(",") : null;

    const tokens = splitRecord(getStateByKey(settings, "setup_tokens"));
    const ltvs = splitRecord(getStateByKey(settings, "setup_ltvs")); //cf
    const lts = splitRecord(getStateByKey(settings, "setup_lts")); //lt
    const penalties = splitRecord(getStateByKey(settings, "setup_penalties"));
    const interest = splitRecord(getStateByKey(settings, "setup_interest"));
    const active = getStateByKey(settings, "setup_active");
    if (tokens == null || !active) throw new Error("pool not active");
    // console.log(
    //   poolTokens.map((t) => ({
    //     t: t.assetId,
    //     cf: t.cf.toString(),
    //     lt: t.lt.toString(),
    //     penalty: t.penalty.toString(),
    //     interest: t.interest.toString(),
    //   }))
    // );
    return tokens.map((assetId, index) => {
      const asset = TOKENS_BY_ASSET_ID[assetId];
      return {
        ...asset,
        cf: ltvs && ltvs[index] ? new BN(ltvs![index]).div(1e8) : BN.ZERO,
        lt: lts && lts[index] ? new BN(lts![index]).div(1e8) : BN.ZERO,
        penalty:
          penalties && penalties[index]
            ? new BN(penalties![index]).div(1e8)
            : BN.ZERO,
        interest:
          interest && interest[index]
            ? new BN(interest![index]).div(1e8)
            : BN.ZERO,
      };
    });
  };

  calculateTokenRates = async () => {
    const response = await nodeService.evaluate(
      this.pool,
      "calculateTokenRates(false)"
    );
    const value = response?.result?.value?._2?.value as string;

    return value
      .split(",")
      .filter((v) => v !== "")
      .map((v) => {
        const [borrowRate, supplyRate] = v.split("|");
        return {
          borrowRate: BN.formatUnits(borrowRate, 16),
          supplyRate: BN.formatUnits(supplyRate, 16),
        };
      });
  };
  calculateTokensInterest = async () => {
    const response = await nodeService.evaluate(
      this.pool,
      "calculateTokensInterest(false)"
    );
    const value = response?.result?.value?._2?.value as string;

    return value
      .split(",")
      .filter((v) => v !== "")
      .map((v) => BN.formatUnits(v, 8));
  };
}

export default PoolStateFetchService;
