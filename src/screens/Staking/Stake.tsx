import React from "react";
import SizedBox from "@components/SizedBox";
import { Row } from "@components/Flex";
import Text from "@components/Text";
import Button from "@components/Button";
import { useStakingVM } from "@screens/Staking/StakingVM";
import TokenInput from "@components/TokenInput/TokenInput";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import Notification from "@components/Notification";
import { Link } from "react-router-dom";
import buildBuyTokenRoute from "@src/utils/buildBuyTokenRoute";
import Loading from "@components/Loading";

interface IProps {}

const Stake: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const vm = useStakingVM();
  const buyPuzzleRoute = buildBuyTokenRoute("trade", vm.puzzleToken.assetId);
  return (
    <>
      {accountStore.address != null && vm.puzzleBalance.balance?.eq(0) && (
        <React.Fragment>
          <Notification
            type="warning"
            text={
              <Text>
                Your have low PUZZLE balance.{" "}
                <Link to={buyPuzzleRoute}>Buy PUZZLE</Link> to stake it.
              </Text>
            }
          />
          <SizedBox height={24} />
        </React.Fragment>
      )}
      <TokenInput {...vm.tokenStakeInputInfo} />
      <SizedBox height={24} />
      <Row alignItems="center" justifyContent="space-between">
        <Text type="secondary">Transaction fee</Text>
        <Text textAlign="right">0.005 WAVES</Text>
      </Row>
      <SizedBox height={24} />
      {!vm.loading ? (
        <Button fixed onClick={vm.stake} disabled={!vm.canStake}>
          Stake Puzzle
        </Button>
      ) : (
        <Button disabled fixed>
          Transaction in progress <Loading />
        </Button>
      )}
    </>
  );
};
export default observer(Stake);
