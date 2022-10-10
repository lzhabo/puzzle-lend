import React from "react";
import Card from "@components/Card";
import SwitchButtons from "@components/SwitchButtons";
import { observer } from "mobx-react-lite";
import { useStakingVM } from "@screens/Staking/StakingVM";
import SizedBox from "@components/SizedBox";
import Stake from "@screens/Staking/Stake";
import UnStake from "@screens/Staking/UnStake";

interface IProps {}

const StakeUnstake: React.FC<IProps> = () => {
  const vm = useStakingVM();
  return (
    <Card style={{ marginTop: 24 }}>
      <SwitchButtons
        values={["Stake", "Unstake"]}
        active={vm.action}
        onActivate={vm.setAction}
        border
      />
      <SizedBox height={24} />
      {vm.action === 0 ? <Stake /> : <UnStake />}
    </Card>
  );
};
export default observer(StakeUnstake);
