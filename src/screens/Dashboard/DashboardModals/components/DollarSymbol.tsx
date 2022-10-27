import styled from "@emotion/styled";

interface IProps {}

const Dollar = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  font-size: 18px;
  left: 67px;
  top: 50%;
  color: ${({ theme }) => theme.colors.primary800};
  transform: translateY(-50%);
`;

const DollarSymbol: React.FC<IProps> = () => <Dollar>$</Dollar>;

export default DollarSymbol;
