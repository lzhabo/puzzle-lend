import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { useInvestToPoolInterfaceVM } from "@screens/InvestToPoolInterface/InvestToPoolInterfaceVM";
import { observer } from "mobx-react-lite";
import { Line, LineChart, Tooltip, XAxis } from "recharts";
import useWindowSize from "@src/hooks/useWindowSize";
import dayjs from "dayjs";
import BN from "@src/utils/BN";

interface IProps {}

const Root = styled.div<{ disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  padding-top: 24px;
  transition: 0.4s;
  height: ${({ disabled }) => (disabled ? 0 : 320)}px;
  overflow: hidden;

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

const TradesVolume: React.FC<IProps> = () => {
  const vm = useInvestToPoolInterfaceVM();
  const { width: screenWidth } = useWindowSize();
  const chartWidth = screenWidth ? calcChartWidth(screenWidth) : 0;
  const data = vm.pool.statistics?.volume
    .map((v) => ({ ...v, volume: Number(v.volume) }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  return (
    <Root
      disabled={
        data == null ||
        data.length < 2 ||
        data.every(({ volume }) => volume === 0)
      }
    >
      <Text weight={500} type="secondary">
        Trades volume
      </Text>
      <SizedBox height={8} />
      <Card style={{ height: 288 }}>
        <LineChart width={chartWidth} height={240} data={data}>
          <XAxis
            tickLine={false}
            dataKey="date"
            tickFormatter={(date) => dayjs(date).format("MMM DD")}
            style={{ fill: "#8082c5" }}
          />
          <Tooltip
            labelFormatter={(date) => (
              <Text type="secondary" size="small">
                {dayjs(date).format("dddd, MMM DD")}
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
      </Card>
    </Root>
  );
};

export default observer(TradesVolume);
