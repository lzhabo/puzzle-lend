import React from "react";
import styled from "@emotion/styled";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Dropdown from "@components/Dropdown";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const data = [
  {
    title: "What is the idea of Puzzle Lend?",
    text: "Puzzle Lend uses an experience of existing Lending Protocols to maximise the user experience. Thanks to an isolated market model, Puzzle Lend enables to supply/borrow even small-cap assets presented in the Waves Ecosystem. "
  },
  {
    title: "What are the risks of using Puzzle Lend?",
    text: "When supplying an asset, there are 2 types of risks. The first one is the utilisation ratio: if it reaches 100%, you will be temporarily unable to withdraw your deposit. The second one is the smart contract risk, still all smart contracts involved in Puzzle Lend have been audited by external entity."
  },
  {
    title: "What is Supply and Borrow APY?",
    text: "APY means compounded percent calculated for daily interest by the formula: APY = 100% * ((1 + interest) ** 365 - 1). It demonstrates the percentage value of your deposit/debt change, if you don’t operate with it for a year."
  },
  {
    title: "How many funds can I borrow?",
    text: "To borrow assets, you need to deposit some collateral. After you supply an asset, the available amount to borrow will be shown. It’s calculated according to the LTV (loan-to-value) factor of your deposit."
  }
];

const FAQ: React.FC<IProps> = () => {
  return (
    <Root>
      <Text weight={500} size="large">
        FAQ
      </Text>
      <SizedBox height={8} />
      <Text size="medium">Get answers on the most asked questions</Text>
      <SizedBox height={24} />
      <Wrapper>
        {data.map(({ text, title }, index) => (
          <Dropdown key={`faq-${index}`} title={title}>
            {text}
          </Dropdown>
        ))}
      </Wrapper>
    </Root>
  );
};
export default FAQ;
