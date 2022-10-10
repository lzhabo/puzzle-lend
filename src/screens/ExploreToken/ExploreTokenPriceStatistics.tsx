import Text from "@components/Text";
import React from "react";
import Card from "@components/Card";
import { observer } from "mobx-react-lite";
import { useExploreTokenVM } from "@screens/ExploreToken/ExploreTokenVm";
import StatisticsGroup from "@components/StatisticsGroup";
import SizedBox from "@components/SizedBox";
import BN from "@src/utils/BN";
import { TOKENS_BY_SYMBOL } from "@src/constants";

const ExploreTokenPriceStatistics = () => {
  const vm = useExploreTokenVM();
  const chart24h = vm.getChartByPeriod("1d");
  const low = new BN(Math.min(...chart24h.map(({ volume }) => volume)) ?? 0);
  const high = new BN(Math.max(...chart24h.map(({ volume }) => volume)) ?? 0);

  const changeColor = vm.statistics?.change24H?.gte(0) ? "#35A15A" : "#ED827E";

  return (
    <Card style={{ flex: 1 }}>
      <Text weight={500} style={{ fontSize: 24, lineHeight: "32px" }}>
        Price statistics
      </Text>
      <SizedBox height={24} />
      <Text weight={500}>Price today</Text>
      <StatisticsGroup
        data={[
          {
            title: `${vm.asset?.symbol} price`,
            value: `$ ${vm.statistics?.currentPrice?.toFormat(2)}`,
          },
          {
            title: "24h change",
            valueColor: changeColor,
            value: vm.statistics?.changeStr,
          },
          {
            title: "24h Low / 24h High",
            value: `$ ${low.toFormat(2)} / $ ${high.toFormat(2)}`,
            loading: vm.chartLoading,
          },
        ]}
      />
      <SizedBox height={24} />
      <Text weight={500}>Supply</Text>
      <StatisticsGroup
        data={[
          {
            title: "Total supply",
            value: vm.statistics?.totalSupply?.toFormat(2),
          },
          {
            title: "Circulating supply",
            value: vm.statistics?.circulatingSupply?.toFormat(2),
          },
          ...(vm.asset.assetId === TOKENS_BY_SYMBOL.PUZZLE.assetId
            ? [
                {
                  title: "Total burned",
                  value: vm.statistics?.totalBurned?.toFormat(2),
                },
              ]
            : []),
        ]}
      />
      <SizedBox height={24} />
      <Text weight={500}>Market cap</Text>
      <StatisticsGroup
        data={[
          {
            title: "Fully diluted MC",
            value: vm.statistics?.fullyDilutedMC?.toFormat(2),
          },
          {
            title: "Market cap",
            value: vm.statistics?.marketCap?.toFormat(2),
          },
        ]}
      />
    </Card>
  );
};

export default observer(ExploreTokenPriceStatistics);
