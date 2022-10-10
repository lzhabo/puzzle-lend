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
        d="M12.3 22C17.8229 22 22.3 17.5228 22.3 12C22.3 6.47715 17.8229 2 12.3 2C6.7772 2 2.30005 6.47715 2.30005 12C2.30005 17.5228 6.7772 22 12.3 22Z"
        stroke={active ? theme.colors.blue500 : theme.colors.primary300}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5401 7.76001L14.4201 14.12L8.06006 16.24L10.1801 9.88001L16.5401 7.76001Z"
        stroke={active ? theme.colors.blue500 : theme.colors.primary300}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default Compass;
