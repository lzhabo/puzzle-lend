import styled from "@emotion/styled";
import React from "react";
import SquareTokenIcon from "@components/SquareTokenIcon";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react-lite";
import Route from "./Route";
import Img from "@components/Img";
import { useTheme } from "@emotion/react";
import { useSwapVM } from "@screens/TradeInterface/SwapVM";

interface IProps {}

const Root = styled.div`
  display: flex;
  align-items: center;
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;

  ::-webkit-scrollbar {
    display: none;
  }
`;
const RoutesContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;
const RoutingSchema: React.FC<IProps> = () => {
  const vm = useSwapVM();
  const theme = useTheme();
  const values = vm.schemaValues;
  const isAmount0Empty = vm.amount0.eq(0);
  return (
    <Root>
      <RoutesContainer>
        {values?.map((i, index, array) => (
          <Route
            {...i}
            key={`${i.percent.toString()}-${index}`}
            token0Logo={vm.token0.logo}
            isAmount0Empty={isAmount0Empty}
            isSingleRoute={array.length === 1}
          />
        ))}
      </RoutesContainer>
      {values?.length !== 1 && <SizedBox width={12} />}
      <SizedBox width={12} />
      <div style={{ position: "relative" }}>
        {values?.length !== 1 && (
          <Img
            height="100%"
            src={theme.images.icons.rightArrow}
            style={{ position: "absolute", left: "-32px" }}
          />
        )}
        <SquareTokenIcon src={vm.token1.logo} size="small" />
      </div>
    </Root>
  );
};
export default observer(RoutingSchema);
