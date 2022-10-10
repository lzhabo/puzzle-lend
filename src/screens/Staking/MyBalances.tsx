import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@src/components/Flex";
import SquareTokenIcon from "@components/SquareTokenIcon";
import stakedPuzzle from "@src/assets/tokens/staked-puzzle.svg";
import puzzleLogo from "@src/assets/tokens/PUZZLE.svg";
import { useStakingVM } from "@screens/Staking/StakingVM";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import Skeleton from "react-loading-skeleton";
import { useStores } from "@stores";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 24px;
`;

const Container = styled(Card)`
  display: grid;
  row-gap: 16px;
  @media (min-width: 880px) {
    grid-template-columns: 1fr 1fr;
    padding: 24px;
  }
`;
const MyBalances: React.FC = () => {
  const { accountStore } = useStores();
  const vm = useStakingVM();
  const staked = vm.addressStaked
    ? BN.formatUnits(vm.addressStaked, vm.puzzleToken.decimals).toFormat(2)
    : null;
  const available = BN.formatUnits(
    vm.puzzleBalance.balance ?? BN.ZERO,
    vm.puzzleToken.decimals
  );
  return (
    <Root>
      <Text weight={500} type="secondary">
        My balances
      </Text>
      <SizedBox height={8} />
      <Container>
        <Row>
          <SquareTokenIcon src={puzzleLogo} size="small" />
          <SizedBox width={8} />
          <Column justifyContent="space-between">
            <Text type="secondary" size="small">
              Available to stake
            </Text>
            <Text weight={500}>
              {vm.puzzleBalance.balance == null &&
              accountStore.address != null ? (
                <Skeleton height={16} width={110} />
              ) : (
                `${available.toFormat(2)}`
              )}
            </Text>
          </Column>
        </Row>
        <Row>
          <SquareTokenIcon src={stakedPuzzle} size="small" />
          <SizedBox width={8} />
          <Column justifyContent="space-between">
            <Text type="secondary" size="small" style={{ marginBottom: 2 }}>
              Staked balance
            </Text>
            <Text weight={500}>
              {staked != null ? staked : <Skeleton height={16} width={110} />}
            </Text>
          </Column>
        </Row>
      </Container>
    </Root>
  );
};
export default observer(MyBalances);
