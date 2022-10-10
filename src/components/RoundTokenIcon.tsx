import styled from "@emotion/styled";

const RoundTokenIcon = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  box-sizing: border-box;
`;
export default RoundTokenIcon;
