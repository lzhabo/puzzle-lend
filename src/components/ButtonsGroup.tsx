import styled from "@emotion/styled";
import React from "react";

interface IProps {
  values: string[];
  active: number;
  onClick: (v: number) => void;
}

const Root = styled.div`
  display: flex;
`;
const Btn = styled.div<{ active?: boolean }>`
  background: ${({ active, theme }) =>
    active ? theme.colors.blue500 : theme.colors.white};
  color: ${({ active, theme }) =>
    active ? theme.colors.white : theme.colors.primary800};
  border: 1px solid ${({ theme }) => theme.colors.primary100};

  border-radius: 6px;
  flex: none;
  order: 1;
  flex-grow: 0;
  padding: 6px 12px;
  margin-right: 8px;
  cursor: pointer;
`;

const ButtonsGroup: React.FC<IProps> = ({ values, active, onClick }) => {
  return (
    <Root>
      {values.map((v, index) => (
        <Btn
          key={index}
          onClick={() => onClick(index)}
          active={active === index}
        >
          {v}
        </Btn>
      ))}
    </Root>
  );
};
export default ButtonsGroup;
