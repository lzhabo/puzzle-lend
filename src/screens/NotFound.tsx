import styled from "@emotion/styled";
import React from "react";
import noPage from "@src/assets/404.svg";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  width: 100%;
`;
const Img = styled.img`
  max-width: 240px;
  height: auto;
  padding-bottom: 44px;
`;
const NotFound: React.FC<IProps> = () => {
  // /todo
  return (
    <Root>
      <Img src={noPage} alt="noPage" />
      <Text fitContent size="large">
        There is no such page
      </Text>
      <Text fitContent type="secondary" size="medium">
        But there are many other useful pages
      </Text>
      <SizedBox height={32} />
    </Root>
  );
};
export default NotFound;
