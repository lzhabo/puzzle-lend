import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import LoggedOutRewardInfo from "./LoggedOutRewardInfo";
import LoggedInRewardInfo from "./LoggedInRewardInfo";
import SizedBox from "@components/SizedBox";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 24px;
`;
const Reward: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const { address } = accountStore;
  return (
    <Root>
      <Text weight={500} type="secondary">
        Reward
      </Text>
      <SizedBox height={8} />
      <Card>
        {address == null ? <LoggedOutRewardInfo /> : <LoggedInRewardInfo />}
      </Card>
    </Root>
  );
};
export default observer(Reward);
