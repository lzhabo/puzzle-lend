import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react-lite";
import AccountSupplyTable from "./AccountSupplyTable";
import AccountBorrowTable from "./AccountBorrowTable";
import { SupplyAndBorrowVMProvider } from "./SupplyAndBorrowVM";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const DesktopAccountSupplyAndBorrowImpl: React.FC<IProps> = () => {
  return (
    <Root>
      <AccountSupplyTable />
      <AccountBorrowTable />
    </Root>
  );
};

const DesktopAccountSupplyAndBorrow: React.FC = () => {
  return (
    <SupplyAndBorrowVMProvider>
      <DesktopAccountSupplyAndBorrowImpl />
    </SupplyAndBorrowVMProvider>
  );
};

export default observer(DesktopAccountSupplyAndBorrow);
