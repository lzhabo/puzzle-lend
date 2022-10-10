import styled from "@emotion/styled";
import React from "react";
import SizedBox from "@components/SizedBox";
import LinkGroup from "@components/LinkGroup";
import Divider from "@components/Divider";
import Wallet from "@components/Wallet/Wallet";
import Scrollbar from "@components/Scrollbar";
import { Column } from "../Flex";
import { observer } from "mobx-react-lite";
import { ROUTES } from "@src/constants";
import DarkMode from "@components/Header/DarkMode";

interface IProps {
  onClose: () => void;
  bannerClosed: boolean;
  opened: boolean;
}

const Root = styled.div<{ bannerClosed: boolean; opened: boolean }>`
  z-index: 100;
  background: rgba(0, 0, 0, 0.4);
  position: absolute;
  // top: ${({ bannerClosed }) => (bannerClosed ? 64 : 144)}px;
  top: 64px;
  left: 0;
  right: 0;
  //height: calc(100vh - ${({ bannerClosed }) => (bannerClosed ? 64 : 144)}px);
  height: calc(100vh - 64px);
  transition: 0.2s;
  overflow: hidden;

  ${({ opened }) => (!opened ? `height: 0px;` : "")}
  .menu-body {
    display: flex;
    flex-direction: column;
    background: ${({ theme }) => theme.colors.white};
  }
`;

const WalletWrapper = styled.div`
  padding: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.primary100};
`;

const toolsMenu = [
  { name: "Notifications bot", link: "https://t.me/puzzle_swap", outer: true },
  { name: "Alerts bot", link: "https://t.me/puzzle_alerts_bot", outer: true },
];
const communityMenu = [
  { name: "Telegram", link: "https://t.me/puzzleswap", outer: true },
  { name: "Twitter", link: "https://twitter.com/puzzle_swap", outer: true },
  { name: "Medium", link: "https://medium.com/@puzzleswap", outer: true },
];

const MobileMenu: React.FC<IProps> = ({ bannerClosed, opened, onClose }) => {
  const mainFunctional = [
    { name: "Explore", link: ROUTES.EXPLORE, outer: false },
    { name: "Trade", link: ROUTES.TRADE, outer: false },
    { name: "Invest", link: ROUTES.INVEST, outer: false },
    { name: "Stake", link: ROUTES.STAKE, outer: false },
    { name: "NFT", link: "https://puzzlemarket.org/", outer: true },
  ];
  return (
    <Root {...{ bannerClosed, opened }}>
      <div className="menu-body">
        <Divider />
        <Scrollbar style={{ margin: 24, marginBottom: 0 }}>
          <Column crossAxisSize="max" style={{ maxHeight: "50vh" }}>
            <LinkGroup onClick={onClose} title="" links={mainFunctional} />
            <SizedBox height={24} />
            <LinkGroup title="Tools" links={toolsMenu} />
            <SizedBox height={24} />
            <LinkGroup title="Community" links={communityMenu} />
            <SizedBox height={24} width={1} />
          </Column>
        </Scrollbar>
        <DarkMode style={{ margin: 16 }} />
        <WalletWrapper>
          <Wallet />
        </WalletWrapper>
      </div>
    </Root>
  );
};
export default observer(MobileMenu);
