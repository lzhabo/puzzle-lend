import React from "react";
import { ReactComponent as CloseIcon } from "@src/assets/icons/close.svg";
import styled from "@emotion/styled";

interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Root = styled.button`
  width: 100%;
  justify-content: flex-start;

  path {
    fill: #7075e9;
  }
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #7075e9;
  background: transparent;
  height: auto;
  border: none;
  padding: 0;
  :hover {
    color: #7075e9;
    background: transparent;
    border: none;
  }
`;

const ResetAllButton: React.FC<IProps> = ({ ...rest }) => (
  <Root {...rest}>
    <CloseIcon />
    &nbsp; Reset all
  </Root>
);
export default ResetAllButton;
