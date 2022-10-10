import styled from "@emotion/styled";
import React from "react";
import { observer, Observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import useWindowSize from "@src/hooks/useWindowSize";
import { TokensChartDesktop, TokensChartMobile } from "@components/TokensChart";
import { SwapVMProvider, useSwapVM } from "@screens/TradeInterface/SwapVM";
import { LimitOrdersVMProvider } from "@screens/TradeInterface/LimitOrdersVM";
import Swap from "@screens/TradeInterface/Trade/Swap";
import LimitOrders from "@screens/TradeInterface/Trade/LimitOrders";

const Root = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 24px;
  margin-top: 40px;
  @media (min-width: 880px) {
    margin-top: 56px;
  }
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 592px;
`;
const TradeInterfaceImpl: React.FC = observer(() => {
  const vm = useSwapVM();
  const { width } = useWindowSize();
  return (
    <Layout>
      <Observer>
        {() => (
          <Root>
            {width && width > 880 && (
              <TokensChartDesktop
                height={485}
                token0={vm.token0}
                token1={vm.token1}
                visible={vm.openedChart}
              />
            )}
            {width && width <= 880 && (
              <TokensChartMobile
                token0={vm.token0}
                token1={vm.token1}
                visible={vm.openedChart}
                onClose={() => vm.setOpenedChart(false)}
              />
            )}
            <Container>
              {vm.activeAction === 0 && <Swap />}
              {vm.activeAction === 1 && <LimitOrders />}
            </Container>
          </Root>
        )}
      </Observer>
    </Layout>
  );
});

const TradeInterface: React.FC = () => (
  <SwapVMProvider>
    <LimitOrdersVMProvider>
      <TradeInterfaceImpl />
    </LimitOrdersVMProvider>
  </SwapVMProvider>
);
export default TradeInterface;
