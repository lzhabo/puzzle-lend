import styled from "@emotion/styled";
import React from "react";
import { useDashboardVM } from "@screens/Dashboard/DashboardVm";
import Text from "@src/components/Text";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;
const Asset = styled.div`
  padding: 16px;
  @media (min-width: 768px) {
    padding: 24px;
  }
`;

const MobileAssetsTable: React.FC<IProps> = () => {
  const vm = useDashboardVM();
  return (
    <Root>
      {vm.tokens.map((token) => (
        <Asset key={`token-${token.assetId}`}>
          <Text>{token.symbol}</Text>
        </Asset>
      ))}
    </Root>
  );
};
export default MobileAssetsTable;
