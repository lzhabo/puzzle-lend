import styled from "@emotion/styled";
import React from "react";
import invest from "@src/assets/landing/invest.png";
import { Column, Row } from "@components/Flex";
import Button from "@components/Button";
import Text from "@components/Text";
import { Link } from "react-router-dom";
import { Anchor } from "@components/Anchor";
import { ROUTES } from "@src/constants";

interface IProps {}

const Wrapper = styled(Column)`
  align-items: center;
  background: #f1f2fe;

  width: 100%;
`;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  padding: 56px 16px 102px 16px;
  box-sizing: border-box;
  max-width: 1440px;
  @media (min-width: 880px) {
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    padding: 72px 20px;
  }
`;
const Img = styled.img`
  width: 100%;
  height: auto;
  @media (min-width: 880px) {
    margin-left: 40px;
    width: 50%;
  }
`;

const TitleWrapper = styled(Column)`
  text-align: center;
  align-items: center;
  justify-content: center;
  width: 100%;
  @media (min-width: 880px) {
    max-width: 560px;
    text-align: left;
    align-items: start;
  }
`;

const Title = styled.div`
  font-weight: 500;
  font-size: 32px;
  line-height: 40px;
  color: #363870;
  padding-bottom: 16px;
  width: 100%;
  justify-content: center;
  align-items: center;
`;
const Subtitle = styled.div`
  font-size: 16px;
  line-height: 24px;
  color: #8082c5;
  padding-bottom: 8px;
  @media (min-width: 880px) {
    max-width: 400px;
  }

  .dark {
    color: #363870;
  }

  a {
    font-weight: 500;
    color: #7075e9;
  }
`;
const BtnContainer = styled(Row)`
  padding: 40px 0;
  justify-content: center;
  @media (min-width: 880px) {
    button {
      max-width: 144px;
    }

    justify-content: start;
  }
`;

const Invest: React.FC<IProps> = () => {
  return (
    <Wrapper>
      <Root>
        <TitleWrapper>
          <Text
            style={{ color: "#7075E9", textAlign: "center", marginBottom: 8 }}
            weight={500}
            fitContent
          >
            INVEST
          </Text>
          <Title>
            Be one of the first liquidity providers in Puzzle MegaPools!
          </Title>
          <Row>
            <Subtitle style={{ paddingBottom: 0 }}>
              Earn passive income for staking your portfolio and exchange fees
              from puzzle volume at the same time.
              <br />
              <Anchor href="https://medium.com/@izhur27/what-is-puzzle-swap-1e4b4af4ed17">
                Learn more on our Medium.
              </Anchor>
            </Subtitle>
          </Row>
          <BtnContainer>
            <Link to={ROUTES.INVEST}>
              <Button style={{ marginRight: 8, width: 167 }}>Invest</Button>
            </Link>
          </BtnContainer>
        </TitleWrapper>
        <Img src={invest} alt="puzzle" />
      </Root>
    </Wrapper>
  );
};
export default Invest;
