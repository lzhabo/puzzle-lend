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

const AnalyticsScreenImpl: React.FC<IProps> = observer(() => {
  const { lendStore } = useStores();
  const totalData = [
    {
      symbol: "PUZZLE",
      prices: {
        min: 14
      },
      total: 114
    },
    {
      symbol: "WAVES",
      prices: {
        min: 4.93
      },
      total: 102
    },
    {
      symbol: "USDN",
      prices: {
        min: 1
      },
      total: 74
    },
    {
      symbol: "USDT",
      prices: {
        min: 1
      },
      total: 45
    }
  ];
  return (
    <Layout>
      <ExploreLayout>
        <Link to={ROUTES.ROOT}>
          <Row alignItems="center">
            <ArrowBackIcon />
            <Text weight={500} type="blue500">
              Back to {lendStore.pool.name}
            </Text>
          </Row>
        </Link>
        <SizedBox height={24} />
        <Title weight={500}>Users list</Title>
        <SizedBox height={16} />
        <AnalyticsScreenBaseInfo />
        <SizedBox height={24} />
        <TableContainer>
          <AnalyticsScreenTable />
          <TotalVal>
            <Title>
              Total value
              <SizedBox height={24} />
            </Title>
            <table>
              {totalData.map((s) => (
                <TableRow alignItems="center" justifyContent="space-between">
                  <Row>
                    <SquareTokenIcon
                      size="small"
                      src={tokenLogos[s.symbol]}
                      alt="logo"
                    />
                    <SizedBox width={16} />
                    <Column>
                      <Text size="small" fitContent>
                        {s.symbol}
                      </Text>
                      <Text type="secondary" size="small" fitContent>
                        $ {s.prices.min}
                      </Text>
                    </Column>
                  </Row>
                  <Row justifyContent={"flex-end"}>
                    <Column>
                      <Text textAlign={"end"} size="small">
                        {s.total + "M " + s.symbol}
                      </Text>
                      <Text textAlign={"end"} type="secondary" size="small">
                        $ {(s.prices.min * s.total).toFixed(2)}M
                      </Text>
                    </Column>
                  </Row>
                </TableRow>
              ))}
            </table>
          </TotalVal>
        </TableContainer>
      </ExploreLayout>
    </Layout>
  );
});

const UsersListScreen = () => (
  <AnalyticsScreenVMProvider>
    <AnalyticsScreenImpl />
  </AnalyticsScreenVMProvider>
);

export default UsersListScreen;
