import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { ReactComponent as Adv1 } from "@src/assets/landing/adv1.svg";
import { ReactComponent as Adv2 } from "@src/assets/landing/adv2.svg";
import { ReactComponent as Adv3 } from "@src/assets/landing/adv3.svg";
import { ReactComponent as Adv4 } from "@src/assets/landing/adv4.svg";
import { ReactComponent as MediumLogo } from "@src/assets/landing/medium-logo.svg";
import { Row, Column } from "@components/Flex";
import PuzzleBanner from "@screens/Landing/About/PuzzleBanner";
interface IProps {}

const Wrapper = styled(Column)`
  align-items: center;
  background: #f1f2fe;
  width: 100%;
`;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 56px 16px 136px 16px;
  box-sizing: border-box;
  max-width: 1440px;
  position: relative;
  width: 100%;
  @media (min-width: 880px) {
    padding-top: 96px;
    padding-bottom: 260px;
  }
`;

const advantages = [
  {
    title: "Mega pools",
    subtitle:
      "Trade up to 10 tokens in one pool without extra fees and lower slippage risks. Any token can be exchanged to any other.",
    icon: <Adv1 />,
  },
  {
    title: "Portfolio pools",
    subtitle:
      "Create a custom trading pool and provide liquidity from your portfolio with any token which is suitable for you.",
    icon: <Adv2 />,
  },
  {
    title: "Fair routing",
    subtitle:
      "Suitable routing service between custom pools and AMM-exchanges on Waves — trade with the best fare.",
    icon: <Adv3 />,
  },
  {
    title: "Trading abonnements",
    subtitle:
      "Purchase atonement with PUZZLE to pay less fees if you are a regular user.",
    icon: <Adv4 />,
  },
];

const Advantages = styled.div`
  margin-top: 60px;
  display: grid;
  column-gap: 40px;
  row-gap: 44px;
  grid-template-columns: 1fr;
  @media (min-width: 880px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    margin-top: 44px;
  }
  .advantage {
    display: flex;
    flex-direction: column;
    max-width: 260px;
    align-items: center;
  }
  .iconWrapper {
    border-radius: 16px;
    width: 80px;
    height: 80px;
    background: #fff;
    justify-content: center;
    align-items: center;
  }
`;

const LearnMore = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  height: 56px;
  position: absolute;
  left: 20px;
  top: -56px;
  background: #f1f2fe;
  border-radius: 12px 12px 0px 0px;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #7075e9;
`;

const About: React.FC<IProps> = () => {
  return (
    <Wrapper>
      <Root>
        <Text style={{ color: "#7075E9" }} weight={500}>
          ABOUT
        </Text>
        <SizedBox height={8} />
        <Text weight={500} size="large">
          Solving multiple pain points and market needs
        </Text>
        <Advantages>
          {advantages.map((v, i) => (
            <div key={i} className="advantage">
              <Row className="iconWrapper">{v.icon}</Row>
              <SizedBox height={28} />
              <Text style={{ fontSize: 24 }} weight={500}>
                {v.title}
              </Text>
              <SizedBox height={8} />
              <Text type="secondary">{v.subtitle}</Text>
            </div>
          ))}
        </Advantages>
        <LearnMore
          href="https://medium.com/@izhur27/what-is-puzzle-swap-1e4b4af4ed17"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more at our <SizedBox width={12} />
          <MediumLogo />
        </LearnMore>
        <PuzzleBanner />
      </Root>
    </Wrapper>
  );
};
export default About;
