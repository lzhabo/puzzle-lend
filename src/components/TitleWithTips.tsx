import React from "react";
import { Row } from "@components/Flex";
import Text from "@components/Text";
import Tooltip from "@components/Tooltip";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";

interface IProps {
  title: string;
  description: string;
}

const TitleWithTips: React.FC<IProps> = ({ description, title }) => {
  return (
    <Row alignItems="center">
      <Text weight={500} type="secondary" style={{ width: "fit-content" }}>
        {title}
      </Text>
      <Tooltip
        containerStyles={{ display: "flex", alignItems: "center" }}
        content={<Text>{description}</Text>}
      >
        <InfoIcon style={{ marginLeft: 8 }} />
      </Tooltip>
    </Row>
  );
};
export default TitleWithTips;
