import React from "react";
import { useTheme } from "@emotion/react";

interface IProps extends React.SVGProps<SVGSVGElement> {
  active?: boolean;
  isBorrow?: boolean;
}
//fixme
const Invest: React.FC<IProps> = ({ active, isBorrow }) => {
  const theme = useTheme();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
    >
      <script
        type="text/javascript"
        src="chrome-extension://fnjhmkhhmkbjkkabndcnnogagogbneec/in-page.js"
      />
      <path
        d="M21.4653 14.7882L21.4653 18.7882C21.4653 19.3186 21.2546 19.8273 20.8795 20.2024C20.5045 20.5775 19.9958 20.7882 19.4653 20.7882L5.46533 20.7882C4.9349 20.7882 4.42619 20.5775 4.05112 20.2024C3.67605 19.8273 3.46533 19.3186 3.46533 18.7882L3.46533 14.7882"
        stroke={active ? theme.colors.primary800 : theme.colors.blue500}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {isBorrow ? (
        <path
          d="M17.1318 7.78821L12.1318 2.78821L7.13184 7.78821"
          stroke={active ? theme.colors.primary800 : theme.colors.blue500}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M7.46533 9.78821L12.4653 14.7882L17.4653 9.78821"
          stroke={active ? theme.colors.primary800 : theme.colors.blue500}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      <path
        d="M12.4653 14.7882L12.4653 2.78821"
        stroke={active ? theme.colors.primary800 : theme.colors.blue500}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default Invest;
