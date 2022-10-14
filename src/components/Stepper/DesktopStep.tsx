import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import Text from "@components/Text";
import SizedBox from "../SizedBox";

export type TStep = "previous" | "current" | "next";

interface IProps extends HTMLAttributes<HTMLDivElement> {
  index: number;
  title: string;
  state: TStep;
  disabled?: boolean;
}

const Root = styled.div<{ disabled?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
`;

const IconContainer = styled.div<{ state: TStep }>`
  display: flex;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  transition: 0.4s;
  position: relative;
  background: ${({ state, theme }) =>
    state === "current" ? theme.colors.blue500 : theme.colors.primary100};

  ${({ state, theme }) =>
    state === "previous" ? `background: ${theme.colors.primary300}` : ""}
  & > div {
    color: ${({ state, theme }) =>
      state === "current" ? theme.colors.white : theme.colors.blue500};
    ${({ state, theme }) =>
      state === "previous" ? `color: ${theme.colors.primary300};` : ""}
  }

  ::after {
    transition: 0.4s;
    opacity: ${({ state }) => (state === "previous" ? 1 : 0)};
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 4px;
    bottom: 0;
    left: 0;
    right: 0;
    ${({ theme }) => `content: url(${theme.images.icons.done})`}
`;

const TextContainer = styled(Text)<{ state: TStep }>`
  font-weight: ${({ state }) => (state === "current" ? 500 : 400)};
  color: ${({ state, theme }) =>
    state === "next" ? theme.colors.primary650 : theme.colors.primary800};
`;
const DesktopStep: React.FC<IProps> = ({
  index,
  state,
  title,
  onClick,
  disabled,
  ...rest
}) => {
  return (
    <Root
      onClick={!disabled ? onClick : undefined}
      {...rest}
      disabled={disabled}
    >
      <IconContainer state={state}>
        <Text fitContent size="small">
          {index + 1}
        </Text>
      </IconContainer>
      <SizedBox width={8} />
      <TextContainer {...{ state, size: "medium" }} nowrap>
        {title}
      </TextContainer>
    </Root>
  );
};
export default DesktopStep;
