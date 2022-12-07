import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import TotalMarketsInfo from "@screens/Markets/TotalMarketsInfo";
import MarketCards from "@screens/Markets/MarketCards";

interface IProps {}

const Root = styled.div`
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

const Markets: React.FC<IProps> = () => {
  return (
    <Layout>
      <Root>
        <Text weight={500} size="large">
          Markets on Puzzle Lend
        </Text>
        <SizedBox height={16} />
        <TotalMarketsInfo />
        <SizedBox height={24} />
        <MarketCards />
      </Root>
    </Layout>
  );
};

export default observer(Markets);
