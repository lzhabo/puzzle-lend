import styled from "@emotion/styled";
import React from "react";
import { Column } from "@components/Flex";
import Text from "@components/Text";
import Button from "@components/Button";
import puzzleToken from "@src/assets/landing/puzzleToken.svg";
import { Link } from "react-router-dom";

interface IProps {}

const Root = styled.div`
  display: flex;
  background: #7075e9;
  border-radius: 16px;
  padding: 24px;
  position: absolute;
  bottom: -80px;
  left: 16px;
  right: 16px;
  @media (min-width: 880px) {
    padding: 48px;
  }
`;

const Title = styled(Text)`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #ffffff;
  margin-bottom: 16px;
  text-align: left;
  @media (min-width: 880px) {
    font-size: 32px;
    line-height: 40px;
    margin-bottom: 64px;
  }
`;

const TradeButton = styled(Button)`
  height: 32px;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  border-radius: 10px;
`;

const PuzzleTokenIcon = styled.img`
  height: 120px;
  position: absolute;
  right: -10px;
  top: 12px;
  @media (min-width: 880px) {
    height: 328px;
    right: 48px;
    top: -24px;
  }
`;

const PuzzleBanner: React.FC<IProps> = () => {
  return (
    <Root>
      <Column>
        <Title>
          PUZZLE token <br />
          is released!
        </Title>
        <Link to="/pools/pool/puzzle">
          <TradeButton kind="secondary">Trade PUZZLE</TradeButton>
        </Link>
      </Column>
      <PuzzleTokenIcon src={puzzleToken} alt="puzzle" />
    </Root>
  );
};
export default PuzzleBanner;
