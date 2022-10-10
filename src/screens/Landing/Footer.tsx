import styled from "@emotion/styled";
import React from "react";
import { Column } from "@components/Flex";
import logo from "@src/assets/landing/logo.svg";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";

interface IProps {}

const Wrapper = styled(Column)`
  background-color: #363870;
  width: 100%;
  align-items: center;
`;
const Text = styled.a<{ secondary?: boolean }>`
  font-size: 16px;
  line-height: 24px;
  font-weight: ${({ secondary }) => (secondary ? "500" : "normal")};
  color: ${({ secondary }) => (secondary ? "#8082C5" : "#ffffff")};
  cursor: ${({ secondary }) => !secondary ?? "pointer"};
  padding-bottom: 8px;
`;
const Root = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: calc(100% - 32px);
  padding: 56px 16px;
  max-width: 1440px;
  align-items: start;

  @media (min-width: 880px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
`;
const DesktopColumn = styled(Column)`
  display: none;
  @media (min-width: 880px) {
    display: flex;
  }
`;
const Footer: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  return (
    <Wrapper>
      <Root>
        <DesktopColumn>
          <img src={logo} alt="logo" onClick={() => window.open("/")} />
        </DesktopColumn>
        <Column className="mobile">
          <Text secondary>Tools</Text>
          <Text>Puzzle Explorer</Text>
          <Text target="_blank" href="https://t.me/puzzle_swap">
            Notifications bot
          </Text>
          <Text href="https://dxd-team.xyz/puzzle/" target="_blank">
            Charts
          </Text>
        </Column>
        <Column className="mobile">
          <Text secondary>Community</Text>
          <Text target="_blank" href="https://t.me/puzzleswap">
            Telegram
          </Text>
          <Text target="_blank" href="https://twitter.com/puzzle_swap">
            Twitter
          </Text>
          <Text target="_blank" href="https://medium.com/@puzzleswap">
            Medium
          </Text>
        </Column>
        <DesktopColumn>
          <Text
            secondary
            onClick={() => {
              accountStore.address == null
                ? accountStore.setLoginModalOpened(true)
                : accountStore.logout();
            }}
          >
            {accountStore.address == null ? "Login" : "Logout"}
          </Text>
        </DesktopColumn>
        <Text secondary style={{ paddingTop: 40 }}>
          © 2021, All rights reserved
        </Text>
      </Root>
    </Wrapper>
  );
};
export default observer(Footer);
