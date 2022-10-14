import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import dots from "@src/assets/icons/dots.svg";
import Tooltip from "@components/Tooltip";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

const Root = styled.div`
  img {
    width: 24px;
    height: 24px;
  }

  background: #f1f2fe;
  border: 1px solid #f1f2fe;
  box-sizing: border-box;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
`;

const DetailsButton: React.FC<IProps> = ({ children, ...rest }) => {
  return (
    <Tooltip
      config={{ placement: "bottom-end", trigger: "click" }}
      content={<div>{children}</div>}
    >
      <Root {...rest}>
        <img src={dots} alt="dots" />
      </Root>
    </Tooltip>
  );
};
export default DetailsButton;
