import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import { Row } from "@components/Flex";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";
import Spinner from "@components/Spinner";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import dayjs from "dayjs";
import BN from "@src/utils/BN";
import { useTokenChartVM } from "@components/TokensChart/TokenChartVM";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  box-sizing: border-box;
  padding-top: 24px;
  flex: 1;
`;

const TokensChart: React.FC<IProps> = () => {
  const vm = useTokenChartVM();
  return (
    <Root>
      {vm.chartUnavailable && (
        <Row justifyContent="center">
          <Text style={{ textAlign: "center" }}>Chart Unavailable</Text>
        </Row>
      )}
      {!vm.chartUnavailable &&
        (vm.chartLoading ? (
          <Row justifyContent="center">
            <Spinner />
          </Row>
        ) : (
          <ResponsiveContainer width="95%" height={350}>
            <LineChart height={280} data={vm.chart}>
              <YAxis hide domain={[vm.chartMin * 0.99, vm.chartMax * 1.01]} />
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
                formatter={(price: number) => (
                  <Text size="medium">$&nbsp;{new BN(price).toFormat(2)}</Text>
                )}
                contentStyle={{
                  border: "none",
                  filter: "drop-shadow(0px 8px 24px rgba(54, 56, 112, 0.16))",
                }}
              />
              <Line
                dot={false}
                type="monotone"
                dataKey="price"
                stroke="#7075E9"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ))}
    </Root>
  );
};

export default observer(TokensChart);
