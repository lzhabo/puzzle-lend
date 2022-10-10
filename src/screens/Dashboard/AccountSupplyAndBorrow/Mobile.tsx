import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { Column } from "@src/components/Flex";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  @media (min-width: 768px) {
    gap: 24px;
    flex-direction: row;
  }
`;
const Card = styled.div();
const Mobile: React.FC<IProps> = () => {
  return (
    <Root>
      <Column>
        <Text weight={500} type="secondary">
          My supply
        </Text>
        <SizedBox height={8} />
        <Card></Card>
      </Column>
      <Column>
        <Text weight={500} type="secondary">
          My borrow
        </Text>
        <SizedBox height={8} />
      </Column>
    </Root>
  );
};
export default Mobile;
