import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react-lite";
import Text from "@components/Text";
import { useStores } from "@stores";
import Skeleton from "react-loading-skeleton";
import Button from "@components/Button";
import SizedBox from "@components/SizedBox";
import { Column } from "@src/components/Flex";
import { ReactComponent as Pics } from "@src/assets/icons/picsUnion.svg";
import { Anchor } from "@components/Anchor";

interface IProps {}

const Root = styled.div`
  display: flex;
  justify-content: center;
  min-height: 400px;
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding-top: 8px;
  column-gap: 8px;
  row-gap: 8px;
  height: fit-content;
`;
const Card = styled.div<{ img?: string }>`
  display: flex;
  width: 156px;
  height: 156px;
  border-radius: 8px;
  background: ${({ img }) => `url(${img}) no-repeat center`};
  background-color: ${({ theme }) => theme.colors.primary100};
  background-size: 156px;
  position: relative;
`;
const Tag = styled.div`
  position: absolute;
  background: ${({ theme }) => theme.colors.primary800};
  border-radius: 6px;
  padding: 4px 8px;
  bottom: 8px;
  left: 8px;
`;
const NFTs: React.FC<IProps> = () => {
  const { nftStore } = useStores();
  const { accountNFTs } = nftStore;
  return (
    <Root>
      <Grid>
        {accountNFTs == null &&
          Array.from({ length: 2 }).map((_, index) => (
            <Skeleton height={156} width={156} key={index + "skeleton-row"} />
          ))}
        {accountNFTs &&
          accountNFTs.map(({ name, imageLink }, index) => (
            <Card img={imageLink} key={index + "nft-card-wallet"}>
              <Tag>
                <Text size="small" type="light">
                  {name}
                </Text>
              </Tag>
            </Card>
          ))}
      </Grid>
      {accountNFTs != null && accountNFTs.length === 0 && (
        <Column justifyContent="center" alignItems="center">
          <SizedBox height={16} />
          <Pics />
          <Text type="secondary" size="medium" textAlign="center">
            You don’t have any NFTs yet.
            <br />
            Explore Puzzle Market to buy one!
          </Text>
          <SizedBox height={16} />
          <Anchor href="https://puzzlemarket.org/">
            <Button size="medium" kind="secondary">
              Go to market
            </Button>
          </Anchor>
          <SizedBox height={100} />
        </Column>
      )}
    </Root>
  );
};
export default observer(NFTs);
