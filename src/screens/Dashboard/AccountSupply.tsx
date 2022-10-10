import styled from "@emotion/styled";
import React from "react";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const AccountSupply: React.FC<IProps> = () => {
  return <Root>AccountSupply</Root>;
};
export default AccountSupply;
