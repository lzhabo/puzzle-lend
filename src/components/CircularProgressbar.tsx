import styled from "@emotion/styled";
import React from "react";
import { CircularProgressbar as Bar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface IProps {
  percent: number;
  red?: boolean;
}

const Root = styled.div<{ red?: boolean }>`
  width: 100px;
  height: 100px;

  .CircularProgressbar .CircularProgressbar-trail {
    stroke: ${({ theme, red }) =>
      red ? theme.colors.error100 : theme.colors.primary100};
  }

  .CircularProgressbar .CircularProgressbar-path {
    stroke: ${({ theme, red }) =>
      red ? theme.colors.error500 : theme.colors.success500};
  }

  .CircularProgressbar .CircularProgressbar-text {
    fill: ${({ theme, red }) =>
      red ? theme.colors.error500 : theme.colors.success500};
  }

  .CircularProgressbar .CircularProgressbar-text {
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    fill: ${({ theme }) => theme.colors.primary800};
  }
`;

const CircularProgressbar: React.FC<IProps> = ({ percent, red }) => {
  return (
    <Root red={red}>
      <Bar value={percent} text={`${percent}%`} />
    </Root>
  );
};
export default CircularProgressbar;
