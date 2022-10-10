import Text from "@components/Text";
import React from "react";
import styled from "@emotion/styled";

const Root = styled(Text)`
  margin: 40px 0;
  text-align: center;
`;

const ExploreFooter = () => (
  <Root
    onClick={() => window.open("https://wavescap.com")}
    type="secondary"
    size="medium"
  >
    Data provided by WavesCap 💙
  </Root>
);

export default ExploreFooter;
