import styled from "@emotion/styled";

interface IProps {
  type?: "primary" | "default";
  background?: string;
}

const Tag = styled.div<IProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  height: 24px;
  padding: 0 8px;
  box-sizing: border-box;
  font-size: 12px;
  line-height: 16px;
  color: ${({ type, theme }) =>
    type === "primary" ? theme.colors.white : theme.colors.primary800};
  background: ${({ type, background, theme }) =>
    type === "primary"
      ? theme.colors.blue500
      : background ?? theme.colors.primary100};
  max-width: fit-content;
  border: none;
`;

export default Tag;
