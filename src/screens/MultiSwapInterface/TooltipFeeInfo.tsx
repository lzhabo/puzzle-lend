import React from "react";
import { Column } from "@components/Flex";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import { useMultiSwapVM } from "@screens/MultiSwapInterface/MultiSwapVM";

const TooltipFeeInfo: React.FC = () => {
  const vm = useMultiSwapVM();
  const token1 = vm.token1!;
  const amount = BN.formatUnits(vm.amount1, token1.decimals);
  return (
    <Column>
      <Text>
        Protocol fee:&nbsp;
        <span style={{ color: "#8082C5" }}>
          {amount
            .times(0.4)
            .times(vm.pool.swapFee * 0.01)
            .toFormat(2)}{" "}
          {token1.symbol}
        </span>
      </Text>
      <Text>
        Minimum to receive:{" "}
        <span style={{ color: "#8082C5" }}>
          ~ {BN.formatUnits(vm.minimumToReceive, token1.decimals).toFormat(2)}{" "}
          {token1.symbol}
        </span>
      </Text>
      <Text>
        LP fee:{" "}
        <span style={{ color: "#8082C5" }}>
          {amount
            .times(0.6)
            .times(vm.pool.swapFee * 0.01)
            .toFormat(2)}{" "}
          {token1.symbol}
        </span>
      </Text>
    </Column>
  );
};
export default observer(TooltipFeeInfo);
