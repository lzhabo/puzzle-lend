import styled from "@emotion/styled";
import React from "react";
import Layout from "@components/Layout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { DashboardVMProvider, useDashboardVM } from "./DashboardVm";
import { Observer } from "mobx-react-lite";

interface IProps {}

const Root = styled.div<{ apySort?: boolean; liquiditySort?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  min-height: 100%;
  max-width: calc(1160px + 32px);
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
const DashboardImpl: React.FC<IProps> = () => {
  const vm = useDashboardVM();
  return (
    <Layout>
      <Observer>
        {() => (
          <Root apySort={vm.sortApy} liquiditySort={vm.sortLiquidity}>
            <Text weight={500} size="large">
              Lending protocol built on the
              <a style={{ color: "#7075E9", paddingLeft: 4 }}>
                Waves blockchain
              </a>
            </Text>
            <SizedBox height={4} />
            <Subtitle size="medium" fitContent>
              Supply and borrow tokens using different pools
            </Subtitle>
            {/*{accountStore.address != null && <AccountDashboardBalance />}*/}
            <SizedBox height={24} />
            {/*<SearchAndFilterTab />*/}
            <SizedBox height={16} />
            {/*<PoolsTable />*/}
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
