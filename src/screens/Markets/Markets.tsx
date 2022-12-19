import styled from "@emotion/styled";
import React from "react";
import { Navigate, RouteProps, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { MarketsVmProvider, useMarketsVM } from "./MarketsVm";
import Layout from "@components/Layout";
import Text from "@components/Text";
import PoolCards from "./PoolCards";
import Widgets from "./Widgets";
import SizedBox from "@components/SizedBox";
import { POOLS, ROUTES } from "@src/constants";
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

const MarketsImpl: React.FC<IProps> = observer(() => {
  const vm = useMarketsVM();

  return (
    <Layout>
      <Root>
        <Text weight={500} size="large">
          Markets on Puzzle Lend
        </Text>
        <SizedBox height={16} />
        <Widgets />
        <PoolCards />
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
