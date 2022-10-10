import React, { HTMLAttributes } from "react";
import styled from "@emotion/styled";
import { Row } from "@components/Flex";
import { TChartDataRecord } from "@screens/ExploreToken/ExploreTokenVm";

interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: keyof TChartDataRecord;
  onChange: (value: string) => void;
}

const Root = styled(Row)`
  padding: 4px;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.primary100};
  border-radius: 8px;
`;

const ageButtons = [
  { title: "1D", value: "1d" },
  { title: "7D", value: "1w" },
  { title: "1M", value: "1m" },
  { title: "3M", value: "3m" },
  { title: "1Y", value: "1y" },
  { title: "All", value: "all" },
];

const ChartAgeButton = styled.div<{ selected?: boolean }>`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  box-sizing: border-box;
  height: 24px;
  background: ${({ selected, theme }) =>
    selected ? theme.colors.white : "transparent"};
  border-radius: 6px;
  box-shadow: ${({ selected }) =>
    selected ? "0px 8px 24px rgba(54, 56, 112, 0.16)" : "none"};
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  flex: 1;
  color: ${({ selected, theme }) =>
    selected ? theme.colors.blue500 : theme.colors.primary650};
  transition: 0.4s;

  @media (min-width: 880px) {
    margin-top: 0;
  }
`;

const ChartAgeButtons: React.FC<IProps> = ({
  value: selected,
  onChange,
  ...rest
}) => (
  <Root {...rest}>
    {ageButtons.map(({ title, value }) => (
      <ChartAgeButton
        key={value}
        selected={selected === value}
        onClick={() => onChange(value)}
      >
        {title}
      </ChartAgeButton>
    ))}
  </Root>
);

export default ChartAgeButtons;
