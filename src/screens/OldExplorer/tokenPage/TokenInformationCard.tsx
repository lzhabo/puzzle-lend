import styled from "@emotion/styled";
import Card from "@components/Card";
import { Column } from "@components/Flex";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import React from "react";

interface IProps {
  info: string;
}

const Root = styled(Column)`
  width: 100%;
  flex: 1;
`;

const TokenInformationCard: React.FC<IProps> = ({ info }) => {
  return (
    <Root>
      <Text weight={500} type="secondary" style={{ width: "fit-content" }}>
        Token information
      </Text>
      <SizedBox height={8} />
      <Card style={{ height: 320 }}>
        <Text style={{ whiteSpace: "pre-wrap" }} size="medium">
          {info}
        </Text>
      </Card>
    </Root>
  );
};

export default TokenInformationCard;
