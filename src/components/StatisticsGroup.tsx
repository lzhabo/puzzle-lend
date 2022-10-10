import styled from "@emotion/styled";
import { Column, Row } from "@components/Flex";
import React from "react";
import Text from "@components/Text";
import Skeleton from "react-loading-skeleton";

const Root = styled(Column)`
  & > * {
    padding: 8px 0;
    box-sizing: border-box;
    border-bottom: 1px solid ${({ theme }) => theme.colors.primary650};
  }

  & > :last-of-type {
    border-bottom: none;
  }
`;

const StatisticsGroup: React.FC<{
  data: Array<{
    title: string;
    value: string | number | JSX.Element | undefined;
    valueColor?: string;
    loading?: boolean;
  }>;
}> = ({ data }) => (
  <Root crossAxisSize="max">
    {data.map(({ title, value, valueColor, loading }, i) => (
      <Row justifyContent="space-between" alignItems="center" key={i}>
        <Text type="secondary" size="medium">
          {title}
        </Text>
        {loading || value == null ? (
          <Skeleton height={20} width={110} />
        ) : (
          <Text style={{ textAlign: "right", color: valueColor }} size="medium">
            {value}
          </Text>
        )}
      </Row>
    ))}
  </Root>
);

export default StatisticsGroup;
