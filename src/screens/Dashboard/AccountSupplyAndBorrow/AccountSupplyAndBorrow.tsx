import styled from "@emotion/styled";
import React from "react";
import useWindowSize from "@src/hooks/useWindowSize";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const AccountSupplyAndBorrow: React.FC<IProps> = () => {
  const { width } = useWindowSize();
  return <Root></Root>;
};
export default AccountSupplyAndBorrow;
