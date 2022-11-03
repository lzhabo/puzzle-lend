import styled from "@emotion/styled";
import React from "react";
import useWindowSize from "@src/hooks/useWindowSize";
import { observer } from "mobx-react-lite";
import MobileAccountSupplyAndBorrow from "./MobileAccountSupplyAndBorrow";
import DesktopAccountSupplyAndBorrow from "./DesktopAccountSupplyAndBorrow";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const AccountSupplyAndBorrow: React.FC<IProps> = () => {
  const { width } = useWindowSize();
  return (
    <Root>
      {width && width >= 880 ? (
        <DesktopAccountSupplyAndBorrow />
      ) : (
        <MobileAccountSupplyAndBorrow />
      )}
    </Root>
  );
};
export default observer(AccountSupplyAndBorrow);
