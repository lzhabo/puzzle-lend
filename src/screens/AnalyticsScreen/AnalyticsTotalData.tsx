import styled from "@emotion/styled";
import React, { useState } from "react";
import { AnalyticsScreenVMProvider } from "@screens/AnalyticsScreen/AnalyticsScreenVM";
import { Link } from "react-router-dom";
import { ROUTES } from "@src/constants";
import Layout from "@components/Layout";
import ExploreLayout from "@screens/ExploreToken/ExploreLayout";
import { Column, Row } from "@components/Flex";
import { ReactComponent as ArrowBackIcon } from "@src/assets/icons/backArrow.svg";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import AnalyticsScreenTable from "@screens/UsersListScreen/AnalyticsScreenTable";
import AnalyticsScreenBaseInfo from "@screens/UsersListScreen/AnalyticsScreenBaseInfo";
import Card from "@components/Card";
import Table from "@components/Table";
import SquareTokenIcon from "@components/SquareTokenIcon";
import tokenLogos from "@src/constants/tokenLogos";
import {
  useAnalyticsScreenVM,
  ITStatisticItem
} from "@screens/AnalyticsScreen/AnalyticsScreenVM";

interface IProps {}

const Title = styled(Text)`
  @media (min-width: 880px) {
    font-size: 24px;
    line-height: 32px;
  }
`;

const TableContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const TotalVal = styled(Card)`
  margin: 32px 0 0 0;
  max-width: 427px;
  /* max-height: 300px; */
  /* display: flex; */
`;

const TableRow = styled(Row)`
  margin: 8px 0 0 0;
`;

const AnalyticsTotalData: React.FC<IProps> = () => {
  const { lendStore } = useStores();
  const vm = useAnalyticsScreenVM();

  const totalData = vm
    .popularOf("supply")
    .sort(
      (prev: ITStatisticItem, curr: ITStatisticItem) =>
        curr.amountTotal - prev.amountTotal
    );

  return (
    <TotalVal>
      <Title>
        Total value
        <SizedBox height={24} />
      </Title>
      <table>
        {totalData.map((s: ITStatisticItem) => (
          <TableRow alignItems="center" justifyContent="space-between">
            <Row>
              <SquareTokenIcon
                size="small"
                src={tokenLogos[s.asset.symbol]}
                alt="logo"
              />
              <SizedBox width={16} />
              <Column>
                <Text size="small" fitContent>
                  {s.asset.symbol}
                </Text>
                <Text type="secondary" size="small" fitContent>
                  $ {vm.priceForToken(s).toNumber()}
                </Text>
              </Column>
            </Row>
            <Row justifyContent={"flex-end"}>
              <Column>
                <Text textAlign={"end"} size="small">
                  {(s.amountTotal / vm.priceForToken(s).toNumber()).toFixed(2) +
                    " " +
                    s.asset.symbol}
                </Text>
                <Text textAlign={"end"} type="secondary" size="small">
                  $ {s.amountTotal.toFixed(2)}
                </Text>
              </Column>
            </Row>
          </TableRow>
        ))}
      </table>
    </TotalVal>
  );
};

export default observer(AnalyticsTotalData);
