import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import { Column, Row } from "@components/Flex";
import { observer } from "mobx-react-lite";
import { useAnalyticsScreenVM } from "@screens/AnalyticsScreen/AnalyticsScreenVM";

interface IProps {}
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
const AnalyticsScreenBaseInfo: React.FC<IProps> = () => {
  const vm = useAnalyticsScreenVM();
  const statistics = [
    { title: "Users", value: vm.uniqueUsers.length },
    {
      title: "Total supplied",
      value: "10,5M"
    },
    {
      title: "Total borrowing",
      value: "15M"
    },
    {
      title: "Popular coin to supplie",
      value: "PUZZLE"
    },
    {
      title: "Popular coin to borrow",
      value: "USDN"
    }
  ];
  return (
    <Row
      alignItems="end"
      mainAxisSize="fit-content"
      style={{ flexWrap: "wrap" }}
    >
      {statistics.map((s, i) => (
        <StatsItem key={i}>
          <Text size="medium" type="secondary">
            {s.title}
          </Text>
          <Text>{s.value}</Text>
        </StatsItem>
      ))}
    </Row>
  );
};
export default observer(AnalyticsScreenBaseInfo);
