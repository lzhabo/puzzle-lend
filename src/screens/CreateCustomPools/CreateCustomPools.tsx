import styled from "@emotion/styled";
import React from "react";
import { Observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import { CreateCustomPoolsVMProvider } from "@screens/CreateCustomPools/CreateCustomPoolsVm";
import GoBack from "@components/GoBack";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import PoolSettingsCard from "@screens/CreateCustomPools/PoolSettingsCard";
import SummaryCard from "@screens/CreateCustomPools/SummaryCard";
import CreatePoolsStepper from "@screens/CreateCustomPools/CreatePoolsStepper";
import ContinueBtn from "@screens/CreateCustomPools/ContinueBtn";

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
  margin-top: 56px;
  text-align: left;
`;
const Grid = styled.div`
  display: grid;
  row-gap: 24px;
  @media (min-width: 880px) {
    grid-template-columns: 1fr 2fr 1fr;
    row-gap: 0;
    column-gap: 40px;
  }
`;
const Subtitle = styled(Text)`
  @media (min-width: 880px) {
    max-width: 560px;
  }
`;
const MobileContinueBtn = styled.div`
  display: flex;
  @media (min-width: 880px) {
    background: rgba(255, 192, 203, 0.81);
    display: none;
  }
`;
const CreateCustomPoolsImpl: React.FC = () => {
  return (
    <Layout>
      <Observer>
        {() => (
          <Root>
            <GoBack link="/invest" text="Back to Invest" />
            <SizedBox height={24} />
            <Text weight={500} size="large">
              Create pool
            </Text>
            <SizedBox height={8} />
            <Subtitle size="medium">
              Create a custom megapool using one of the NFT Artefacts. You can
              set any pool composition and maximise your liquidity providing
              rewards. Moreover, being an owner, you will earn a part of all
              fees collected by the pool.
            </Subtitle>
            <SizedBox height={24} />
            <Grid>
              <CreatePoolsStepper />
              <PoolSettingsCard />
              <SummaryCard />
              <MobileContinueBtn>
                <ContinueBtn />
              </MobileContinueBtn>
            </Grid>
          </Root>
        )}
      </Observer>
    </Layout>
  );
};

const CreateCustomPools: React.FC = () => (
  <CreateCustomPoolsVMProvider>
    <CreateCustomPoolsImpl />
  </CreateCustomPoolsVMProvider>
);
export default CreateCustomPools;
