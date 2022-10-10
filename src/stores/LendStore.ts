import RootStore from "@stores/RootStore";
import PoolStateFetchService, {
  TPoolToken,
} from "@src/services/PoolStateFetchService";
import BN from "@src/utils/BN";
import nodeService from "@src/services/nodeService";
import { getStateByKey } from "@src/utils/getStateByKey";
// const pools = [
//   { name: "Main Pool", address: "3P4uA5etnZi4AmBabKinq2bMiWU8KcnHZdH" },
// ];

const pool = "3P4uA5etnZi4AmBabKinq2bMiWU8KcnHZdH";

class LendStore {
  public readonly rootStore: RootStore;
  private readonly fetchService;
  tokensSetups: Array<TPoolToken> = [];
  private setTokensSetups = (v: Array<TPoolToken>) => (this.tokensSetups = v);

  getPoolsStats = async (address?: string, contractAddress?: string) => {
    // const expressions = [
    //   "calculateTokenRates(false)",
    //   "calculateTokensInterest(false)",
    //   "getPrices(false)",
    // ];
    // const [tokenRates, setupRate, tokensPricesRates] = await Promise.all(
    //   expressions.map(
    //     (exp) => nodeService.evaluate(pool, exp)
    //     // .then((data) => {
    //     // const value = data.result?.value?._2?.value as string;
    //     // return value.split(value.includes("|") ? "|" : ",");
    //     // })
    //   )
    // );
    // console.log({ tokenRates, setupRate, tokensPricesRates });
    //
    // const tokensRatesArr: string[] = (
    //   tokenRates?.result?.value?._2?.value as string
    // ).split(",");
    // console.log(tokensRatesArr);

    // const tokensinterestArr: string[] = (
    //   setupRate?.result?.value?._2?.value as string
    // ).split(",");
    // const tokensPricesArr: string[] = (
    //   tokensPricesRates?.result?.value?._2?.value as string
    // ).split("|");
    // console.log({ tokensRatesArr, tokensinterestArr, tokensPricesArr });
    //
    const keys = this.tokensSetups.reduce(
      (acc, { assetId }) => [
        ...acc,
        `total_supplied_${assetId}`,
        `total_borrowed_${assetId}`,
        // `${this.rootStore.accountStore.address}_supplied_${assetId}`,
        // `${this.rootStore.accountStore.address}_borrowed_${assetId}`,
      ],
      [] as string[]
    );
    const state = await nodeService.nodeKeysRequest(pool, keys);
    const rates = await this.fetchService.calculateTokenRates();
    const interests = await this.fetchService.calculateTokensInterest();

    const result = this.tokensSetups
      .map((token, index) => {
        const sup = getStateByKey(state, `total_supplied_${token.assetId}`);
        const totalSupply = new BN(sup ?? "0").times(rates[index].supplyRate);
        // .toDecimalPlaces(0);

        const bor = getStateByKey(state, `total_borrowed_${token.assetId}`);
        const totalBorrow = new BN(bor ?? "0").times(rates[index].borrowRate);
        const UR = totalBorrow.div(totalSupply);
        const supplyInterest = interests[index].times(UR).times(0.8);

        const supplyAPY = supplyInterest
          .plus(1)
          .pow(365)
          .minus(1)
          .times(100)
          .toDecimalPlaces(2);

        const borrowAPY = interests[index]
          .plus(1)
          .pow(365)
          .minus(1)
          .times(100)
          .toDecimalPlaces(2);
        return {
          ...token,
          totalSupply,
          supplyAPY,
          totalBorrow,
          borrowAPY,
        };
      })
      .map((t) => ({
        ...t,
        totalSupply: t.totalSupply.toString(),
        supplyAPY: t.supplyAPY.toString(),
        borrowAPY: t.borrowAPY.toString(),
        totalBorrow: t.totalBorrow.toString(),
      }));
    console.log(result);
    // const fullAssetsData = assetsArrData.map((tokenData: any) => {
    //   const itemData = {
    //     ...tokenData,
    //     precision: tokenData.decimals,
    //     total_supply: BN.ZERO,
    //     total_borrow: BN.ZERO,
    //     // penalties/ltv
    //     setup_penalties: BN.ZERO,
    //     setup_lts: BN.ZERO,
    //     // loan to value %
    //     setup_ltv: BN.ZERO,
    //     // interest rate for supply/borrow interest
    //     setup_interest: BN.ZERO,
    //     // borrow APY
    //     // todo: change to APY naming
    //     setup_borrow_apr: BN.ZERO,
    //     // supply APY/ supply interest
    //     setup_supply_apy: BN.ZERO,
    //     supply_interest: BN.ZERO,
    //     // user borrow/supply + daily income
    //     self_supply: BN.ZERO,
    //     self_borrowed: BN.ZERO,
    //     self_daily_income: BN.ZERO,
    //     self_daily_borrow_interest: BN.ZERO,
    //     // sRate, need for counting SUPPLY compound on front
    //     supply_rate: BN.ZERO,
    //     // bRate, need for counting BORROW compound on front
    //     borrow_rate: BN.ZERO,
    //     // min price for all counting except ->
    //     // max price only for counting borrow and withdraw
    //     min_price: BN.ZERO,
    //     max_price: BN.ZERO,
    //   };
    //
    //   const assetExtraData = Object.values(assetsNodeData).find(
    //     (assetItem) => assetItem[tokenData.assetId]
    //   );
    //
    //   if (assetExtraData && assetExtraData[tokenData.assetId]) {
    //     const poolValue = assetExtraData[tokenData.assetId].find(
    //       (pool: any) => `total_supplied_${tokenData.assetId}` === pool.key
    //     );
    //     const poolBorrowed = assetExtraData[tokenData.assetId].find(
    //       (pool: any) => `total_borrowed_${tokenData.assetId}` === pool.key
    //     );
    //     const ltv = assetExtraData[tokenData.assetId]
    //       .find((pool: any) => pool.key === "setup_ltvs")
    //       ?.value?.split(",");
    //     // setupToken is order for Tokens in current pool > [Waves, pluto...]
    //     // all other rates comparing to it
    //     const setupTokens = tokensPoolSetup;
    //     const selfSupply = assetExtraData[tokenData.assetId].find(
    //       (pool: any) => pool.key === `${address}_supplied_${tokenData.assetId}`
    //     );
    //     const selfBorrowed = assetExtraData[tokenData.assetId].find(
    //       (pool: any) => pool.key === `${address}_borrowed_${tokenData.assetId}`
    //     );
    //
    //     const penalties = assetExtraData[tokenData.assetId].find(
    //       (pool: any) => pool.key === "setup_penalties"
    //     )?.value;
    //     const lts = assetExtraData[tokenData.assetId].find(
    //       (pool: any) => pool.key === "setup_lts"
    //     )?.value;
    //
    //     // setupTokens and tokensRatesArr have same order
    //     // so we compare them and searching for ltv and rates
    //     setupTokens.forEach((token_id: any, key: any) => {
    //       if (itemData.assetId === token_id) {
    //         itemData.setup_ltv = BN.formatUnits(ltv[key], 6);
    //
    //         if (tokensRatesArr && tokensRatesArr.length) {
    //           const rates = tokensRatesArr[key];
    //           const splittedRates = rates.split("|");
    //
    //           // bRate should be always bigger than sRate
    //           // bRate/sRate format = 16 decimals which are percents
    //           // because of it 10 ** 16 (Decimal) and / 100 to get integer for use it later
    //           itemData.borrow_rate = BN.formatUnits(+splittedRates[0], 16);
    //           itemData.supply_rate = BN.formatUnits(+splittedRates[1], 16);
    //         }
    //
    //         if (penalties && penalties.length) {
    //           const penaltyArr = penalties.split(",");
    //           const penaltyItem = penaltyArr[key];
    //
    //           itemData.setup_penalties = BN.formatUnits(penaltyItem, 6);
    //         }
    //
    //         if (lts && lts.length) {
    //           const ltsArr = lts.split(",");
    //           const ltsItem = ltsArr[key];
    //
    //           itemData.setup_lts = BN.formatUnits(ltsItem, 6);
    //         }
    //
    //         // same as Rates, passing setup_interest
    //         // firstly its %, all percents in 6 decimals
    //         if (tokensinterestArr && +tokensinterestArr[key])
    //           itemData.setup_interest = BN.formatUnits(
    //             +tokensinterestArr[key],
    //             8
    //           );
    //
    //         // adding ORACLE prices of tokens, price in $ (6 decimals)
    //         // 0 - min price, 1 - max price
    //         if (tokensPricesArr && tokensPricesArr[key]) {
    //           const prices = tokensPricesArr[key].split(",");
    //           itemData.min_price = BN.formatUnits(prices[0], 6);
    //           itemData.max_price = BN.formatUnits(prices[1], 6);
    //         }
    //       }
    //     });
    //
    //     // setup_roi === borrow interest
    //     if (itemData.setup_interest)
    //       itemData.setup_borrow_apr = itemData.setup_interest
    //         .plus(1)
    //         .pow(365)
    //         .minus(1)
    //         .times(100);
    //
    //     // for simplicity
    //     // all values gonna be convert to real numbers with decimals only in TEMPLATE
    //     if (poolValue)
    //       itemData.total_supply = BN.formatUnits(poolValue.value, 0).times(
    //         itemData.supply_rate
    //       );
    //     if (poolBorrowed)
    //       itemData.total_borrow = BN.formatUnits(poolBorrowed.value, 0).times(
    //         itemData.borrow_rate
    //       );
    //
    //     if (selfSupply)
    //       itemData.self_supply = BN.formatUnits(selfSupply.value, 0).times(
    //         itemData.supply_rate
    //       );
    //     if (selfBorrowed)
    //       itemData.self_borrowed = BN.formatUnits(selfBorrowed.value, 0).times(
    //         itemData.borrow_rate
    //       );
    //
    //     const UR = BN.formatUnits(itemData.total_borrow, 0).div(
    //       itemData.total_supply
    //     );
    //     const supplyInterest = itemData.setup_interest.times(UR).times(0.8);
    //     // protocol SHARE 20% because of it, .times(0.8)
    //     const supplyAPY = supplyInterest.plus(1).pow(365).minus(1).times(100);
    //
    //     // borrow daily interest && daily INCOME
    //     const supplyFormatted = BN.formatUnits(
    //       itemData.self_supply,
    //       itemData.precision
    //     );
    //     const borrowFormatted = BN.formatUnits(
    //       itemData.self_borrowed,
    //       itemData.precision
    //     );
    //     // protocol SHARE 20% because of it, .times(0.8)
    //     const dailyIncome = supplyFormatted
    //       .times(itemData.min_price)
    //       .times(supplyInterest);
    //     const dailyBorrowInterest = borrowFormatted
    //       .times(itemData.min_price)
    //       .times(itemData.setup_interest);
    //
    //     itemData.self_daily_borrow_interest = dailyBorrowInterest;
    //     itemData.self_daily_income = dailyIncome;
    //     itemData.setup_supply_apy = supplyAPY;
    //     itemData.supply_interest = supplyInterest;
    //   }
    //
    //   return itemData;
    // });
    // console.log(fullAssetsData, "fullAsset");
    // return fullAssetsData != null
    //   ? fullAssetsData.filter((v: any) => v != null)
    //   : [];
  };

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.fetchService = new PoolStateFetchService(pool);
    this.fetchService
      .fetchSetups()
      .then(this.setTokensSetups)
      .then(() => this.getPoolsStats())
      .catch(() => {
        //todo redirect
      });
  }
}

export default LendStore;
