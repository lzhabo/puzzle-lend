import styled from "@emotion/styled";
import ExploreTokenPriceChart from "@screens/ExploreToken/ExploreTokenPriceChart";
import ExploreTokenPriceStatistics from "@screens/ExploreToken/ExploreTokenPriceStatistics";
import useWindowSize from "@src/hooks/useWindowSize";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import BN from "@src/utils/BN";
import { useExploreTokenVM } from "@screens/ExploreToken/ExploreTokenVm";
import { Navigate } from "react-router-dom";
import { ROUTES } from "@src/constants";

const Root = styled(Column)`
  width: 100%;
  align-items: flex-end;

  & > :first-of-type {
    margin-bottom: 24px;
  }

  @media (min-width: 880px) {
    flex-direction: row;
    & > :first-of-type {
      margin-bottom: 0;
      margin-right: 24px;
    }
  }
`;

const StatsItem = styled(Column)`
  margin-right: 24px;
  margin-bottom: 8px;
  @media (min-width: 880px) {
    margin-right: 32px;
  }
  &:last-of-type {
    margin-right: 0;
  }
`;

const TokenStatsCol = styled(Column)`
  max-width: 100%;

  @media (min-width: 880px) {
    max-width: 427px;
  }
`;

const ExploreTokenBasicInformation = () => {
  const { width } = useWindowSize();
  const vm = useExploreTokenVM();
  if (vm.statistics == null) return <Navigate to={ROUTES.ROOT} />;
  const statistics = [
    {
      title: "Total supply",
      value:
        BN.formatUnits(
          vm.statistics.totalSupply,
          vm.statistics.decimals
        ).toFormat(2) + ` ${vm.statistics.symbol}`
    },
    {
      title: "Total borrow",
      value:
        BN.formatUnits(
          vm.statistics.totalBorrow,
          vm.statistics.decimals
        ).toFormat(2) + ` ${vm.statistics.symbol}`
    },
    {
      title: "Utilization ratio",
      value:
        vm.statistics.totalBorrow
          .div(vm.statistics.totalSupply)
          .times(100)
          .toFixed(2) + " %"
    },
    {
      title: "Reserves",
      value:
        BN.formatUnits(
          vm.statistics.totalSupply.minus(vm.statistics.totalBorrow),
          vm.statistics.decimals
        ).toFormat(2) + ` ${vm.statistics.symbol}`
    },
    { title: "Supply APY", value: vm.statistics.supplyAPY.toFormat(2) + " %" },
    { title: "Borrow APY", value: vm.statistics.borrowAPY.toFormat(2) + " %" }
  ];

  return width && width >= 880 ? (
    <Root>
      <Column crossAxisSize="max">
        <>
          <Row alignItems="end" mainAxisSize="fit-content">
            {statistics.map((s, i) => (
              <StatsItem key={i}>
                <Text size="medium" type="secondary">
                  {s.title}
                </Text>
                <Text>{s.value}</Text>
              </StatsItem>
            ))}
          </Row>
          <ExploreTokenPriceChart />
        </>
      </Column>
      <TokenStatsCol crossAxisSize="max">
        <ExploreTokenPriceStatistics />
        <SizedBox height={50} />
      </TokenStatsCol>
    </Root>
  ) : (
    <Root>
      <Row style={{ flexWrap: "wrap" }}>
        {statistics.map((s, i) => (
          <StatsItem key={i}>
            <Text size="medium" type="secondary">
              {s.title}
            </Text>
            <Text>{s.value}</Text>
          </StatsItem>
        ))}
      </Row>
      <TokenStatsCol crossAxisSize="max">
        <ExploreTokenPriceChart />
        <SizedBox height={24} />
        <ExploreTokenPriceStatistics />
      </TokenStatsCol>
      <SizedBox height={50} />
    </Root>
  );
};
export default ExploreTokenBasicInformation;
