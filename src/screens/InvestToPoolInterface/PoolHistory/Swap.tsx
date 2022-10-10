import styled from "@emotion/styled";
import React from "react";
import swap from "@src/assets/icons/swapTransaction.svg";
import arrow from "@src/assets/icons/blackRightArrow.svg";
import SizedBox from "@components/SizedBox";
import { IToken, ROUTES } from "@src/constants";
import BN from "@src/utils/BN";
import Img from "@src/components/Img";
import TokenTag from "@screens/InvestToPoolInterface/PoolHistory/TokenTag";
import { Link } from "react-router-dom";

interface IProps {
  token0?: IToken;
  amount0: BN;
  token1?: IToken;
  amount1: BN;
  disableIcon?: boolean;
  hideZeros?: boolean;
}

const Root = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  //justify-content: center;
`;

const Swap: React.FC<IProps> = ({
  token0,
  amount0,
  token1,
  amount1,
  disableIcon,
  hideZeros,
}) => {
  return (
    <Root>
      {!disableIcon && (
        <>
          <Img src={swap} alt="swap" />
          <SizedBox width={12} />
        </>
      )}
      {token0 && (
        <Link to={ROUTES.EXPLORE_TOKEN.replace(":assetId", token0.assetId)}>
          <TokenTag
            token={token0}
            amount={amount0.eq(0) && hideZeros ? undefined : amount0}
          />
        </Link>
      )}
      <SizedBox width={12} />
      <Img width="16px" height="16px" src={arrow} alt="arrow" />
      <SizedBox width={12} />
      {token1 && (
        <Link to={ROUTES.EXPLORE_TOKEN.replace(":assetId", token1.assetId)}>
          <TokenTag
            token={token1}
            amount={amount1.eq(0) && hideZeros ? undefined : amount1}
          />
        </Link>
      )}
    </Root>
  );
};
export default Swap;
