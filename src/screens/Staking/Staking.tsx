import styled from "@emotion/styled";
import React from "react";
import { Observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import { StakingVMProvider } from "./StakingVM";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Reward from "./Reward";
import NFTStakingBanner from "./NFTStakingBanner";
import Overview from "@screens/Staking/Overview";
import MyBalances from "@screens/Staking/MyBalances";
import StakeUnstake from "./StakeUnstake";
import { Column } from "@components/Flex";

const Root = styled.div`
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
`;

const Body = styled.div`
  width: 100%;
  display: grid;
  @media (min-width: 880px) {
    grid-template-columns: auto 45ch;
    column-gap: 40px;
  }
`;

const MainBlock = styled.div`
  width: 100%;
`;
const RightBlockMobile = styled(Column)`
  width: 100%;
  @media (min-width: 880px) {
    display: none;
  }
`;
const RightBlock = styled(Column)`
  width: 100%;
  display: none;
  @media (min-width: 880px) {
    display: flex;
  }
`;
const AdaptiveText = styled(Text)`
  @media (min-width: 880px) {
    max-width: 450px;
  }
`;

const StakingImpl: React.FC = () => {
  return (
    <Layout>
      <Observer>
        {() => (
          <Root>
            <Text weight={500} size="large">
              PUZZLE Staking
            </Text>
            <SizedBox height={8} />
            <AdaptiveText fitContent textAlign="left" type="secondary">
              For every swap on the exchange, 0.8% of the swap fees are
              distributed as USDN to your share of the staking balance.
            </AdaptiveText>
            <Body>
              <MainBlock>
                <RightBlockMobile>
                  <Reward />
                  <NFTStakingBanner />
                </RightBlockMobile>
                <Overview />
                <MyBalances />
                <StakeUnstake />
              </MainBlock>
              <RightBlock>
                <Reward />
                <NFTStakingBanner />
              </RightBlock>
            </Body>
          </Root>
        )}
      </Observer>
    </Layout>
  );
};

const Staking: React.FC = () => (
  <StakingVMProvider>
    <StakingImpl />
  </StakingVMProvider>
);
export default Staking;
