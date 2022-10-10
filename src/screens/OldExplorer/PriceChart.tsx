import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
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
import TitleWithTips from "@components/TitleWithTips";
import { TChartDataRecord, useOldExploreVM } from "./OldExploreVm";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  transition: 0.4s;
  overflow: hidden;
  width: 100%;
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
    stroke: #f1f2fe;
  }

  .recharts-tooltip-cursor {
    stroke: #7075e9;
  }
`;

const calcChartWidth = (screenWidth: number) => {
  switch (true) {
    case screenWidth > 1160 + 32:
      return 698;
    case screenWidth <= 1160 + 32 && screenWidth >= 880:
      return ((screenWidth - 32 - 40) / 3) * 2 - 48;
    case screenWidth < 880:
      return screenWidth - 82;
  }
};

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;

  @media (min-width: 880px) {
    flex-direction: row;
    align-items: center;
  }
`;

const ChartAgeButtonsWrapper = styled(Row)`
  & > * {
    margin-right: 4px;
  }

  @media (min-width: 880px) {
    justify-content: flex-end;
  }
`;

const ChartAgeButton = styled.div<{ selected?: boolean }>`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  box-sizing: border-box;
  height: 24px;
  background: ${({ selected }) => (selected ? "#7075e9" : "transparent")};
  border-radius: 6px;

  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${({ selected }) => (selected ? "#ffffff" : "#8082C5")};
  transition: 0.4s;
  margin-top: 8px;

  &:hover {
    background: #7075e9;
    color: #ffffff;
  }

  @media (min-width: 880px) {
    margin-top: 0;
  }
`;

const StyledCard = styled(Card)`
  height: 320px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const ageButtons = [
  { title: "1D", value: "1d" },
  { title: "7D", value: "1w" },
  { title: "1M", value: "1m" },
  { title: "3M", value: "3m" },
  { title: "1Y", value: "1y" },
  { title: "All", value: "all" },
];
const PriceChart: React.FC<IProps> = () => {
  const vm = useOldExploreVM();
  const { width: screenWidth } = useWindowSize();
  const chartWidth = screenWidth ? calcChartWidth(screenWidth) : 0;
  const chartMin = Math.min(...vm.chart.map(({ volume }) => volume));
  const chartMax = Math.max(...vm.chart.map(({ volume }) => volume));
  return (
    <Root>
      <TitleWrapper>
        <TitleWithTips
          title={
            vm.asset?.symbol != null
              ? `${vm.asset?.symbol} price chart`
              : "Price chart"
          }
          description=" Base token is used to provide liquidity with single asset. Also most of the LP rewards will be accumulated in this token."
        />
        <ChartAgeButtonsWrapper>
          {ageButtons.map(({ title, value }) => (
            <ChartAgeButton
              key={value}
              selected={vm.selectedChartPeriod === value}
              onClick={() =>
                vm.setSelectedChartPeriod(value as keyof TChartDataRecord)
              }
            >
              {title}
            </ChartAgeButton>
          ))}
        </ChartAgeButtonsWrapper>
      </TitleWrapper>
      <SizedBox height={8} />
      {vm.chartLoading ? (
        <StyledCard>
          <Spinner />
        </StyledCard>
      ) : (
        <StyledCard>
          <LineChart width={chartWidth} height={285} data={vm.chart}>
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
        </StyledCard>
      )}
    </Root>
  );
};

export default observer(PriceChart);
