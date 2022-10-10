import styled from "@emotion/styled";
import { Column } from "@components/Flex";
import TokenInformation from "./TokenInformation";
import PriceChart from "../PriceChart";

const Root = styled(Column)`
  width: 100%;

  & > :first-of-type {
    margin-bottom: 24px;
  }

  @media (min-width: 880px) {
    flex-direction: row;
    align-items: flex-end;

    & > :first-of-type {
      margin-bottom: 0;
      margin-right: 24px;
    }
  }
`;

const BasicProtocolInformation = () => {
  return (
    <Root>
      <PriceChart />
      <TokenInformation />
    </Root>
  );
};

export default BasicProtocolInformation;
