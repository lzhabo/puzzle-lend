import styled from "@emotion/styled";
import React from "react";
import { useStores } from "@stores";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import { observer } from "mobx-react-lite";
import { Column, Row } from "@components/Flex";
import income from "@src/assets/icons/income.svg";
import wallet from "@src/assets/icons/wallet.svg";
import Button from "@components/Button";
import Loading from "@components/Loading";
import { useInvestToPoolInterfaceVM } from "./InvestToPoolInterfaceVM";
import BN from "@src/utils/BN";
import Skeleton from "react-loading-skeleton";
import dayjs from "dayjs";
import { TOKENS_BY_SYMBOL } from "@src/constants";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 24px;
`;
const Inner = styled.div`
  display: grid;
  flex-direction: column;
  grid-template-columns: 1fr;
  row-gap: 16px;
`;
const Icon = styled.img`
  border-radius: 8px;
  height: 40px;
  width: 40px;
`;
const AvailableToClaim = styled(Row)`
  border-top: 1px solid ${({ theme }) => theme.colors.primary100};
  padding-top: 18px;
`;

const Title = styled(Text)`
  font-size: 14px;
  line-height: 20px;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Reward: React.FC<IProps> = () => {
  const vm = useInvestToPoolInterfaceVM();
  const { accountStore } = useStores();
  const { address } = accountStore;
  if (address == null) return null;
  const date = dayjs(vm.lastClaimDate?.toNumber() ?? 0);
  const format = date.format("D MMM YYYY");
  const totalClaimed = BN.formatUnits(
    vm.totalClaimedReward ?? BN.ZERO,
    TOKENS_BY_SYMBOL.USDN.decimals
  ).toFormat(2);
  return (
    <Root>
      <Text weight={500} type="secondary">
        Reward
      </Text>
      <SizedBox height={8} />
      <Card>
        <Inner>
          <Row>
            <Icon src={income} alt="income" />
            <SizedBox width={8} />
            <Column crossAxisSize="max">
              <Row justifyContent="space-between">
                <Title style={{ flex: 1 }}>Claimed</Title>
                <Title style={{ flex: 2, textAlign: "right" }}>
                  {!vm.lastClaimDate.eq(0) && "Last claim " + format}
                </Title>
              </Row>
              <Text weight={500}>
                {vm.totalClaimedReward != null ? (
                  `$ ${totalClaimed}`
                ) : (
                  <Skeleton height={16} width="50%" />
                )}
              </Text>
            </Column>
          </Row>
          <AvailableToClaim>
            <Icon src={wallet} alt="wallet" />
            <SizedBox width={8} />
            <Column>
              <Title>Available to claim</Title>
              <Text weight={500}>
                {vm.totalRewardToClaim != null ? (
                  `$ ${vm.totalRewardToClaim.toFixed(2)}`
                ) : (
                  <Skeleton height={16} />
                )}
              </Text>
            </Column>
          </AvailableToClaim>
          {vm.loading ? (
            <Button fixed size="medium" disabled>
              In progress
              <Loading />
            </Button>
          ) : (
            <Column crossAxisSize="max">
              {!vm.loading ? (
                <Button
                  fixed
                  size="medium"
                  onClick={vm.claimRewards}
                  disabled={!vm.canClaimRewards}
                >
                  Claim reward
                </Button>
              ) : (
                <Button size="medium" disabled fixed>
                  Claiming
                  <Loading />
                </Button>
              )}
            </Column>
          )}
        </Inner>
      </Card>
    </Root>
  );
};
export default observer(Reward);
