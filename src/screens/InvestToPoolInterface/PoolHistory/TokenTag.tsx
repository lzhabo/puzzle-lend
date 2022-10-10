import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import Img from "@components/Img";
import Text from "@components/Text";
import { IToken } from "@src/constants";
import BN from "@src/utils/BN";

interface IProps extends HTMLAttributes<HTMLDivElement> {
  token: IToken;
  amount?: BN;
}

const Root = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 8px;
  background: ${({ theme }) => theme.colors.primary100};
  border-radius: 8px;
`;

const TokenTag: React.FC<IProps> = ({ token, amount }) => {
  const value =
    amount == null ? BN.ZERO : BN.formatUnits(amount, token.decimals);
  return (
    <Root>
      <Img src={token.logo} alt="token" radius="50%" />
      {amount && (
        <Text style={{ marginLeft: 8 }} size="medium">
          {value.toFormat(value.gte(0.01) ? 2 : 4)}
        </Text>
      )}
    </Root>
  );
};
export default TokenTag;
