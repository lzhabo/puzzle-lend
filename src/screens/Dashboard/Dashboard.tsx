import styled from "@emotion/styled";
import React from "react";
import Layout from "@components/Layout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import DashboardModal from "@components/DashboardModals";
import { DashboardVMProvider, useDashboardVM } from "./DashboardVm";
import { Observer } from "mobx-react-lite";
import WhatIsLend from "@screens/Dashboard/WhatIsLend";
import FAQ from "@screens/Dashboard/FAQ";
import { useStores } from "@stores";
import AssetsTable from "@screens/Dashboard/AssetsTable";
import AccountSupplyAndBorrow from "@screens/Dashboard/AccountSupplyAndBorrow";
import AccountHealth from "@screens/Dashboard/AccountHealth";
import { Column } from "@src/components/Flex";
import { useTheme } from "@emotion/react";
import bg from "@src/assets/dashboard/puzzleBg.svg";

interface IProps {}

const Root = styled.div<{ apySort?: boolean; liquiditySort?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  min-height: 100%;
  max-width: calc(1260px + 32px);
  //max-width: calc(1460px + 32px);
  margin-bottom: 24px;
  margin-top: 40px;
  text-align: left;
  @media (min-width: 880px) {
    margin-top: 56px;
  }

  .apy-group {
    width: 20px;
    height: 20px;
    transform: ${({ apySort }) => (apySort ? "scale(1)" : "scale(1, -1)")};
  }

  .liquidity-group {
    width: 20px;
    height: 20px;
    transform: ${({ liquiditySort }) =>
      liquiditySort ? "scale(1)" : "scale(1, -1)"};
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
  padding: 16px;
  border-radius: 16px;
  width: calc(100% - 32px);
  background: url(${bg}), #7075e9;
  background-repeat: no-repeat;
  background-position: right;
  background-size: contain;
`;
const DashboardImpl: React.FC<IProps> = () => {
  const vm = useDashboardVM();
  const { accountStore, lendStore } = useStores();
  const theme = useTheme();
  return (
    <Layout>
      <Observer>
        {() => (
          <Root apySort={vm.sortApy} liquiditySort={vm.sortLiquidity}>
            <Text weight={500} size="large">
              Lending protocol built on the
              <a
                style={{ color: "#7075E9", paddingLeft: 4 }}
                href="https://waves.tech/"
              >
                Waves blockchain
              </a>
            </Text>
            <SizedBox height={4} />
            <Subtitle fitContent>
              Supply and borrow tokens using different pools
            </Subtitle>
            <SizedBox height={40} />
            {accountStore != null && (
              <AccountDataWrapper>
                <div>
                  <AccountHealth />
                </div>
                <Column crossAxisSize="max">
                  <SizedBox height={24} />
                  {/*todo поправитть на маленьком экране*/}
                  <TotalLiquidity>
                    <Text style={{ color: theme.colors.white }}>
                      Total liquidity :{" "}
                      <b>{lendStore.totalLiquidity.toFormat()}</b>
                    </Text>
                  </TotalLiquidity>
                  <SizedBox height={24} />
                  <AccountSupplyAndBorrow />
                  <SizedBox height={40} />
                  <AssetsTable />
                </Column>
              </AccountDataWrapper>
            )}
            <WhatIsLend />
            <FAQ />
            <DashboardModal
              onClose={() => lendStore.setDashboardModalOpened(false, lendStore.dashboardModalStep)}
              visible={lendStore.dashboardModalOpened}
            />
          </Root>
        )}
      </Observer>
    </Layout>
  );
};

const Dashboard: React.FC<IProps> = () => (
  <DashboardVMProvider>
    <DashboardImpl />
  </DashboardVMProvider>
);
export default Dashboard;
