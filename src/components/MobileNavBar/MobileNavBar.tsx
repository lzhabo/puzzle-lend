import React from "react";
import { observer } from "mobx-react-lite";
import styled from "@emotion/styled";
import { useStores } from "@stores";
import { ROUTES, ASSETS_TYPE } from "@src/constants";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import Home from "@components/MobileNavBar/Home";
import Invest from "@src/components/MobileNavBar/Invest";

interface IProps {}

const Root = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;

  position: fixed;
  width: 100%;
  left: 0;
  right: 0;
  bottom: 0;
  @media (min-width: 880px) {
    display: none;
  }
  background: ${({ theme }) => `${theme.colors.white}`};
  border-top: 1px solid ${({ theme }) => `${theme.colors.primary100}`};
  padding: 8px;

  & > * {
    cursor: pointer;
  }

  z-index: 2;
`;

const MenuItem = styled.div<{ selected?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5px;
  padding-bottom: 10px;

  p {
    color: ${({ theme }) => `${theme.colors.primary650}`};
  }

  &.selected {
    p {
      color: ${({ theme }) => `${theme.colors.primary800}`};
    }
  }
`;
//fixme
const MobileNavBar: React.FC<IProps> = () => {
  const { lendStore } = useStores();
  const menuItems = [
    {
      name: "My supply",
      link: ROUTES.DASHBOARD,
      icon: (
        <Invest
          active={lendStore.mobileDashboardAssets === ASSETS_TYPE.SUPPLY_BLOCK}
        />
      ),
      type: ASSETS_TYPE.SUPPLY_BLOCK
    },
    {
      name: "Home",
      link: ROUTES.DASHBOARD,
      icon: (
        <Home active={lendStore.mobileDashboardAssets === ASSETS_TYPE.HOME} />
      ),
      type: ASSETS_TYPE.HOME
    },
    {
      name: "My borrow",
      link: ROUTES.DASHBOARD,
      icon: (
        <Invest
          isBorrow
          active={lendStore.mobileDashboardAssets === ASSETS_TYPE.BORROW_BLOCK}
        />
      ),
      type: ASSETS_TYPE.BORROW_BLOCK
    }
  ];
  return (
    <Root>
      {menuItems.map(({ icon, name, type }, index) => (
        <MenuItem
          key={index}
          onClick={() => lendStore.setDashboardAssetType(type)}
          className={lendStore.mobileDashboardAssets === type ? "selected" : ""}
        >
          {icon}
          {name != null && <SizedBox height={6} />}
          {name != null && (
            <Text size="small" fitContent>
              {name}
            </Text>
          )}
        </MenuItem>
      ))}
    </Root>
  );
};
export default observer(MobileNavBar);
