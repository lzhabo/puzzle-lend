import React from "react";
import { Column, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import SquareTokenIcon from "@components/SquareTokenIcon";
import styled from "@emotion/styled";

interface IProps {
  availableAmount?: BN | null;
  depositPrefix?: string;
  depositAmount: BN | null;
  percent: number;
  symbol: string;
  logo: string;
}

const Root = styled.div<{ warning: boolean }>``;
const AddTokenRow: React.FC<IProps> = ({
  availableAmount,
  depositAmount,
  percent,
  symbol,
  logo,
  depositPrefix,
}) => {
  const available = availableAmount ? availableAmount.toFormat(4) : "-";
  const deposit = depositAmount
    ? depositAmount.isNaN()
      ? "-"
      : depositAmount.toFormat(4)
    : "-";
  const isLowMoney = availableAmount != null && availableAmount.eq(0);
  return (
    <Root className="gridRow" warning={isLowMoney}>
      <Row alignItems="center" mainAxisSize="fit-content">
        <SquareTokenIcon size="small" src={logo} alt="logo" />
        <SizedBox width={8} />
        <Column>
          <Text fitContent size="medium" className="text">
            {symbol}
          </Text>
          <Text fitContent type="secondary" size="small" className="text">
            <span>Share: </span>
            <span style={{ paddingLeft: 1 }}>{percent} %</span>
          </Text>
        </Column>
      </Row>
      <Column style={{ width: "100%", textAlign: "end" }}>
        <Text nowrap className="text">
          {depositPrefix}
          {deposit}
        </Text>
        <Text type="secondary" size="small" className="text">
          Available: {available}
        </Text>
      </Column>
    </Root>
  );
};
export default observer(AddTokenRow);
