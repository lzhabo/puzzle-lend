import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import Text from "@components/Text";

interface IProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
}

const Root = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
`;

const SwapDetailRow: React.FC<IProps> = ({ title, children, ...rest }) => (
  <Root {...rest}>
    <Text type="secondary">{title}</Text>
    {children}
  </Root>
);
export default SwapDetailRow;
