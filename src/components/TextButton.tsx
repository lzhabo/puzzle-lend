import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";

type TButtonType = "primary" | "secondary";
type TButtonSize = "medium" | "large";

interface IProps extends HTMLAttributes<HTMLDivElement> {
  kind?: TButtonType;
  size?: TButtonSize;
  prefix?: string;
  suffix?: string;
  weight?: number;
}

const Root = styled.div<{
  pointer?: boolean;
  kind?: TButtonType;
  size?: TButtonSize;
  weight?: number;
}>`
  ${({ pointer }) => pointer && "cursor: pointer;"};
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 16px;
  line-height: 24px;
  color: ${({ kind }) => (kind === "secondary" ? "#7075E9" : "#ffffff")};
  font-weight: ${({ weight }) => (weight != null ? weight : "400")};
  cursor: pointer;
  white-space: nowrap;
  ${({ size }) =>
    (() => {
      switch (size) {
        case "medium":
          return "font-size: 14px; line-height: 20px;";
        default:
          return "font-size: 16px;  line-height: 24px;";
      }
    })()}
`;
const Icon = styled.img`
  height: 16px;
  width: 16px;
`;
const TextButton: React.FC<IProps> = ({
  suffix,
  prefix,
  children,
  onClick,
  kind,
  weight,
  ...rest
}) => {
  return (
    <Root
      {...rest}
      onClick={() => {
        onClick != null && onClick({} as any);
      }}
      pointer={onClick != null}
      kind={kind}
      weight={weight}
    >
      {suffix && <Icon src={suffix} alt="suffix" style={{ marginRight: 4 }} />}
      <span>{children}</span>
      {prefix && <Icon src={prefix} alt="prefix" style={{ marginLeft: 4 }} />}
    </Root>
  );
};
export default TextButton;
