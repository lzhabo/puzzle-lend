import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import Slider from "@components/Slider";
import { useAddLiquidityInterfaceVM } from "@screens/AddLiquidityInterface/AddLiquidityInterfaceVM";
import { observer } from "mobx-react-lite";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const MultipleTokensAddLiquidityAmount: React.FC<IProps> = () => {
  const vm = useAddLiquidityInterfaceVM();
  return (
    <Root>
      <Text weight={500} type="secondary">
        Amount
      </Text>
      <SizedBox height={8} />
      <Card>
        <Text type="secondary" style={{ textAlign: "center" }} size="medium">
          Select the percentage of your assets
        </Text>
        <SizedBox height={16} />
        <Text type="primary" size="large" style={{ textAlign: "center" }}>
          {`${vm.providedPercentOfPool}% `}
          {vm.totalAmountToDeposit && (
            <span
              style={{ color: "#8082C5" }}
            >{`(${vm.totalAmountToDeposit})`}</span>
          )}
        </Text>
        <SizedBox height={16} />
        <Slider
          min={0}
          max={100}
          step={1}
          marks={{ 0: 0, 25: 25, 50: 50, 75: 75, 100: 100 }}
          value={vm.providedPercentOfPool.toNumber()}
          onChange={vm.setProvidedPercentOfPool}
        />
      </Card>
    </Root>
  );
};
export default observer(MultipleTokensAddLiquidityAmount);
