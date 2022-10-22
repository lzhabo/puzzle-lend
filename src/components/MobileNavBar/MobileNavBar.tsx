import React from "react";
import { observer } from "mobx-react-lite";
import styled from "@emotion/styled";
import { useStores } from "@stores";
import { ROUTES } from "@src/constants";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import Home from "@components/MobileNavBar/Home";
import Invest from "@components/MobileNavBar/Invest";

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

  &.selected {
    background-color: ${({ theme }) => `${theme.colors.primary650}`};
    padding: 5px;
    borde-radius: 4px;

    p {
      color: #fff;
    }
  }
`;
const MobileNavBar: React.FC<IProps> = () => {
  const { lendStore } = useStores();
  const menuItems = [
    {
      name: "My supply",
      link: ROUTES.DASHBOARD,
      icon: (
        <Invest active={lendStore.mobileDashboardAssets === 1 ? true : false} />
      ),
      type: 1 as 1 | 2 | 3
    },
    {
      name: "Home",
      link: ROUTES.DASHBOARD,
      icon: (
        <Home active={lendStore.mobileDashboardAssets === 2 ? true : false} />
      ),
      type: 2 as 1 | 2 | 3
    },
    {
      name: "My borrow",
      link: ROUTES.DASHBOARD,
      icon: (
        <Invest active={lendStore.mobileDashboardAssets === 3 ? true : false} />
      ),
      type: 3 as 1 | 2 | 3
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
