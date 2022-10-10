import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import Button from "@components/Button";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";

interface IProps {}

const Root = styled.div`
  display: grid;
  align-items: center;
  flex-direction: column;
  grid-template-columns: 1fr;
  row-gap: 16px;
  @media (min-width: 880px) {
    grid-template-columns: 80% 20%;
    flex-direction: row;
    .text {
      width: fit-content;
    }
  }
`;

const LoggedOutRewardInfo: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  return (
    <Root>
      <Text type="secondary" style={{ textAlign: "center" }} className="text">
        Connect your wallet to see your staking balance and reward
      </Text>
      <Button
        fixed
        size="medium"
        onClick={() => accountStore.setLoginModalOpened(true)}
      >
        Connect wallet
      </Button>
    </Root>
  );
};
export default observer(LoggedOutRewardInfo);
