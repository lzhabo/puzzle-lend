import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import { CircularProgressbar as Bar } from "react-circular-progressbar";
import Text from "@components/Text";
import "react-circular-progressbar/dist/styles.css";

interface IProps extends HTMLAttributes<HTMLDivElement> {
  percent: number;
  text: string;
}

const HealthTextWrap = styled(Text)`
  width: 65px;
  text-align: center;
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
`;

const Root = styled.div`
  width: 120px;
  height: 120px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 50%;

  .CircularProgressbar .CircularProgressbar-trail {
    stroke: ${({ theme }) => theme.colors.primary100};
    stroke-width: 3px;
  }

  .CircularProgressbar .CircularProgressbar-path {
    stroke-width: 3px;
    stroke: ${({ theme }) => theme.colors.success500};
  }

  .CircularProgressbar .CircularProgressbar-text {
    fill: ${({ theme }) => theme.colors.success500};
  }

  .CircularProgressbar .CircularProgressbar-text {
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    fill: ${({ theme }) => theme.colors.primary800};
    baseline-shift: 15px;
  }

  .CircularProgressbar.CircularProgressbar-inverted .CircularProgressbar-trail {
    stroke: ${({ theme }) => theme.colors.white};
  }
`;

const CircularProgressbar: React.FC<IProps> = ({ percent, text, ...rest }) => {
  return (
    <Root {...rest}>
      <HealthTextWrap>
        <Text>{text}</Text>
      </HealthTextWrap>
      <Bar value={percent} text={`${percent}%`}>
        {text}
      </Bar>
    </Root>
  );
};
export default CircularProgressbar;
