import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import { Column } from "@src/components/Flex";
import eagle from "@src/assets/eagle.png";
import Button from "@components/Button";
import SizedBox from "@components/SizedBox";
import { Link } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { ROUTES } from "@src/constants";
import { useStores } from "@stores";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 24px;
`;
const Img = styled.img`
  height: 160px;
  width: 160px;
  margin: -24px;
  @media (min-width: 880px) {
    height: 176px;
    width: 176px;
    margin: -24px;
  }
`;
const Title = styled(Text)`
  font-weight: 500;
  font-size: 24px;
  line-height: 32px;
`;
const NFTStakingBanner: React.FC = () => {
  const { stakeStore } = useStores();
  return (
    <Root>
      <Card
        type="dark"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Column mainAxisSize="stretch">
          <Title type="light">NFT Staking</Title>
          <Text type="light" style={{ maxWidth: 195 }}>
            Buy and stake NFTs to get APY boost up to{" "}
            {stakeStore.stats != null
              ? stakeStore.stats.stakingApy
                  ?.plus(stakeStore.stats.eagleApy ?? 0)
                  .toString()
                  .concat(" %")
              : "—"}
          </Text>
          <SizedBox height={16} />
          <Link to={ROUTES.ULTRASTAKE}>
            <Button kind="secondary" style={{ color: "#7075E9" }} size="medium">
              Go to NFT Staking
            </Button>
          </Link>
        </Column>
        <Img src={eagle} alt="eagle" />
      </Card>
    </Root>
  );
};
export default observer(NFTStakingBanner);
