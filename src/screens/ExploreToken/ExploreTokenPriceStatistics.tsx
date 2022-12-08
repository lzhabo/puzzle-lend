import Text from "@components/Text";
import React from "react";
import Card from "@components/Card";
import { observer } from "mobx-react-lite";
import StatisticsGroup from "@components/StatisticsGroup";
import SizedBox from "@components/SizedBox";
import { useExploreTokenVM } from "@screens/ExploreToken/ExploreTokenVm";

const ExploreTokenPriceStatistics = () => {
  const vm = useExploreTokenVM();
  return (
    <Card style={{ flex: 1 }}>
      <Text weight={500} style={{ fontSize: 24, lineHeight: "32px" }}>
        Market details
      </Text>
      <SizedBox height={24} />
      <Text weight={500}>General info</Text>
      <StatisticsGroup
        data={[
          {
            title: "Price",
            value: `$ ${vm.statistics?.prices.min.toFormat(2)}`
          },
          { title: "Number of suppliers", value: vm.users.supply.toFormat(0) },
          { title: "Number of borrowers", value: vm.users.borrow.toFormat(0) },
          {
            title: "Collateral Factor",
            value: vm.statistics?.cf.times(100).toFormat(2) + " %"
          },
          {
            title: "Liquidation threshold",
            value: vm.statistics?.lt.times(100).toFormat(2) + " %"
          },
          {
            title: "Liquidation penalty",
            value: vm.statistics?.penalty.times(100).toFormat(2) + " %"
          }
        ]}
      />
    </Card>
  );
};

export default observer(ExploreTokenPriceStatistics);
