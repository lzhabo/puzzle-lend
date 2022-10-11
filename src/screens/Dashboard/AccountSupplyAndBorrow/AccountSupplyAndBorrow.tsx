import styled from "@emotion/styled";
import React from "react";
import useWindowSize from "@src/hooks/useWindowSize";
import MobileAccountSupplyAndBorrow from "./MobileAccountSupplyAndBorrow";
import DesktopAccountSupplyAndBorrow from "./DesktopAccountSupplyAndBorrow";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const AccountSupplyAndBorrow: React.FC<IProps> = () => {
  const { width } = useWindowSize();
  return (
    <Root>
      {width && width >= 1440 ? (
        <DesktopAccountSupplyAndBorrow />
      ) : (
        <MobileAccountSupplyAndBorrow />
      )}
    </Root>
  );
};
export default AccountSupplyAndBorrow;
