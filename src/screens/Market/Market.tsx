import styled from "@emotion/styled";
import React from "react";
import { Navigate, RouteProps, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Outlet } from "react-router-dom";
import { useStores } from "@stores";
import Layout from "@components/Layout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import WhatIsLend from "@screens/Market/WhatIsLend";
import FAQ from "@screens/Market/FAQ";
import AssetsTable from "@screens/Market/AssetsTable";
import AccountSupplyAndBorrow from "@screens/Market/AccountSupplyAndBorrow";
import AccountHealth from "@screens/Market/AccountHealth";
import { Column } from "@src/components/Flex";

import bg from "@src/assets/dashboard/main_bg.png";
import { MarketVMProvider, useMarketVM } from "@screens/Market/MarketVm";
import { ROUTES } from "@src/constants";
import Spinner from "@components/Spinner";
import { Anchor } from "@components/Anchor";
import Skeleton from "react-loading-skeleton";

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
  background: url(${bg}) center no-repeat;
  background-size: cover;
  box-sizing: border-box;
`;
const WavesLink = styled(Anchor)`
  color: #7075e9;
  padding-left: 4px;
`;
const MarketImpl: React.FC<IProps> = observer(() => {
  const vm = useMarketVM();
  const { accountStore } = useStores();

  return vm.market == null ? (
    <Navigate to={ROUTES.MARKETS} />
  ) : (
    <Layout>
      <Root apySort={vm.sortApy} liquiditySort={vm.sortLiquidity}>
        <Text weight={500} size="large">
          Lending protocol built on the
          <WavesLink href="https://waves.tech/">Waves blockchain</WavesLink>
        </Text>
        <SizedBox height={4} />
        <Subtitle fitContent>
          Supply and borrow tokens using different pools
        </Subtitle>
        <SizedBox height={40} />
        <AccountDataWrapper>
          <AccountHealth />
          <Column crossAxisSize="max">
            <TotalLiquidity>
              <Text style={{ color: "#ffffff" }}>
                {`Total liquidity of ${vm.market.title}: `}
                {vm.initialized ? (
                  <b>$ {vm.market.totalLiquidity.toFormat(2)}</b>
                ) : (
                  <Skeleton baseColor="#fff" width={64} height={16} />
                )}
              </Text>
            </TotalLiquidity>
            <SizedBox height={24} />
            {accountStore.address && <AccountSupplyAndBorrow />}
            <AssetsTable />
          </Column>
        </AccountDataWrapper>
        <WhatIsLend />
        <FAQ />
        <Outlet />
      </Root>
    </Layout>
  );
});

const Market: React.FC<IProps & RouteProps> = observer(() => {
  const { marketsStore } = useStores();
  const { marketId } = useParams<{ marketId?: string }>();
  if (marketId == null) return <Navigate to={ROUTES.NOT_FOUND} />;
  return !marketsStore.initialized ? (
    <Spinner />
  ) : (
    <MarketVMProvider marketId={marketId}>
      <MarketImpl />
    </MarketVMProvider>
  );
});

export default Market;
