import styled from "@emotion/styled";
import React from "react";
import { Navigate, RouteProps, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { WidgetsVmProvider, useWidgetsVM } from "./WidgetsVm";
import Layout from "@components/Layout";
import Text from "@components/Text";
import { POOLS, ROUTES } from "@src/constants";
import Card from "@components/Card";
import { ReactComponent as WidgetIcoBorrowed } from "@src/assets/icons/totalBorrowed.svg";
import { ReactComponent as WidgetIcoSupplied } from "@src/assets/icons/totalSupplied.svg";

interface IProps {}

const Root = styled.div<{ apySort?: boolean; liquiditySort?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 100%;
  max-width: calc(1328px + 32px);
  text-align: left;
`;

const WidgetsContainer = styled.div`
  display: flex;
  flex-direction: column;
  @media (min-width: 560px) {
    flex-direction: row;
  }
`;
const Widget = styled(Card)`
  margin: 0 24px 0 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const WidgetRight = styled(Widget)`
  margin: 8px 0 0 0;
  @media (min-width: 560px) {
    margin: 0;
  }
`;
const WidgetValue = styled(Text)`
  font-size: 24px;
  line-height: 32px;
`;

const WidgetsImpl: React.FC<IProps> = observer(() => {
  const vm = useWidgetsVM();

  return (
    <Layout>
      <Root apySort={vm.sortApy} liquiditySort={vm.sortLiquidity}>
        <WidgetsContainer>
          <Widget>
            <div>
              <Text size="big" type="secondary">
                Total supplied
              </Text>
              <WidgetValue>10000$</WidgetValue>
            </div>
            <WidgetIcoSupplied />
          </Widget>
          <WidgetRight>
            <div>
              <Text size="big" type="secondary">
                Total borrowed
              </Text>
              <WidgetValue>1000$</WidgetValue>
            </div>
            <WidgetIcoBorrowed />
          </WidgetRight>
        </WidgetsContainer>
      </Root>
    </Layout>
  );
});

const Widgets: React.FC<IProps & RouteProps> = () => {
  const params = useParams<{ poolId: string }>();
  if (params.poolId && !POOLS.some((p) => p.address === params.poolId)) {
    return <Navigate to={ROUTES.ROOT} />;
  }
  return (
    <WidgetsVmProvider poolId={params.poolId}>
      <WidgetsImpl />
    </WidgetsVmProvider>
  );
};

export default observer(Widgets);
