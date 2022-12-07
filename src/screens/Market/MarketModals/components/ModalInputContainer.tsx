import styled from "@emotion/styled";

const ModalInputContainer = styled.div<{
  focused?: boolean;
  error?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
}>`
  position: relative;
  background: ${({ focused, theme }) =>
    focused ? theme.colors.white : theme.colors.primary100};
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px;
  height: 56px;
  border-radius: 12px;
  width: 100%;
  cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};
  box-sizing: border-box;

  input {
    cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};
  }

  border: 1px solid
    ${({ focused, readOnly, theme }) =>
      focused && !readOnly ? theme.colors.blue500 : theme.colors.primary100};

  :hover {
    border-color: ${({ readOnly, focused, theme }) =>
      !readOnly && !focused
        ? theme.colors.primary650
        : focused ?? theme.colors.blue500};
  }

  .swap {
    stroke: ${({ theme }) => theme.colors.primary800};

    path {
      fill: ${({ theme }) => theme.colors.primary800};
    }
  }
`;
export default ModalInputContainer;
