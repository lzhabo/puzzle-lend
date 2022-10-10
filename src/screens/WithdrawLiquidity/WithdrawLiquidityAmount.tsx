import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import Slider from "@components/Slider";
import { useWithdrawLiquidityVM } from "./WithdrawLiquidityVM";
import { observer } from "mobx-react-lite";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const WithdrawLiquidityAmount: React.FC<IProps> = () => {
  const vm = useWithdrawLiquidityVM();
  return (
    <Root>
      <Text weight={500} type="secondary">
        Amount
      </Text>
      <SizedBox height={8} />
      <Card>
        <Text type="primary" size="large" style={{ textAlign: "center" }}>
          {`${vm.percentToWithdraw}% `}
          {vm.totalAmountToWithdrawDisplay && (
            <span
              style={{ color: "#8082C5" }}
            >{`(${vm.totalAmountToWithdrawDisplay})`}</span>
          )}
        </Text>
        <SizedBox height={16} />
        <Slider
          min={0}
          max={100}
          step={1}
          marks={{ 0: 0, 25: 25, 50: 50, 75: 75, 100: 100 }}
          value={vm.percentToWithdraw.toNumber()}
          onChange={vm.setPercentToWithdraw}
        />
      </Card>
    </Root>
  );
};
export default observer(WithdrawLiquidityAmount);
