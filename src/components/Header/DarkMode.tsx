import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import moon from "@src/assets/icons/moon.svg";
import Img from "@components/Img";
import Text from "@components/Text";
import Switch from "@components/Switch";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import { THEME_TYPE } from "@src/themes/ThemeProvider";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

const Root = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.primary50};
  border-radius: 12px;
  padding: 12px;
  gap: 11px;
  align-items: center;
`;

const DarkMode: React.FC<IProps> = ({ ...rest }) => {
  const { accountStore } = useStores();
  return (
    <Root {...rest}>
      <Img src={moon} />
      <Text>Dark mode</Text>
      <Switch
        onChange={() => accountStore.toggleTheme()}
        value={accountStore.selectedTheme === THEME_TYPE.DARK_THEME}
      />
    </Root>
  );
};
export default observer(DarkMode);
