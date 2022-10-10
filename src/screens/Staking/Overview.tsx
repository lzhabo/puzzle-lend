import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { Column } from "@src/components/Flex";
import { observer } from "mobx-react-lite";
import { useStakingVM } from "@screens/Staking/StakingVM";
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
const Overview: React.FC = () => {
  const vm = useStakingVM();
  const { stakeStore } = useStores();
  return (
    <Root>
      <Text weight={500} type="secondary">
        Overview
      </Text>
      <SizedBox height={8} />
      <Container>
        <Column justifyContent="space-between">
          <Text type="secondary" size="small">
            Weekly based APY
          </Text>
          <Text style={{ fontSize: 20 }}>
            {stakeStore.stats?.stakingApy != null ? (
              stakeStore.stats.stakingApy.toFormat(2).concat(" %")
            ) : (
              <Skeleton height={20} width={110} />
            )}
          </Text>
        </Column>
        <Column justifyContent="space-between">
          <Text type="secondary" size="small">
            My share in total staking
          </Text>
          <Text style={{ fontSize: 20 }}>
            {vm.shareOfTotalStake == null ? (
              <Skeleton height={20} width={110} />
            ) : vm.shareOfTotalStake.eq(0) ? (
              "0.00 %"
            ) : (
              vm.shareOfTotalStake
                .toFormat(vm.shareOfTotalStake.lte(0.01) ? 6 : 2)
                .concat(" %")
            )}
          </Text>
        </Column>
      </Container>
    </Root>
  );
};
export default observer(Overview);
