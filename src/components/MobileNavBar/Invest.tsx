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
      <g clipPath="url(#clip0_518_1048)">
        <path
          d="M23.4001 6L13.9001 15.5L8.90015 10.5L1.40015 18"
          stroke={active ? theme.colors.blue500 : theme.colors.primary300}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.4001 6H23.4001V12"
          stroke={active ? theme.colors.blue500 : theme.colors.primary300}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_518_1048">
          <rect
            width="24"
            height="24"
            fill="white"
            transform="translate(0.400146)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
export default Compass;
