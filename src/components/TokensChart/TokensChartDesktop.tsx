import styled from "@emotion/styled";
import React from "react";
import Card from "@components/Card";
import { Row } from "@components/Flex";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";
import useCollapse from "react-collapsed";
import SizedBox from "@components/SizedBox";
import ChartAgeButtons from "@components/ChartAgeButtons";
import { IToken } from "@src/constants";
import TokensChart from "@components/TokensChart/TokensChart";
import {
  TokenChartVMProvider,
  useTokenChartVM,
} from "@components/TokensChart/TokenChartVM";
import LearnMoreTokenChartButtons from "@components/TokensChart/LearnMoreTokenChartButtons";
import MyOrders from "@screens/TradeInterface/Trade/LimitOrders/MyOrders";
import { useSwapVM } from "@screens/TradeInterface/SwapVM";

interface IProps {
  token0: IToken;
  token1: IToken;
  visible: boolean;
  height: number;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 660px;
  box-sizing: border-box;
  padding: 0 8px 0 16px;

  .icon {
    cursor: pointer;
    transition: 0.4s;
  }

  .age-btns {
    max-width: 296px;
  }
`;

const TokensChartDesktopImpl: React.FC<IProps> = observer(
  ({ height, ...rest }) => {
    const { getCollapseProps } = useCollapse({
      isExpanded: rest.visible,
      duration: 500,
    });
    const vm = useTokenChartVM();
    const swapVm = useSwapVM();
    return (
      <Root {...getCollapseProps()}>
        <Card style={{ height }}>
          <Row alignItems="center" justifyContent="space-between">
            <Row alignItems="center">
              <Text
                weight={500}
                fitContent
              >{`${rest.token0.symbol}/${rest.token1.symbol}`}</Text>
              <SizedBox width={8} />
            </Row>
            <ChartAgeButtons
              className="age-btns"
              value={vm.selectedChartPeriod}
              onChange={vm.setSelectedChartPeriod}
            />
          </Row>
          <TokensChart {...rest} />
        </Card>
        <SizedBox height={16} />
        <LearnMoreTokenChartButtons />
        <SizedBox height={40} />
        {swapVm.activeAction === 1 && <MyOrders />}
      </Root>
    );
  }
);

const TokensChartDesktop: React.FC<IProps> = (props) => (
  <TokenChartVMProvider
    assetId0={props.token0.assetId}
    assetId1={props.token1.assetId}
  >
    <TokensChartDesktopImpl {...props} />
  </TokenChartVMProvider>
);

export default TokensChartDesktop;
