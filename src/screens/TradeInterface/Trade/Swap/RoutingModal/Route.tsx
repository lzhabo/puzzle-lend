import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import Asset from "./Asset";
import Token0Amount from "./Token0Amount";
import Img from "@components/Img";
import { useTheme } from "@emotion/react";
import { ISchemaRoute } from "@screens/TradeInterface/SwapVM";

interface IProps extends ISchemaRoute, HTMLAttributes<HTMLDivElement> {
  token0Logo: string;
  isAmount0Empty?: boolean;
  isSingleRoute?: boolean;
}

const Root = styled.div`
  display: flex;
  flex-direction: row;
  padding: 12px 0;
`;

const Route: React.FC<IProps> = ({
  percent,
  token0Logo,
  exchanges,
  isAmount0Empty,
  isSingleRoute,
}) => {
  const theme = useTheme();
  const per = percent.isInteger() ? percent.toFormat(0) : percent.toFormat(2);
  return (
    <Root>
      <Token0Amount
        percent={per}
        imgSrc={token0Logo}
        displayPercent={!isAmount0Empty}
      />
      {exchanges.map((item, index, array) => (
        <React.Fragment key={index}>
          <Asset {...item} key={index} />
          {array.length - 1 !== index && (
            <div style={{ position: "relative" }}>
              <Img
                height="100%"
                src={theme.images.icons.rightArrow}
                style={{ position: "absolute", right: "-8px" }}
              />
            </div>
          )}
          {isSingleRoute && (
            <div style={{ position: "relative" }}>
              <Img
                height="100%"
                src={theme.images.icons.rightArrow}
                style={{ position: "absolute", right: "-8px" }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </Root>
  );
};
export default Route;
