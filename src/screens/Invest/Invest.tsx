import styled from "@emotion/styled";
import React from "react";
import Layout from "@components/Layout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import SearchAndFilterTab from "@screens/Invest/SearchAndFilterTab";
import { InvestVMProvider, useInvestVM } from "./InvestVm";
import { Observer } from "mobx-react-lite";
import { useStores } from "@stores";
import AccountInvestBalance from "@screens/Invest/AccountInvestBalance";
import PoolsTable from "./PoolsTable";

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
const InvestImpl: React.FC<IProps> = () => {
  const vm = useInvestVM();
  const { accountStore } = useStores();
  return (
    <Layout>
      <Observer>
        {() => (
          <Root apySort={vm.sortApy} liquiditySort={vm.sortLiquidity}>
            <Text weight={500} size="large">
              Invest in Puzzle Mega Pools
            </Text>
            <SizedBox height={4} />
            <Subtitle size="medium" fitContent>
              A liquidity pool is a collection of funds locked in a smart
              contract. Liquidity pools are used to facilitate decentralized
              trading, lending, and many more functions.
            </Subtitle>
            {accountStore.address != null && <AccountInvestBalance />}
            <SizedBox height={24} />
            <SearchAndFilterTab />
            <SizedBox height={16} />
            <PoolsTable />
          </Root>
        )}
      </Observer>
    </Layout>
  );
};

const Invest: React.FC<IProps> = () => (
  <InvestVMProvider>
    <InvestImpl />
  </InvestVMProvider>
);
export default Invest;
