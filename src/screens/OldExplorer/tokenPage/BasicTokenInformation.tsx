import styled from "@emotion/styled";
import { Column } from "@components/Flex";
import { TOKEN_DETAILS_BY_SYMBOL } from "@src/constants";
import TokenInformationCard from "./TokenInformationCard";
import { useOldExploreVM } from "@screens/OldExplorer/OldExploreVm";

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

const BasicTokenInformation = () => {
  const vm = useOldExploreVM();
  const details = TOKEN_DETAILS_BY_SYMBOL[vm.asset?.symbol ?? ""];
  return (
    <Root>
      {/*<PuzzlePriceChart />*/}
      {details != null && <TokenInformationCard info={details} />}
    </Root>
  );
};

export default BasicTokenInformation;
