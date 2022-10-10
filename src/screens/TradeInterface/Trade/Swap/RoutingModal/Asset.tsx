import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import Text from "@components/Text";
import { ISchemaExchange } from "@screens/TradeInterface/SwapVM";
import SizedBox from "@components/SizedBox";
import { Row } from "src/components/Flex";
import RoundTokenIcon from "@components/RoundTokenIcon";
import FilledText from "./FilledText";

interface IProps extends ISchemaExchange, HTMLAttributes<HTMLDivElement> {}

const Root = styled.div<{ singleAsset?: boolean; singleRoute?: boolean }>`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  box-sizing: border-box;
  border-radius: 12px;
  padding: 16px;
  margin: 0 24px;
  width: 100%;
`;

const Asset: React.FC<IProps> = ({ rate, token0, token1, type, ...rest }) => {
  return (
    <Root {...rest}>
      <Row alignItems="center">
        <RoundTokenIcon alt="icon" src={token1?.logo} />
        <SizedBox width={8} />
        <Text>{token1?.symbol}</Text>
      </Row>
      <SizedBox height={8} />
      <FilledText justifyContent="start">
        1 {token0?.symbol} = {rate.toFormat(2)} {token1?.symbol} &nbsp;
        <b>{type}</b>
      </FilledText>
    </Root>
  );
};
export default Asset;
