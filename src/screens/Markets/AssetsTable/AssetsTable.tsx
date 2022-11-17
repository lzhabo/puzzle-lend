import React from "react";
import styled from "@emotion/styled";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import { ASSETS_TYPE } from "@src/constants";
import Text from "@src/components/Text";
import SizedBox from "@components/SizedBox";
import useWindowSize from "@src/hooks/useWindowSize";
import DesktopTable from "@screens/Dashboard/AssetsTable/DesktopTable";
import MobileAssetsTable from "@screens/Dashboard/AssetsTable/MobileAssetsTable";

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
  const { width } = useWindowSize();
  const { lendStore } = useStores();

  if (
    width &&
    width < 880 &&
    lendStore.mobileDashboardAssets !== ASSETS_TYPE.HOME
  )
    return null;

  //todo add filter
  return (
    <Root>
      <Text weight={500} type="secondary">
        All assets
      </Text>
      <SizedBox height={8} />
      {/*filter*/}
      {width && width >= 880 ? <DesktopTable /> : <MobileAssetsTable />}
    </Root>
  );
};
export default observer(AssetsTable);
