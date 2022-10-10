import styled from "@emotion/styled";
import React from "react";
import { Observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import Text from "@components/Text";
import { NFTStakingVMProvider, useNFTStakingVM } from "./NFTStakingVM";
import GoBack from "@components/GoBack";
import SizedBox from "@components/SizedBox";
import Reward from "./Reward";
import Tabs from "@components/Tabs";
import MarketNfts from "@screens/NFTStaking/MarketNfts";
import AccountNfts from "@screens/NFTStaking/AccountNfts";
import { useStores } from "@stores";

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
    .title {
      max-width: 560px;
    }
  }
`;
const NFTStakingImpl: React.FC = () => {
  const { nftStore } = useStores();
  const { artworks } = nftStore;
  const vm = useNFTStakingVM();
  // console.log(stakedAccountNFTs?.length);

  return (
    <Layout>
      <Observer>
        {() => {
          const apy = vm.stats?.ultra?.apy ?? "-";
          const marketNftAmount = artworks?.length;
          //todo return amount of nft on wallet
          // const accountNftAmount =
          //   (accountNFTs?.length ?? 0) + (stakedAccountNFTs?.length ?? 0);
          // const accountNftAmount =
          //   (nftStore.nftForPoolCreation?.length ?? 0) +
          //   (stakedAccountNFTs?.length ?? 0);

          return (
            <Root>
              <GoBack link="/stake" text="Back to Staking" />
              <SizedBox height={24} />
              <Text weight={500} size="large">
                NFT-Staking
              </Text>
              <SizedBox height={8} />
              <Text type="secondary" className="title">
                Stake Puzzle NFT to share the rewards pool from Puzzle
                aggregator fees and boost your staking rewards up to
                <b style={{ color: "#35A15A" }}> {apy}%</b>. You can stake one
                of each type of NFTs.
              </Text>
              <Reward />
              <SizedBox height={40} />
              <Tabs
                tabs={[
                  { name: "Market", additionalInfo: marketNftAmount },
                  { name: "On my wallet" },
                ]}
                activeTab={vm.nftDisplayState}
                setActive={vm.setNftDisplayState}
              />
              <SizedBox height={16} />
              {vm.nftDisplayState === 0 ? <MarketNfts /> : <AccountNfts />}
            </Root>
          );
        }}
      </Observer>
    </Layout>
  );
};

const NFTStaking: React.FC = () => (
  <NFTStakingVMProvider>
    <NFTStakingImpl />
  </NFTStakingVMProvider>
);
export default NFTStaking;
