import React from "react";
import { Route, Routes } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import Header from "@components/Header";
import { Column } from "@components/Flex";
import { useStores } from "@stores";
import WalletModal from "@components/Wallet/WalletModal";
import MobileNavBar from "./components/MobileNavBar";
import { ROUTES, OPERATIONS_TYPE } from "@src/constants";
import Dashboard from "@screens/Dashboard";
import ExploreToken from "@screens/ExploreToken";
import NotFound from "@screens/NotFound";
import DashboardModal from "@screens/Dashboard/DashboardModals";
import AnalyticsScreen from "@screens/AnalyticsScreen";

const Root = styled(Column)`
  width: 100%;
  align-items: center;
  background: ${({ theme }) => theme.colors.primary50};
  min-height: 100vh;
`;

const MobileSpace = styled.div`
  height: 56px;
  @media (min-width: 880px) {
    display: none;
  }
`;

const App: React.FC = () => {
  const { accountStore } = useStores();
  return (
    <Root>
      <Header />
      <Routes>
        {/*Account*/}
        <Route path={ROUTES.ANALYTICS} element={<AnalyticsScreen />} />

        {/* Dashboard */}
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />}>
          {[...Object.entries(ROUTES.DASHBOARD_MODALS)].map(([type, path]) => (
            <Route
              path={path}
              key={path}
              element={
                <DashboardModal operationName={type as OPERATIONS_TYPE} />
              }
            />
          ))}
        </Route>
        <Route path={ROUTES.DASHBOARD_POOL} element={<Dashboard />} />
        <Route
          path={ROUTES.DASHBOARD_TOKEN_DETAILS}
          element={<ExploreToken />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <WalletModal
        onClose={() => accountStore.setWalletModalOpened(false)}
        visible={accountStore.walletModalOpened}
      />
      <MobileSpace />
      <MobileNavBar />
    </Root>
  );
};

export default observer(App);
