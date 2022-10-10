import RootStore from "@stores/RootStore";
import PoolStateFetchService, {
  TPoolToken,
} from "@src/services/PoolStateFetchService";
import BN from "@src/utils/BN";
import nodeService from "@src/services/nodeService";
import { getStateByKey } from "@src/utils/getStateByKey";
import { makeAutoObservable } from "mobx";
// const pools = [
//   { name: "Main Pool", address: "3P4uA5etnZi4AmBabKinq2bMiWU8KcnHZdH" },
// ];

const pool = "3P4uA5etnZi4AmBabKinq2bMiWU8KcnHZdH";

type TPoolStats = {
  totalSupply: BN;
  totalBorrow: BN;
  supplyAPY: BN;
  borrowAPY: BN;
  prices: { min: BN; max: BN };
} & TPoolToken;

const calcApy = (i: BN) =>
  i.plus(1).pow(365).minus(1).times(100).toDecimalPlaces(2);

class LendStore {
  public readonly rootStore: RootStore;
  private readonly fetchService;

  tokensSetups: Array<TPoolToken> = [];
  private setTokensSetups = (v: Array<TPoolToken>) => (this.tokensSetups = v);

  poolsStats: Array<TPoolStats> = [];
  private setPoolsStats = (v: Array<TPoolStats>) => (this.poolsStats = v);

  private syncPoolsStats = async () => {
    const keys = this.tokensSetups.reduce(
      (acc, { assetId }) => [
        ...acc,
        `total_supplied_${assetId}`,
        `total_borrowed_${assetId}`,
      ],
      [] as string[]
    );
    const [state, rates, prices, interests] = await Promise.all([
      nodeService.nodeKeysRequest(pool, keys),
      this.fetchService.calculateTokenRates(),
      this.fetchService.getPrices(),
      this.fetchService.calculateTokensInterest(),
    ]);

    const stats = this.tokensSetups.map((token, index) => {
      const sup = getStateByKey(state, `total_supplied_${token.assetId}`);
      const totalSupply = new BN(sup ?? "0").times(rates[index].supplyRate);

      const bor = getStateByKey(state, `total_borrowed_${token.assetId}`);
      const totalBorrow = new BN(bor ?? "0").times(rates[index].borrowRate);

      const UR = totalBorrow.div(totalSupply);
      const supplyInterest = interests[index].times(UR).times(0.8);

      return {
        ...token,
        prices: prices[index],
        totalSupply: totalSupply.toDecimalPlaces(0),
        totalBorrow: totalBorrow.toDecimalPlaces(0),
        supplyAPY: calcApy(supplyInterest),
        borrowAPY: calcApy(interests[index]),
      };
    });
    this.setPoolsStats(stats);
    //   .map((t) => ({
    //     ...t,
    //     totalSupply: t.totalSupply.toString(),
    //     supplyAPY: t.supplyAPY.toString(),
    //     borrowAPY: t.borrowAPY.toString(),
    //     totalBorrow: t.totalBorrow.toString(),
    //   }));
    // console.log(result);
  };

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.fetchService = new PoolStateFetchService(pool);
    this.fetchService
      .fetchSetups()
      .then(this.setTokensSetups)
      .then(() => this.syncPoolsStats())
      .catch(() => {
        //todo redirect
      });
    setInterval(this.syncPoolsStats, 60 * 1000);
  }
}

export default LendStore;
