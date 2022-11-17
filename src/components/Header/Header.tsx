import styled from "@emotion/styled";
import React, { useState } from "react";
import mobileMenuIcon from "@src/assets/icons/mobileMenu.svg";
import closeIcon from "@src/assets/icons/close.svg";
import { Column, Row } from "@components/Flex";
import MobileMenu from "@components/Header/MobileMenu";
import SizedBox from "@components/SizedBox";
import Wallet from "@components/Wallet/Wallet";
import { observer } from "mobx-react-lite";
import { ROUTES } from "@src/constants";
import { useLocation, Link } from "react-router-dom";
import { useTheme } from "@emotion/react";
import Tooltip from "@components/Tooltip";
import LinkGroup from "@components/LinkGroup";
import DarkMode from "@components/Header/DarkMode";
import isRoutesEquals from "@src/utils/isRoutesEquals";
import SubHeader from "@components/Header/SubHeader";
import { Anchor } from "@components/Anchor";

interface IProps {}

const Root = styled(Column)`
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  align-items: center;
  z-index: 102;
  box-shadow: 0 8px 56px rgba(54, 56, 112, 0.16);

  a {
    text-decoration: none;
  }
`;

const TopMenu = styled.header`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 64px;
  padding: 0 24px 0 16px;
  max-width: 1440px;
  z-index: 102;
  @media (min-width: 880px) {
    height: 80px;
  }
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.white};

  .logo {
    height: 30px;
    @media (min-width: 880px) {
      height: 36px;
    }
  }

  .icon {
    cursor: pointer;
  }

  @media (min-width: 880px) {
    padding: 0 16px;
  }
`;

const MenuItem = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  box-sizing: border-box;
  border-bottom: 4px solid
    ${({ selected, theme }) =>
      selected ? theme.colors.blue500 : "transparent"};
  height: 100%;
  margin: 0 12px;

  a {
    color: ${({ selected, theme }) =>
      selected ? theme.colors.primary800 : theme.colors.primary650};
  }

  &:hover {
    border-bottom: 4px solid ${({ theme }) => theme.colors.primary300};
    a {
      color: ${({ theme }) => theme.colors.blue500};
    }
  }
`;

const Mobile = styled.div`
  display: flex;
  min-width: fit-content;
  @media (min-width: 880px) {
    display: none;
  }
`;

const Desktop = styled.div`
  display: none;
  min-width: fit-content;
  @media (min-width: 880px) {
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
`;

const Header: React.FC<IProps> = () => {
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const toggleMenu = (state: boolean) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpened(state);
  };

  const menuItems = [
    { name: "Dashboard", link: ROUTES.DASHBOARD },
    {
      name: "Trade",
      link: "https://puzzleswap.org/",
      isExternalLink: true
    },
    {
      name: "NFT",
      link: "https://puzzlemarket.org/",
      isExternalLink: true
    },
    {
      name: "Guidebook",
      link: "https://puzzle-lend.gitbook.io/guidebook/",
      isExternalLink: true
    }
  ];

  const communityMenu = [
    {
      name: "Telegram chat",
      link: "https://t.me/puzzleswap",
      isExternalLink: true
    },
    {
      name: "Notifications bot",
      link: "https://t.me/puzzle_swap",
      isExternalLink: true
    },
    {
      name: "Alerts bot",
      link: "https://t.me/puzzle_alerts_bot",
      isExternalLink: true
    }
  ];
  return (
    <Root>
      <Mobile>
        <MobileMenu
          opened={mobileMenuOpened}
          onClose={() => toggleMenu(false)}
        />
      </Mobile>
      <TopMenu>
        <Row alignItems="center" crossAxisSize="max">
          <Link to={ROUTES.DASHBOARD}>
            <img className="logo" src={theme.images.icons.logo} alt="logo" />
          </Link>
          <Desktop>
            <SizedBox width={54} />
            {menuItems.map(({ name, link, isExternalLink }) => (
              <MenuItem
                key={name}
                selected={isRoutesEquals(link, location.pathname)}
              >
                {isExternalLink ? (
                  <Anchor href={link}>{name}</Anchor>
                ) : (
                  <Link to={link}>{name}</Link>
                )}
              </MenuItem>
            ))}
          </Desktop>
        </Row>
        <Mobile>
          <img
            onClick={() => toggleMenu(!mobileMenuOpened)}
            className="icon"
            src={mobileMenuOpened ? closeIcon : mobileMenuIcon}
            alt="menuControl"
          />
        </Mobile>
        <Desktop>
          <Wallet />
          <SizedBox width={24} />
          <Tooltip
            config={{
              placement: "bottom-start",
              trigger: "click"
            }}
            content={
              <Column crossAxisSize="max">
                <LinkGroup title="" links={communityMenu} />
                <SizedBox height={8} />
                <DarkMode />
              </Column>
            }
          >
            <img
              onClick={() => toggleMenu(!mobileMenuOpened)}
              className="icon"
              src={mobileMenuIcon}
              alt="menuControl"
            />
          </Tooltip>
        </Desktop>
      </TopMenu>
      <SubHeader />
    </Root>
  );
};
export default observer(Header);
