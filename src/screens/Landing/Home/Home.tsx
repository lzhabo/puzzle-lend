import styled from "@emotion/styled";
import React from "react";
import img from "@src/assets/landing/home-img.png";
import trade from "@src/assets/landing/tradeIcon.svg";
import liquidity from "@src/assets/landing/liquidityIcon.svg";
import { Column, Row } from "@components/Flex";
import Button from "@components/Button";
import { Link } from "react-router-dom";
import { ROUTES } from "@src/constants";

interface IProps {}

const Wrapper = styled(Column)`
  align-items: center;
  background: #ffffff;
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

  .header-img {
    width: 100%;
    height: auto;
    margin-left: -16px;
    @media (min-width: 880px) {
      margin-left: 40px;
      width: 50%;
    }
  }
`;

const TitleWrapper = styled(Column)`
  text-align: left;
  width: 100%;
  @media (min-width: 880px) {
    max-width: 560px;
  }
`;

const Title = styled.div`
  font-weight: 500;
  font-size: 32px;
  line-height: 40px;
  color: #363870;
  padding-bottom: 16px;
  width: 100%;
  @media (min-width: 880px) {
    font-size: 48px;
    line-height: 56px;
  }
`;
const Subtitle = styled.div`
  font-size: 16px;
  line-height: 24px;
  color: #8082c5;
  padding-bottom: 8px;

  .dark {
    color: #363870;
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

const Icon = styled.img`
  height: 24px;
  width: 24px;
  margin-right: 8px;
`;

const Home: React.FC<IProps> = () => {
  return (
    <Wrapper>
      <Root>
        <TitleWrapper>
          <Title>Decentralized exchange of a newer generation</Title>
          <Row>
            <Icon src={trade} alt="trade" />
            <Subtitle>Trade tokens in multiple mega pools</Subtitle>
          </Row>
          <Row>
            <Icon src={liquidity} alt="liquidity" />
            <Subtitle style={{ paddingBottom: 0 }}>
              Provide liquidity with
              <span className="dark"> up to 150% APY</span>
            </Subtitle>
          </Row>
          <BtnContainer>
            <Link to={ROUTES.TRADE}>
              <Button fixed style={{ marginRight: 8, width: 167 }}>
                Trade
              </Button>
            </Link>
          </BtnContainer>
        </TitleWrapper>
        <img className="header-img" src={img} alt="puzzle" />
      </Root>
    </Wrapper>
  );
};
export default Home;
