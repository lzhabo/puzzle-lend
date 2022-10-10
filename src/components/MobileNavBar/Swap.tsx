import React from "react";
import { useTheme } from "@emotion/react";

interface IProps extends React.SVGProps<SVGSVGElement> {
  active?: boolean;
}

const Swap: React.FC<IProps> = ({ active }) => {
  const theme = useTheme();
  return (
    <svg
      width="66"
      height="48"
      viewBox="0 0 66 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="9"
        width="48"
        height="48"
        rx="24"
        fill={active ? theme.colors.primary800 : theme.colors.blue500}
      />
      <path
        d="M39.439 18.3003C38.3588 17.0777 36.9193 16.1485 35.2254 15.6947C30.6384 14.4656 25.9236 17.1877 24.6945 21.7747C24.2892 23.2874 24.3136 24.8141 24.6929 26.2251M39.439 18.3003L34.1127 19.8474M39.439 18.3003L38.1363 13.1365M26.5646 29.7041C27.6444 30.9246 29.0826 31.8522 30.7745 32.3055C35.3615 33.5346 40.0763 30.8125 41.3054 26.2255C41.7108 24.7128 41.6864 23.1861 41.307 21.7751M26.5646 29.7041L31.8873 28.1528M26.5646 29.7041L27.8636 34.8637"
        stroke={theme.colors.white}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default Swap;
