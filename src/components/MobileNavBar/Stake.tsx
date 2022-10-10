import React from "react";
import { useTheme } from "@emotion/react";

interface IProps extends React.SVGProps<SVGSVGElement> {
  active?: boolean;
}

const Compass: React.FC<IProps> = ({ active }) => {
  const theme = useTheme();
  return (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.6001 2L2.6001 7L12.6001 12L22.6001 7L12.6001 2Z"
        stroke={active ? theme.colors.blue500 : theme.colors.primary300}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.6001 17L12.6001 22L22.6001 17"
        stroke={active ? theme.colors.blue500 : theme.colors.primary300}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.6001 12L12.6001 17L22.6001 12"
        stroke={active ? theme.colors.blue500 : theme.colors.primary300}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default Compass;
