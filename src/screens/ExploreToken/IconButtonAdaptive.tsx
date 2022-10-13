import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import React, { HTMLAttributes } from "react";
import useWindowSize from "@src/hooks/useWindowSize";
import styled from "@emotion/styled";

interface IProps extends HTMLAttributes<HTMLDivElement> {
  icon: JSX.Element;
}

const Root = styled.div`
  cursor: pointer;

  path {
    stroke: #7075e9;
  }
`;

const IconButtonAdaptive: React.FC<IProps> = ({ icon, children, ...rest }) => {
  const { width } = useWindowSize();
  return (
    <Root {...rest}>
      {(width ?? 0) >= 880 ? (
        <Button size="medium" kind="secondary">
          {icon}
          <SizedBox width={10} />
          {children}
        </Button>
      ) : (
        icon
      )}
    </Root>
  );
};
export default IconButtonAdaptive;
