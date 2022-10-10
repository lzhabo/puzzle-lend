import React from "react";
import SizedBox from "@components/SizedBox";
import { Row } from "@components/Flex";
import Text from "@components/Text";
import Button from "@components/Button";
import { useStakingVM } from "@screens/Staking/StakingVM";
import TokenInput from "@components/TokenInput/TokenInput";
import { observer } from "mobx-react-lite";
import Loading from "@components/Loading";

interface IProps {}

const UnStake: React.FC<IProps> = () => {
  const vm = useStakingVM();
  return (
    <>
      <TokenInput {...vm.unstakeTokenInputInfo} />
      <SizedBox height={24} />
      <Row alignItems="center" justifyContent="space-between">
        <Text type="secondary">Transaction fee</Text>
        <Text textAlign="right">0.005 WAVES</Text>
      </Row>
      <SizedBox height={24} />
      {!vm.loading ? (
        <Button fixed onClick={vm.unStake} disabled={!vm.canUnStake}>
          Unstake Puzzle
        </Button>
      ) : (
        <Button disabled fixed>
          Transaction in progress <Loading />
        </Button>
      )}
    </>
  );
};
export default observer(UnStake);
