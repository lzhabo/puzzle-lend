import styled from "@emotion/styled";
import Text from "@components/Text";
import React from "react";
import SizedBox from "@components/SizedBox";

import one from "@src/assets/dashboard/dash1.png";
import two from "@src/assets/dashboard/dash2.png";
import three from "@src/assets/dashboard/dash3.png";
import four from "@src/assets/dashboard/dash4.png";
import { Column } from "@components/Flex";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  margin-bottom: 60px;

  @media (min-width: 880px) {
    margin-top: 0;
  }

  @media (min-width: 1440px) {
    margin-bottom: 96px;
  }
`;

const Wrapper = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (min-width: 1440px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
`;
const Card = styled(Column)`
  position: relative;
  min-height: 250px;
  display: flex;
  width: 100%;
  height: 100%;
  background: red;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 16px;
  box-sizing: border-box;
  padding: 16px;
  background: ${({ theme }) => theme.colors.white};
  max-height: 260px;
  justify-content: flex-end;

  @media (min-width: 880px) {
    justify-content: center;
  }
`;
const Paint = styled.img`
  right: 0;
  top: 0;
  position: absolute;
  border-radius: 16px;
`;
const WhatIsLend: React.FC<IProps> = () => {
  const data = [
    {
      title: "Deposit assets",
      bg: one,
      text: "You can pick any tokens from the Waves Ecosystem to put them into markets and start earning Supply rewards. "
    },
    {
      title: "Borrow funds",
      bg: two,
      text: "You can borrow assets from the market to use for extending your DeFi experience. Take into account that you will pay Borrow interest for it. "
    },
    {
      title: "Leverage position",
      bg: three,
      text: "You can use lending protocol to take long or short positions with an upto 3x leverage. "
    },
    {
      title: "Avoid liquidations",
      bg: four,
      text: "Use an advanced Oracle system based on the TWAP model, which guarantees that the market cannot be manipulated to liquidate safe positions. "
    }
  ];
  return (
    <Root>
      <Text weight={500} size="large">
        What is Puzzle Lend?
      </Text>
      <SizedBox height={24} />
      <Wrapper>
        {data.map(({ title, text, bg }, index) => (
          <Card key={`card-${index}`}>
            <SizedBox height={40} />
            <Column style={{ zIndex: 1 }}>
              <Text weight={500}>{title}</Text>
              <SizedBox height={12} />
              <Text size="medium" style={{ maxWidth: "60%" }}>
                {text}
              </Text>
            </Column>
            <Paint src={bg} alt="bg" />
          </Card>
        ))}
      </Wrapper>
    </Root>
  );
};
export default WhatIsLend;
