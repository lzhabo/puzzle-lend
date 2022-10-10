import styled from "@emotion/styled";
import React from "react";
import Button from "@components/Button";
import { observer } from "mobx-react-lite";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@src/components/Flex";
import Divider from "@src/components/Divider";
import income from "@src/assets/icons/income.svg";
import wallet from "@src/assets/icons/wallet.svg";
import Text from "@components/Text";
import { useStakingVM } from "@screens/Staking/StakingVM";
import BN from "@src/utils/BN";
import dayjs from "dayjs";
import Loading from "@components/Loading";
import Skeleton from "react-loading-skeleton";
import { TOKENS_BY_SYMBOL } from "@src/constants";

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;
const Icon = styled.img`
  border-radius: 8px;
  height: 40px;
  width: 40px;
`;
const LoggedInRewardInfo: React.FC = () => {
  const vm = useStakingVM();
  const availableToClaim =
    vm.availableToClaim != null
      ? BN.formatUnits(vm.availableToClaim, 18)
      : null;
  const claimedReward =
    vm.claimedReward != null
      ? BN.formatUnits(vm.claimedReward, TOKENS_BY_SYMBOL.USDN.decimals)
      : null;
  const date = dayjs(vm.lastClaimDate?.toNumber() ?? 0);
  const format = date.format("D MMM YYYY");
  return (
    <Root>
      <Row justifyContent="space-between">
        <Row>
          <Icon src={income} alt="income" />
          <SizedBox width={8} />
          <Column justifyContent="space-between">
            <Text type="secondary" size="medium">
              Claimed reward
            </Text>
            <Text weight={500}>
              {claimedReward != null ? (
                claimedReward
                  .toFormat(claimedReward.gte(0.01) ? 2 : 6)
                  .concat(" USDN")
              ) : (
                <Skeleton height={16} width={110} />
              )}
            </Text>
          </Column>
        </Row>
        <Text type="secondary" textAlign="right" size="medium">
          {!vm.lastClaimDate.eq(0) && "Last claim " + format}
        </Text>
      </Row>
      <SizedBox height={18} />
      <Divider />
      <SizedBox height={18} />
      <Row>
        <Icon src={wallet} alt="wallet" />
        <SizedBox width={8} />
        <Column justifyContent="space-between">
          <Text type="secondary" size="medium">
            Available to claim
          </Text>
          <Text weight={500}>
            {availableToClaim != null ? (
              availableToClaim.eq(0) ? (
                "0.00 USDN"
              ) : (
                availableToClaim
                  .toFormat(availableToClaim.gte(0.01) ? 2 : 6)
                  .concat(" USDN")
              )
            ) : (
              <Skeleton height={16} width={110} />
            )}
          </Text>
        </Column>
      </Row>
      <SizedBox height={18} />
      {!vm.loading ? (
        <Button
          fixed
          size="medium"
          onClick={vm.claimReward}
          disabled={!vm.canClaim}
        >
          Claim reward
        </Button>
      ) : (
        <Button size="medium" disabled fixed>
          Transaction in progress <Loading />
        </Button>
      )}
    </Root>
  );
};
export default observer(LoggedInRewardInfo);
