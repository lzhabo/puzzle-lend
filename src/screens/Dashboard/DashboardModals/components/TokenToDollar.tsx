import styled from "@emotion/styled";

const TokenToDollar = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 5px 8px;
  border-radius: 0 12px 12px 0;
  cursor: pointer;
  transition: background-color 0.2s ease;

  svg {
    width: 24px;
    margin-left: 8px;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary50};
  }
`;

export default TokenToDollar;
