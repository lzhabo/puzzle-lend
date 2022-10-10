import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const LoggedOutRewardInfo: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  return (
    <Root>
      <Text type="secondary" style={{ textAlign: "center" }}>
        Connect your wallet to see your staking balance and reward
      </Text>
      <SizedBox height={8} />
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
