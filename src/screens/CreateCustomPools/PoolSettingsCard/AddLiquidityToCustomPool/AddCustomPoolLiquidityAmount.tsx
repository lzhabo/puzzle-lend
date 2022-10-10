import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import { useCreateCustomPoolsVM } from "@screens/CreateCustomPools/CreateCustomPoolsVm";
import { observer } from "mobx-react-lite";
import Slider from "@components/Slider";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const AddCustomPoolLiquidityAmount: React.FC<IProps> = () => {
  const vm = useCreateCustomPoolsVM();
  return (
    <Root>
      <Text style={{ width: "100%" }} weight={500} type="secondary">
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
          {vm.totalAmountToAddLiquidity && (
            <span style={{ color: "#8082C5" }}>{`($${vm.maxToProvide
              .times(vm.providedPercentOfPool)
              .div(100)
              .toFormat(2)})`}</span>
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
export default observer(AddCustomPoolLiquidityAmount);
