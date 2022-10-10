import styled from "@emotion/styled";
import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import Text from "@components/Text";
import { useInvestToPoolInterfaceVM } from "@screens/InvestToPoolInterface/InvestToPoolInterfaceVM";
import Card from "@src/components/Card";
import { useStores } from "@stores";
import BN from "@src/utils/BN";
import arrowDownIcon from "@src/assets/icons/thingArrowDown.svg";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import Tooltip from "@components/Tooltip";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@components/Flex";
import Button from "@components/Button";

interface IProps {}

const Root = styled(Card)`
  width: 100%;
  margin-top: 24px;
  padding: 16px 24px !important;
`;

const Title = styled(Text)<{ expanded?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  transition: 0.4s;
  position: relative;
  :after {
    position: absolute;
    top: 4px;
    right: 0;
    height: 16px;
    content: url(${arrowDownIcon});
    transition: 0.4s;
    transform: rotate(${({ expanded }) => (expanded ? -180 : 0)}deg);
  }

  :hover {
    color: #7075e9;
    :after {
      transform: rotate(${({ expanded }) => (expanded ? -180 : -90)}deg);
    }
  }
`;

const Body = styled(Column)<{ expanded?: boolean }>`
  transition: 0.4s;
  overflow: hidden;
  width: 100%;
  height: ${({ expanded }) => (expanded ? 116 : 0)}px;
`;

const LPStaking: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const vm = useInvestToPoolInterfaceVM();
  const [expanded, setExpanded] = useState(false);
  if (accountStore.address == null) return null;
  const availableToStake = BN.formatUnits(
    vm.indexTokenBalance.times(vm.pool.indexTokenRate),
    8
  );
  return (
    <Root onClick={() => setExpanded(!expanded)}>
      <Title weight={500} expanded={expanded}>
        LP Staking
        <Tooltip
          containerStyles={{ display: "flex", alignItems: "center" }}
          content={
            <Text>
              Stake and unstake PZ Index token, which represents the value of
              your pool share
            </Text>
          }
        >
          <InfoIcon style={{ marginLeft: 8 }} />
        </Tooltip>
      </Title>
      <Body expanded={expanded}>
        <SizedBox height={16} />
        <Row>
          <Column crossAxisSize="max">
            <Text type="secondary" size="medium">
              Staked balance
            </Text>
            <Text nowrap>
              $
              {vm.totalProvidedLiquidityByAddress == null
                ? "0.00"
                : vm.totalProvidedLiquidityByAddress?.toFormat(2)}
            </Text>
            <SizedBox height={16} />
            <Button
              fixed
              kind="secondary"
              size="medium"
              disabled={vm.userIndexStaked == null || vm.userIndexStaked?.eq(0)}
              onClick={vm.unstakeIndex}
            >
              Unstake
            </Button>
          </Column>
          <SizedBox width={8} />
          <Column crossAxisSize="max">
            <Text nowrap type="secondary" size="medium">
              Available to stake
            </Text>
            <Text>${availableToStake.toFormat(2)}</Text>
            <SizedBox height={16} />
            <Button
              fixed
              size="medium"
              disabled={!vm.canStakeIndex}
              onClick={vm.stakeIndex}
            >
              Stake
            </Button>
          </Column>
        </Row>
      </Body>
    </Root>
  );
};
export default observer(LPStaking);
