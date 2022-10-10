import styled from "@emotion/styled";
import React from "react";
import { CircularProgressbar as Bar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface IProps {
  percent: number;
  red?: boolean;
}

const Root = styled.div<{ red?: boolean }>`
  width: 32px;
  height: 32px;

  .CircularProgressbar .CircularProgressbar-trail {
    stroke: ${({ theme, red }) =>
      red ? theme.colors.error100 : theme.colors.primary100};
  }

  .CircularProgressbar .CircularProgressbar-path {
    stroke: ${({ theme, red }) =>
      red ? theme.colors.error500 : theme.colors.blue500};
  }

  .CircularProgressbar .CircularProgressbar-text {
    fill: ${({ theme, red }) =>
      red ? theme.colors.error500 : theme.colors.blue500};
  }

  .CircularProgressbar .CircularProgressbar-text {
    font-size: 25px;
    font-weight: 500;
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
