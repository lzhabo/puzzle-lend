import styled from "@emotion/styled";
import React from "react";
import { Column } from "@components/Flex";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import TokensTable from "@screens/Landing/TokensList/TokensTable";

interface IProps {}

const Wrapper = styled(Column)`
  align-items: center;
  background: #ffffff;
  width: 100%;
`;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 136px 16px 55px 16px;
  box-sizing: border-box;
  max-width: 1440px;
  text-align: center;
  @media (min-width: 880px) {
    padding: 260px 20px 108px 20px;
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

const TokensList: React.FC<IProps> = () => {
  return (
    <Wrapper>
      <Root>
        <Text style={{ color: "#7075E9" }} weight={500}>
          TRADE
        </Text>
        <SizedBox height={8} />
        <Text style={{ maxWidth: 560 }} weight={500} size="large">
          Trade the most performing tokens listed in Puzzle mega pools
        </Text>
        <TokensTable />
      </Root>
    </Wrapper>
  );
};
export default TokensList;
