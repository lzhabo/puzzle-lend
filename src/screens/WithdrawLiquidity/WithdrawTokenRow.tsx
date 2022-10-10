import React from "react";
import { Column, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import SquareTokenIcon from "@components/SquareTokenIcon";

interface IProps {
  withdrawUsdnEquivalent?: BN;
  withdrawAmount: BN | null;
  percent: number;
  symbol: string;
  logo: string;
}

const WithdrawTokenRow: React.FC<IProps> = ({
  withdrawUsdnEquivalent,
  withdrawAmount,
  percent,
  symbol,
  logo,
}) => {
  const available = withdrawUsdnEquivalent
    ? withdrawUsdnEquivalent.toFormat(4)
    : "-";
  const deposit = withdrawAmount
    ? withdrawAmount.isNaN()
      ? "-"
      : withdrawAmount.toFormat(4)
    : "-";
  return (
    <div className="gridRow">
      <Row alignItems="center" mainAxisSize="fit-content">
        <SquareTokenIcon src={logo} alt="logo" size="small" />
        <SizedBox width={8} />
        <Column>
          <Text fitContent size="medium" className="text">
            {symbol}
          </Text>
          <Text fitContent type="secondary" size="small" className="text">
            <span>Share: </span>
            <span>{percent} %</span>
          </Text>
        </Column>
      </Row>
      <Column style={{ width: "100%", textAlign: "end" }}>
        <Text nowrap className="text">
          {deposit}
        </Text>
        <Text type="secondary" size="small" className="text">
          $ {available}
        </Text>
      </Column>
    </div>
  );
};
export default observer(WithdrawTokenRow);
