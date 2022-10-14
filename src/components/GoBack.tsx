import styled from "@emotion/styled";
import React from "react";
import { Row } from "@components/Flex";
import arrow from "@src/assets/icons/backArrow.svg";
import SizedBox from "@components/SizedBox";
import { Link } from "react-router-dom";
import Text from "@components/Text";

interface IProps {
  link: string;
  text: string;
}

const Root = styled(Row)`
  cursor: pointer;

  img {
    width: 16px;
    height: 16px;
  }
`;

const GoBack: React.FC<IProps> = ({ link, text }) => {
  return (
    <Root alignItems="center">
      <img src={arrow} alt="back" />
      <SizedBox width={8} />
      <Link to={link}>
        <Text weight={500} type="blue500">
          {text}
        </Text>
      </Link>
    </Root>
  );
};
export default GoBack;
