import styled from "@emotion/styled";
import React, { useState } from "react";
import Text from "@components/Text";
import { useExploreTokenVM } from "@screens/ExploreToken/ExploreTokenVm";
import SizedBox from "@components/SizedBox";
import TextButton from "@components/TextButton";
import useCollapse from "react-collapsed";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  transition: 0.4s;
  overflow: hidden;
`;
const Gradient = styled.div`
  display: flex;
  bottom: 0;
  left: 0;
  top: 40%;
  width: 100%;
  position: absolute;
  background: ${({ theme }) => theme.colors.tokenDescGradient};
  z-index: 10;
`;
const Body = styled.div`
  position: relative;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #363870;
  white-space: pre-wrap;
`;
const AboutToken: React.FC<IProps> = () => {
  const vm = useExploreTokenVM();
  const [opened, setOpened] = useState(false);
  const { getCollapseProps } = useCollapse({
    isExpanded: opened,
    duration: 500,
  });
  return (
    <Root>
      <SizedBox height={40} />
      <Text weight={500} size="big">
        About {vm.asset.name}
      </Text>
      <SizedBox height={16} />
      <Text
        type="secondary"
        style={{
          whiteSpace: "pre-wrap",
          position: "relative",
        }}
      >
        {vm.tokenLifeData[0]}
        {!opened && <Gradient />}
      </Text>
      <Body {...getCollapseProps()}>
        <Text type="secondary" style={{ whiteSpace: "pre-wrap" }}>
          {vm.tokenLifeData[1]}
        </Text>
        <Text type="secondary" style={{ whiteSpace: "pre-wrap" }}>
          {vm.about != null && vm.about !== "" ? `\n${vm.about}` : ""}
        </Text>
      </Body>
      <SizedBox height={16} />
      <TextButton
        kind="secondary"
        weight={500}
        onClick={() => setOpened(!opened)}
      >
        {!opened ? "Read more..." : "Hide.."}
      </TextButton>
    </Root>
  );
};
export default AboutToken;
