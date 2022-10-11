import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import Header from "@components/Header";
import { Column } from "@components/Flex";
import NotFound from "@screens/NotFound";
import { useStores } from "@stores";
import WalletModal from "@components/Wallet/WalletModal";
import MobileNavBar from "./components/MobileNavBar";
import { ROUTES } from "@src/constants";
import Dashboard from "@screens/Dashboard";

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
        {/* Dashboard */}
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} />} />
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
