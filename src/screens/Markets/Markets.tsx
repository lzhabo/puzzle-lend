import styled from "@emotion/styled";
import React from "react";
import { Navigate, RouteProps, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Outlet } from "react-router-dom";
import { useStores } from "@stores";
import { MarketsVmProvider, useDashboardVM } from "./MarketsVm";
import Layout from "@components/Layout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import WhatIsLend from "@screens/Dashboard/WhatIsLend";
import FAQ from "@screens/Dashboard/FAQ";
import AssetsTable from "@screens/Dashboard/AssetsTable";
import AccountSupplyAndBorrow from "@screens/Dashboard/AccountSupplyAndBorrow";
import AccountHealth from "@screens/Dashboard/AccountHealth";
import { Column } from "@src/components/Flex";
import { POOLS, ROUTES } from "@src/constants";
import Card from "@components/Card";
import { ReactComponent as WidgetIcoBorrowed } from "@src/assets/icons/totalBorrowed.svg";
import { ReactComponent as WidgetIcoSupplied } from "@src/assets/icons/totalSupplied.svg";

import bg from "@src/assets/dashboard/main_bg.png";
import PoolStateFetchService from "@src/services/PoolStateFetchService";

interface IProps {}

const Root = styled.div<{ apySort?: boolean; liquiditySort?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  min-height: 100%;
  max-width: calc(1328px + 32px);
  margin-bottom: 72px;
  margin-top: 40px;
  text-align: left;

  @media (min-width: 560px) {
    margin-top: 60px;
  }

  @media (min-width: 880px) {
    margin-bottom: 96px;
  }
`;
const Subtitle = styled(Text)`
  @media (min-width: 880px) {
    max-width: 560px;
  }
`;
const AccountDataWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  @media (min-width: 1440px) {
    flex-direction: row-reverse;
  }
`;
const TotalLiquidity = styled.div`
  display: flex;
  padding: 8px 20px;
  border-radius: 16px;
  width: 100%;
  background: url(${bg});
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  box-sizing: border-box;
`;

const Widgets = styled.div`
  display: flex;
`;
const Widget = styled(Card)`
  margin: 0 24px 0 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
const WidgetRight = styled(Widget)`
  margin: 0;
`;
const WidgetInfo = styled.div``;
const WidgetTitle = styled(Text)``;
const WidgetValue = styled(Text)`
  font-size: 24px;
  line-height: 32px;
`;
const PoolCards = styled.div`
  margin: 24px 0 0 0;
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;
const PoolCard = styled(Card)`
  padding: 0 !important;
  overflow: hidden;
`;
const PoolCardHeader = styled.div`
  background: linear-gradient(94.61deg, #16214b 0.61%, #213069 100%);
  padding: 24px;
`;
const PoolCardBody = styled.div`
  padding: 16px 24px 24px 24px;
`;
const PoolCardHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;
const PoolCardText = styled.div``;
const PoolCardTitle = styled(Text)`
  font-size: 24px;
  line-height: 32px;
`;
const PoolCardSubTitle = styled(Text)``;
const PoolCardTokens = styled.div``;
const PoolCardInfo = styled.div`
  display: flex;
  justify-content: space-between;
`;
const PoolCardInfoItem = styled.div`
  width: 180px;
`;
const PoolCardInfoItemTitle = styled(Text)``;
const PoolCardInfoItemValue = styled(Text)``;
const PoolButton = styled.button`
  border: 1px solid #f1f2fe;
  border-radius: 10px;
  color: #7075e9;
  font-size: 16px;
  line-height: 24px;
  font-weight: 700;
  background: none;
  width: 100%;
  padding: 8px;
`;

const MarketsImpl: React.FC<IProps> = observer(() => {
  const vm = useDashboardVM();
  const { accountStore, lendStore } = useStores();

  return (
    <Layout>
      <Root apySort={vm.sortApy} liquiditySort={vm.sortLiquidity}>
        <Text weight={500} size="large">
          Markets on Puzzle Lend
        </Text>
        <SizedBox height={16} />
        <Widgets>
          <Widget>
            <WidgetInfo>
              <WidgetTitle size="big" type="secondary">
                Total supplied
              </WidgetTitle>
              <WidgetValue>10000$</WidgetValue>
            </WidgetInfo>
            <WidgetIcoSupplied />
          </Widget>
          <WidgetRight>
            <WidgetInfo>
              <WidgetTitle size="big" type="secondary">
                Total borrowed
              </WidgetTitle>
              <WidgetValue>1000$</WidgetValue>
            </WidgetInfo>
            <WidgetIcoBorrowed />
          </WidgetRight>
        </Widgets>
        <PoolCards>
          {[1, 2, 3, 4, 5].map((e) => (
            <PoolCard>
              <PoolCardHeader>
                <PoolCardHeaderContainer>
                  <PoolCardText>
                    <PoolCardTitle size="big" type="light">
                      Main pool
                    </PoolCardTitle>
                    <PoolCardSubTitle size="medium" type="secondary">
                      Rapidly growing market with great liquidity and reliable
                      assets
                    </PoolCardSubTitle>
                  </PoolCardText>
                  <PoolCardTokens>tokens</PoolCardTokens>
                </PoolCardHeaderContainer>
                <SizedBox height={16} />
                <PoolCardInfo>
                  <PoolCardInfoItem>
                    <PoolCardInfoItemTitle size="medium" type="secondary">
                      Total supplied
                    </PoolCardInfoItemTitle>
                    <PoolCardInfoItemValue type="light">
                      000
                    </PoolCardInfoItemValue>
                  </PoolCardInfoItem>
                  <PoolCardInfoItem>
                    <PoolCardInfoItemTitle size="medium" type="secondary">
                      Total borrowed
                    </PoolCardInfoItemTitle>
                    <PoolCardInfoItemValue type="light">
                      000
                    </PoolCardInfoItemValue>
                  </PoolCardInfoItem>
                  <PoolCardInfoItem>
                    <PoolCardInfoItemTitle size="medium" type="secondary">
                      NET APY
                    </PoolCardInfoItemTitle>
                    <PoolCardInfoItemValue type="light">
                      000
                    </PoolCardInfoItemValue>
                  </PoolCardInfoItem>
                </PoolCardInfo>
              </PoolCardHeader>
              <PoolCardBody>
                <PoolCardInfo>
                  <PoolCardInfoItem>
                    <PoolCardInfoItemTitle size="medium" type="secondary">
                      My supply balance
                    </PoolCardInfoItemTitle>
                    <PoolCardInfoItemValue type="primary">
                      0
                    </PoolCardInfoItemValue>
                  </PoolCardInfoItem>
                  <PoolCardInfoItem>
                    <PoolCardInfoItemTitle size="medium" type="secondary">
                      My borrow balance
                    </PoolCardInfoItemTitle>
                    <PoolCardInfoItemValue type="primary">
                      0
                    </PoolCardInfoItemValue>
                  </PoolCardInfoItem>
                  <PoolCardInfoItem>
                    <PoolCardInfoItemTitle size="medium" type="secondary">
                      Account health
                    </PoolCardInfoItemTitle>
                    <PoolCardInfoItemValue type="primary">
                      0
                    </PoolCardInfoItemValue>
                  </PoolCardInfoItem>
                </PoolCardInfo>
                <SizedBox height={16} />
                <PoolButton>Go to market</PoolButton>
              </PoolCardBody>
            </PoolCard>
          ))}
        </PoolCards>
        <SizedBox height={24} />
        {/* {accountStore != null && (
          <AccountDataWrapper>
            <AccountHealth />
            <Column crossAxisSize="max">
              <TotalLiquidity>
                <Text style={{ color: "#ffffff" }}>
                  {`Total liquidity of ${lendStore.poolName}: `}
                  <b>$ {lendStore.totalLiquidity.toFormat(2)}</b>
                </Text>
              </TotalLiquidity>
              <SizedBox height={24} />
              {accountStore.address && <AccountSupplyAndBorrow />}
              <AssetsTable />
            </Column>
          </AccountDataWrapper>
        )} */}
        {/* <WhatIsLend /> */}
        {/* <FAQ /> */}
        {/* <Outlet /> */}
      </Root>
    </Layout>
  );
});

const Markets: React.FC<IProps & RouteProps> = () => {
  const params = useParams<{ poolId: string }>();
  if (params.poolId && !POOLS.some((p) => p.address === params.poolId)) {
    return <Navigate to={ROUTES.ROOT} />;
  }
  return (
    <MarketsVmProvider poolId={params.poolId}>
      <MarketsImpl />
    </MarketsVmProvider>
  );
};

export default observer(Markets);
