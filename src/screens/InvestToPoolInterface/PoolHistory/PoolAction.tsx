import React, { useState } from "react";
import styled from "@emotion/styled";
import add from "@src/assets/icons/addTransaction.svg";
import remove from "@src/assets/icons/removeTransaction.svg";
import claim from "@src/assets/icons/claimTransaction.svg";
import Img from "@src/components/Img";
import { IToken } from "@src/constants";
import BN from "@src/utils/BN";
import SizedBox from "@components/SizedBox";
import TokenTag from "@screens/InvestToPoolInterface/PoolHistory/TokenTag";
import Text from "@components/Text";

interface IProps {
  action: "remove" | "add" | "claim";
  tokens: Array<IToken & { amount: BN }>;
}

const Root = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;
const Container = styled.div`
  transition: all 0.6s ease;
  display: flex;
  max-width: 320px;
  flex-wrap: wrap;

  & > * {
    margin: 0 8px 8px 0;
  }
`;
const PoolAction: React.FC<IProps> = ({ tokens, action }) => {
  const [hidden, setHidden] = useState(tokens.length > 3);
  return (
    <Root>
      {action === "add" && <Img src={add} alt="add" />}
      {action === "remove" && <Img src={remove} alt="remove" />}
      {action === "claim" && <Img src={claim} alt="claim" />}
      <SizedBox width={8} />
      <Container>
        {tokens
          .slice(0, hidden ? 3 : tokens.length)
          .map(({ amount, ...token }) => (
            <TokenTag key={token.assetId} token={token} amount={amount} />
          ))}
        {tokens.length > 3 && (
          <Text
            weight={500}
            type="secondary"
            style={{ cursor: "pointer" }}
            onClick={() => setHidden(!hidden)}
          >
            {hidden ? `+ ${tokens.length - 3} more` : "Hide"}
          </Text>
        )}
      </Container>
    </Root>
  );
};
export default PoolAction;
