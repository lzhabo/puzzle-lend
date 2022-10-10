import styled from "@emotion/styled";

const FilledText = styled.div<{
  alignItems?:
    | "start"
    | "end"
    | "center"
    | "inherit"
    | "unset"
    | "flex-end"
    | "flex-start"
    | "baseline";
  justifyContent?:
    | "start"
    | "flex-end"
    | "space-around"
    | "space-between"
    | "center";
}>`
  display: flex;
  align-items: ${({ alignItems }) => alignItems ?? "center"};
  justify-content: ${({ justifyContent }) => justifyContent ?? "center"};
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colors.primary800};
  background: ${({ theme }) => theme.colors.primary100};
  border-radius: 6px;
  padding: 4px 9px;
  white-space: nowrap;

  b {
    font-weight: normal;
    font-size: 12px;
    line-height: 16px;
    color: ${({ theme }) => theme.colors.primary650};
  }
`;

export default FilledText;
