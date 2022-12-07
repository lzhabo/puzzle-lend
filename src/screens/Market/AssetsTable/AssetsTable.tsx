import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import Text from "@src/components/Text";
import SizedBox from "@components/SizedBox";
import useWindowSize from "@src/hooks/useWindowSize";
import DesktopTable from "@screens/Market/AssetsTable/DesktopTable";
import MobileAssetsTable from "@screens/Market/AssetsTable/MobileAssetsTable";
import { useMarketVM } from "@screens/Market/MarketVm";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 60px;
  width: 100%;
  @media (min-width: 1440px) {
    margin-bottom: 96px;
  }
`;

const AssetsTable: React.FC<IProps> = () => {
  const vm = useMarketVM();
  const { marketStats: stats, contractAddress: poolId } = vm.market;
  const { width } = useWindowSize();

  return (
    <Root>
      <Text weight={500} type="secondary">
        All assets
      </Text>
      <SizedBox height={8} />

      {width && width >= 880 ? (
        <DesktopTable {...{ stats, poolId }} />
      ) : (
        <MobileAssetsTable {...{ stats, poolId }} />
      )}
    </Root>
  );
};
export default observer(AssetsTable);
