import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import { observer } from "mobx-react-lite";
import {
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import useWindowSize from "@src/hooks/useWindowSize";
import dayjs from "dayjs";
import BN from "@src/utils/BN";
import { Row } from "@src/components/Flex";
import Spinner from "@components/Spinner";
import { useExploreTokenVM } from "@screens/ExploreToken/ExploreTokenVm";
import ChartAgeButtons from "@src/components/ChartAgeButtons";

interface IProps {}

const Root = styled(Card)`
  padding: 0 !important;
  min-height: 436px;
  flex: 2;

  .recharts-tooltip-item-name,
  .recharts-tooltip-item-separator {
    display: none;
  }

  .recharts-cartesian-axis-tick {
    font-size: 12px;
    line-height: 16px;
  }

  .xAxis > line {
    //stroke: #f1f2fe;
    stroke: ${({ theme }) => theme.colors.primary100};
  }

  .recharts-tooltip-cursor {
    stroke: ${({ theme }) => theme.colors.blue500};
  }

  @media (min-width: 880px) {
    min-height: 402px;
  }
`;

const Header = styled(Row)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary100};
  padding: 12px 16px;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;

  .age-btns {
    display: none;
  }

  @media (min-width: 880px) {
    .age-btns {
      display: flex;
    }

    padding: 20px 24px;
  }
`;

const Body = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  box-sizing: border-box;
  padding: 24px;
  flex: 1;
`;

const Footer = styled(Header)`
  border-bottom: none;
  border-top: 1px solid ${({ theme }) => theme.colors.primary100};
  display: flex;
  @media (min-width: 880px) {
    display: none;
  }
`;

const calcChartWidth = (screenWidth: number) => {
  switch (true) {
    case screenWidth > 1160 + 32:
      return 674;
    case screenWidth <= 1160 + 32 && screenWidth >= 880:
      return ((screenWidth - 32 - 40) / 3) * 2 - 48;
    case screenWidth < 880:
      return screenWidth - 80;
  }
};

const PriceChart: React.FC<IProps> = () => {
  const vm = useExploreTokenVM();
  const { width: screenWidth } = useWindowSize();
  const chartWidth = screenWidth ? calcChartWidth(screenWidth) : 0;
  const chartMin = Math.min(...vm.chart.map(({ volume }) => volume));
  const chartMax = Math.max(...vm.chart.map(({ volume }) => volume));
  return (
    <Root>
      <Header>
        <Text weight={500}>{vm.asset.symbol} to USDN chart</Text>
        <ChartAgeButtons
          className="age-btns"
          value={vm.selectedChartPeriod}
          onChange={vm.setSelectedChartPeriod}
        />
      </Header>
      <Body>
        {vm.chartLoading ? (
          <Row style={{ minWidth: chartWidth }} justifyContent="center">
            <Spinner />
          </Row>
        ) : (
          <LineChart width={chartWidth} height={280} data={vm.chart}>
            <YAxis hide domain={[chartMin * 0.99, chartMax * 1.01]} />
            <XAxis
              tickLine={false}
              dataKey="date"
              tickFormatter={(date) => dayjs(date).format("MM:HH, MMM DD")}
              style={{ fill: "#8082c5" }}
            />
            <RechartsTooltip
              labelFormatter={(date) => (
                <Text type="secondary" size="small">
                  {dayjs(date).format("MM:HH, MMM DD")}
                </Text>
              )}
              formatter={(volume: number) => (
                <Text size="medium">$&nbsp;{new BN(volume).toFormat(2)}</Text>
              )}
              contentStyle={{
                border: "none",
                filter: "drop-shadow(0px 8px 24px rgba(54, 56, 112, 0.16))",
              }}
            />
            <Line
              dot={false}
              type="monotone"
              dataKey="volume"
              stroke="#7075E9"
              strokeWidth={2}
            />
          </LineChart>
        )}
      </Body>
      <Footer>
        <ChartAgeButtons
          value={vm.selectedChartPeriod}
          onChange={vm.setSelectedChartPeriod}
        />
      </Footer>
    </Root>
  );
};

export default observer(PriceChart);
