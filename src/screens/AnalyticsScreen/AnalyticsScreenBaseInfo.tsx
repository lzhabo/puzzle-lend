import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import { Column, Row } from "@components/Flex";
import { observer } from "mobx-react-lite";
import { useAnalyticsScreenVM } from "@screens/AnalyticsScreen/AnalyticsScreenVM";
import Skeleton from "react-loading-skeleton";

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
      value: vm.totalOf("supply").toFormat(2)
    },
    {
      title: "Total borrowing",
      value: vm.totalOf("borrow").toFormat(2)
    },
    {
      title: "Popular coin to supplie",
      value: vm.popularOf("supply")[0]?.asset.name ?? null
    },
    {
      title: "Popular coin to borrow",
      value: vm.popularOf("borrow")[0]?.asset.name ?? null
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
          <Text>{s.value ?? <Skeleton height={20} width={140} />}</Text>
        </StatsItem>
      ))}
    </Row>
  );
};
export default observer(AnalyticsScreenBaseInfo);
