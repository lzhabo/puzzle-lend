import styled from "@emotion/styled";
import React from "react";
import noPage from "@src/assets/404.svg";
import Text from "@components/Text";
import { Link } from "react-router-dom";
import { Row } from "@src/components/Flex";
import SizedBox from "@components/SizedBox";
import { ROUTES } from "@src/constants";

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
const paths = [
  { title: "Explore", link: ROUTES.EXPLORE },
  { title: "Trade", link: ROUTES.TRADE },
  { title: "Invest", link: ROUTES.INVEST },
  { title: "Stake", link: ROUTES.STAKE },
];
const Path = styled(Link)`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #7075e9;

  margin-left: 32px;

  &:first-of-type {
    margin-left: 0;
  }
`;
const NotFound: React.FC<IProps> = () => {
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
      <Row justifyContent="center" className="nav-links">
        {paths.map((i, index) => (
          <Path to={i.link} key={index}>
            {i.title}
          </Path>
        ))}
      </Row>
    </Root>
  );
};
export default NotFound;
