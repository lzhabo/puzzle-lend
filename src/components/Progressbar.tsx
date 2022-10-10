import styled from "@emotion/styled";
import React from "react";

interface IProps {
  percent: number;
  red?: boolean;
}

const Root = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.primary100};
  border-radius: 4px;

  .progress {
    border-radius: 4px;
    height: 8px;
    background: ${({ theme }) => theme.colors.blue500};
  }
`;

const Progressbar: React.FC<IProps> = ({ percent }) => {
  return (
    <Root>
      <div className="progress" style={{ width: `${percent}%` }} />
    </Root>
  );
};
export default Progressbar;
