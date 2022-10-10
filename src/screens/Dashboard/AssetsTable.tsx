import React from "react";
import styled from "@emotion/styled";
import Text from "@src/components/Text";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const AssetsTable: React.FC<IProps> = () => {
  return (
    <Root>
      <Text type="secondary">All assets</Text>
    </Root>
  );
};
export default AssetsTable;
