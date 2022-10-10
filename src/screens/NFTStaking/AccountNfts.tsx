import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react-lite";
import { useNFTStakingVM } from "@screens/NFTStaking/NFTStakingVM";
import { useStores } from "@stores";
import NoNfts from "@screens/NFTStaking/NoNfts";
import Artefact, { ArtefactSkeleton } from "@screens/NFTStaking/Artefact";
import Button from "@components/Button";
import DetailsButton from "@src/components/DetailsButton";
import { Row } from "@src/components/Flex";
import SizedBox from "@src/components/SizedBox";
import { ReactComponent as LinkIcon } from "@src/assets/icons/link.svg";
import Text from "@components/Text";
import { Anchor } from "@components/Anchor";
import Loading from "@components/Loading";
import { EXPLORER_URL } from "@src/constants";

interface IProps {}

const Root = styled.div`
  display: grid;
  row-gap: 16px;
  grid-template-columns: repeat(auto-fill);
  @media (min-width: 604px) {
    grid-template-columns: repeat(auto-fill, 278px);
    column-gap: 16px;
  }
`;

const AccountNfts: React.FC<IProps> = () => {
  const { accountStore, nftStore, stakeStore } = useStores();
  const { accountNFTsToStake, stakedAccountNFTs } = nftStore;
  const vm = useNFTStakingVM();
  if (accountStore.address == null)
    return (
      <NoNfts
        text="Connect your wallet to see your NFTs"
        btnText="Connect wallet"
        onBtnClick={() => accountStore.setLoginModalOpened(true)}
      />
    );

  if (
    accountNFTsToStake &&
    accountNFTsToStake.length === 0 &&
    stakedAccountNFTs &&
    stakedAccountNFTs.length === 0
  )
    return (
      <NoNfts
        text={`You have no NFT on your wallet yet.\nGo to the market tab to buy one.`}
        btnText="Go to Market"
        onBtnClick={() => vm.setNftDisplayState(0)}
      />
    );
  return (
    <Root>
      {accountNFTsToStake == null && stakedAccountNFTs == null && (
        <ArtefactSkeleton />
      )}
      {accountNFTsToStake &&
        accountNFTsToStake.map((nft, index) => (
          <Artefact
            {...nft}
            key={index + "accountNFT"}
            name={nft.name}
            apy={
              nft.typeId != null && nft.typeId.includes("ania")
                ? stakeStore.stats?.aniaApy?.toNumber()
                : stakeStore.stats?.eagleApy?.toNumber()
            }
            buttons={
              <>
                {!vm.loading ? (
                  <Button
                    size="medium"
                    onClick={() => vm.stake(nft.assetId)}
                    fixed
                  >
                    Stake
                  </Button>
                ) : (
                  <Button size="medium" disabled fixed>
                    In progress <Loading />
                  </Button>
                )}
                <DetailsButton style={{ marginLeft: 8 }}>
                  <Anchor
                    href={
                      nft.marketLink == null
                        ? `https://puzzlemarket.org/nft/${nft.assetId}`
                        : nft.marketLink
                    }
                  >
                    <Row alignItems="center">
                      <LinkIcon />
                      <SizedBox width={8} />
                      <Text>View on Market</Text>
                    </Row>
                  </Anchor>
                  <SizedBox height={20} />
                  <Anchor href={`${EXPLORER_URL}/assets/${nft.assetId}`}>
                    <Row alignItems="center">
                      <LinkIcon />
                      <SizedBox width={8} />
                      <Text>View on Waves Explorer</Text>
                    </Row>
                  </Anchor>
                </DetailsButton>
              </>
            }
          />
        ))}
      {stakedAccountNFTs &&
        stakedAccountNFTs.map((nft, index) => (
          <Artefact
            {...nft}
            name={nft.name}
            key={index + "accountNFT"}
            buttons={
              <>
                {!vm.loading ? (
                  <Button
                    kind="secondary"
                    size="medium"
                    fixed
                    onClick={() => vm.unStake(nft.assetId)}
                  >
                    Unstake
                  </Button>
                ) : (
                  <Button kind="secondary" size="medium" disabled fixed>
                    In progress <Loading />
                  </Button>
                )}
                <DetailsButton style={{ marginLeft: 8 }}>
                  <Anchor
                    href={
                      nft.marketLink == null
                        ? `https://puzzlemarket.org/nft/${nft.assetId}`
                        : nft.marketLink
                    }
                  >
                    <Row alignItems="center">
                      <LinkIcon />
                      <SizedBox width={8} />
                      <Text>View on Market</Text>
                    </Row>
                  </Anchor>
                  <SizedBox height={20} />
                  <Anchor href={`${EXPLORER_URL}/assets/${nft.assetId}`}>
                    <Row alignItems="center">
                      <LinkIcon />
                      <SizedBox width={8} />
                      <Text>View on Waves Explorer</Text>
                    </Row>
                  </Anchor>
                </DetailsButton>
              </>
            }
          />
        ))}
    </Root>
  );
};
export default observer(AccountNfts);
