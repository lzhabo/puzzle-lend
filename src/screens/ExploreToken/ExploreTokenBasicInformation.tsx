import styled from '@emotion/styled';
import { Column } from '@components/Flex';
import ExploreTokenPriceChart from '@screens/ExploreToken/ExploreTokenPriceChart';
import ExploreTokenPriceStatistics from '@screens/ExploreToken/ExploreTokenPriceStatistics';
import useWindowSize from '@src/hooks/useWindowSize';
import SizedBox from '@components/SizedBox';

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
      </Column>
      <Column crossAxisSize="max">
        <ExploreTokenPriceStatistics />
      </Column>
    </Root>
  ) : (
    <Root>
      <Column crossAxisSize="max">
        <ExploreTokenPriceChart />
        <SizedBox height={24} />
        <ExploreTokenPriceStatistics />
      </Column>
    </Root>
  );
};
export default ExploreTokenBasicInformation;
