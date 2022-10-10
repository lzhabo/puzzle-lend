import React from "react";
import styled from "@emotion/styled";
import Card from "@components/Card";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react-lite";
import { useCreateCustomPoolsVM } from "@screens/CreateCustomPools/CreateCustomPoolsVm";
import { Row } from "@src/components/Flex";
import Divider from "@src/components/Divider";
import { Cell, Pie, PieChart } from "recharts";

interface IProps {}

const Root = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const COLORS = [
  "#99CC33",
  "#669900",
  "#CCEE66",
  "#006699",
  "#3399CC",
  "#990066",
  "#CC3399",
  "#FF6600",
  "#FF9900",
  "#FFCC00",
];

const Legend = styled.div`
  display: flex;
  max-width: 155px;
  flex-wrap: wrap;
  justify-content: center;

  & > * {
    padding-right: 12px;
  }
`;
const SummaryCard: React.FC<IProps> = () => {
  const vm = useCreateCustomPoolsVM();
  const data = vm.poolsAssets?.reduce<{ name: string; value: number }[]>(
    (acc, { asset, share }) => [
      ...acc,
      { name: asset.symbol, value: share.toNumber() },
    ],
    []
  );

  return (
    <Root>
      <Text type="secondary" weight={500}>
        Summary
      </Text>
      <SizedBox height={8} />
      <Card
        justifyContent="center"
        alignItems="center"
        paddingDesktop="0px"
        paddingMobile="0px"
      >
        <PieChart width={100} height={150}>
          <Pie
            data={data}
            innerRadius={40}
            outerRadius={50}
            fill="#C6C9F4"
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
        <Legend>
          {data.map(({ name }, index) => (
            <Row
              key={index + "summary-card"}
              justifyContent="center"
              alignItems="center"
              mainAxisSize="fit-content"
            >
              <Dot color={COLORS[index % COLORS.length]} />
              <SizedBox width={4} />
              <Text size="small" type="secondary" fitContent>
                {name}
              </Text>
            </Row>
          ))}
        </Legend>
        <SizedBox height={24} />
        <Divider />
        <SizedBox height={14} />
        <Text type="secondary" fitContent>
          Max to provide
        </Text>
        <Text weight={500} fitContent>
          ${vm.maxToProvide.toFormat(2)}
        </Text>
        <SizedBox height={14} />
      </Card>
    </Root>
  );
};
export default observer(SummaryCard);

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <svg
    width="9"
    height="8"
    viewBox="0 0 9 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="4.5" cy="4" r="4" fill={color} />
  </svg>
);
