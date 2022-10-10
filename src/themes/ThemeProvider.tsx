import React from "react";
import { ThemeProvider } from "@emotion/react";
import { useObserver } from "mobx-react-lite";

import darkTheme from "@src/themes/darkTheme";
import lightTheme from "@src/themes/lightTheme";
import { useStores } from "@stores";

export enum THEME_TYPE {
  LIGHT_THEME = "lightTheme",
  DARK_THEME = "darkTheme",
}

export const themes = {
  darkTheme,
  lightTheme,
};

const ThemeWrapper: React.FC = ({ children }) => {
  const { accountStore } = useStores();
  const selectedTheme = useObserver(() => accountStore.selectedTheme);
  return (
    <ThemeProvider theme={themes[selectedTheme]}>{children}</ThemeProvider>
  );
};

export default ThemeWrapper;
