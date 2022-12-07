import React from "react";
import { Route, Routes } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import Header from "@components/Header";
import { Column } from "@components/Flex";
import { useStores } from "@stores";
import WalletModal from "@components/Wallet/WalletModal";
import { ROUTES, OPERATIONS_TYPE } from "@src/constants";
import Markets from "@screens/Markets";
import ExploreToken from "@screens/ExploreToken";
import NotFound from "@screens/NotFound";
import AnalyticsScreen from "@screens/AnalyticsScreen";
import Market from "@screens/Market/Market";
import MarketModal from "@screens/Market/MarketModals/MarketModal";

const Root = styled(Column)`
  width: 100%;
  align-items: center;
  background: ${({ theme }) => theme.colors.primary50};
  min-height: 100vh;
`;

const App: React.FC = () => {
  const { accountStore } = useStores();
  return (
    <Root>
      <Header />
      <Routes>
        <Route path={ROUTES.ANALYTICS} element={<AnalyticsScreen />} />

        {/* MARKETS ARRAY PAGE */}
        <Route path={ROUTES.MARKETS} element={<Markets />} />
        <Route path={ROUTES.ROOT} element={<Markets />} />

        {/* MARKET DETAILS PAGE */}
        <Route path={ROUTES.MARKET} element={<Market />}>
          {[...Object.entries(ROUTES.MARKET_MODALS)].map(([type, path]) => (
            <Route
              path={path}
              key={path}
              element={<MarketModal operationName={type as OPERATIONS_TYPE} />}
            />
          ))}
        </Route>
        <Route path={ROUTES.MARKET_TOKEN_DETAILS} element={<ExploreToken />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <WalletModal
        onClose={() => accountStore.setWalletModalOpened(false)}
        visible={accountStore.walletModalOpened}
      />
    </Root>
  );
};

export default observer(App);
