import styled from "@emotion/styled";
import { Column } from "@components/Flex";
import ExploreTokenPriceChart from "@screens/ExploreToken/ExploreTokenPriceChart";
import ExploreTokenPriceStatistics from "@screens/ExploreToken/ExploreTokenPriceStatistics";
import TradeWithTokens from "@screens/ExploreToken/TradeWithTokens";
import useWindowSize from "@src/hooks/useWindowSize";
import AboutToken from "@screens/ExploreToken/AboutToken";
import PoolsWithToken from "./PoolsWithToken";
import OperationsTable from "@screens/ExploreToken/OperationsTable";
import SizedBox from "@components/SizedBox";
import ExploreFooter from "@screens/Explore/ExploreFooter";

const Root = styled(Column)`
  width: 100%;

  & > :first-of-type {
    margin-bottom: 24px;
  }

  @media (min-width: 880px) {
    flex-direction: row;
    & > :first-of-type {
      margin-bottom: 0;
      margin-right: 24px;
    }
  }
`;

const ExploreTokenBasicInformation = () => {
  const { width } = useWindowSize();
  return width && width >= 880 ? (
    <Root>
      <Column crossAxisSize="max">
        <ExploreTokenPriceChart />
        <AboutToken />
        <PoolsWithToken />
        <OperationsTable />
        <ExploreFooter />
      </Column>
      <Column crossAxisSize="max">
        <ExploreTokenPriceStatistics />
        <TradeWithTokens />
      </Column>
    </Root>
  ) : (
    <Root>
      <Column crossAxisSize="max">
        <ExploreTokenPriceChart />
        <SizedBox height={24} />
        <ExploreTokenPriceStatistics />
        <TradeWithTokens />
        <AboutToken />
        <PoolsWithToken />
        <OperationsTable />
        <ExploreFooter />
      </Column>
    </Root>
  );
};
export default ExploreTokenBasicInformation;
