import styled from "@emotion/styled";
import React from "react";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const AccountSupplyAndBorrow: React.FC<IProps> = () => {
  // const { width } = useWindowSize();
  return <Root>AccountSupplyAndBorrow</Root>;
};
export default AccountSupplyAndBorrow;
