import RCSlider from "rc-slider";
import React from "react";
import { SliderProps } from "rc-slider/lib/Slider";
import styled from "@emotion/styled";

const Root = styled.div`
  .rc-slider-dot {
    border: 3px solid #f1f2fe;
    background-color: #f1f2fe;
  }
  .rc-slider-mark-text {
    display: none;
  }
`;

const Slider: React.FC<SliderProps> = (props) => {
  return (
    <Root>
      <RCSlider
        dotStyle={{ border: "3px solid #F1F2FE", backgroundColor: "#F1F2FE" }}
        trackStyle={{ backgroundColor: "#7075E9" }}
        activeDotStyle={{ backgroundColor: "#7075E9", borderColor: "#7075E9" }}
        railStyle={{ backgroundColor: "#F1F2FE" }}
        handleStyle={{
          border: "3px solid #7075E9",
          boxShadow: "0px 4px 16px rgba(112, 117, 233, 0.32)",
          width: 16,
          height: 16,
          marginTop: -6
        }}
        {...props}
      />
    </Root>
  );
};
export default Slider;
