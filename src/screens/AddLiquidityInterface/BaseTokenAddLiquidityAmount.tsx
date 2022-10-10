import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import { observer } from "mobx-react-lite";
import { useAddLiquidityInterfaceVM } from "@screens/AddLiquidityInterface/AddLiquidityInterfaceVM";
import { useStores } from "@stores";
import Button from "@components/Button";
import Notification from "@components/Notification";
import { Link } from "react-router-dom";
import buildBuyTokenRoute from "@src/utils/buildBuyTokenRoute";
import TokenInput from "@components/TokenInput";
import Loading from "@components/Loading";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const BaseTokenAddLiquidityAmount: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const vm = useAddLiquidityInterfaceVM();
  const buyBaseTokenRoute = buildBuyTokenRoute("trade", vm.baseToken.assetId);

  const handleCallDepositBaseToken = async () => {
    const slippagePercent = vm.baseTokenSlippage;
    vm.setNotificationParams(null);
    if (slippagePercent.times(100).gte(3)) {
      vm.showHighSlippageWarning();
    } else {
      await vm.depositBaseToken();
    }
  };

  return (
    <Root>
      <Text weight={500} type="secondary">
        Amount
      </Text>
      <SizedBox height={8} />
      <Card>
        <TokenInput
          selectable={false}
          decimals={vm.baseToken.decimals}
          amount={vm.baseTokenAmount}
          setAmount={vm.setBaseTokenAmount}
          assetId={vm.baseToken.assetId}
          balances={vm.balances ?? []}
          onMaxClick={vm.onMaxBaseTokenClick}
          usdnEquivalent={vm.baseTokenAmountUsdnEquivalent}
        />
        <SizedBox height={24} />
        {vm.baseTokenBalance && vm.baseTokenBalance.balance?.lt(0.0001) ? (
          <Notification
            type="warning"
            text={
              <div>
                Your {vm.baseToken.symbol} balance is too low to deposit.{" "}
                <Link to={buyBaseTokenRoute}>Buy {vm.baseToken.symbol}</Link> to
                deposit.
              </div>
            }
          />
        ) : (
          <Notification
            type="info"
            text={`Your ${vm.baseToken.symbol} will be automatically converted to other pool
        tokens and provided as liquidity. Please pay attention that value of
        your deposit can be different from value of tokens provided because of
        slippage. We do not recommend to use this method for bigger amounts.`}
          />
        )}
      </Card>
      <SizedBox height={24} />
      {accountStore.address == null && (
        <Button fixed onClick={() => accountStore.setLoginModalOpened(true)}>
          Connect to deposit
        </Button>
      )}
      {accountStore.address != null &&
        (!vm.loading ? (
          <Button
            fixed
            onClick={handleCallDepositBaseToken}
            disabled={!vm.canDepositBaseToken}
          >
            Deposit
          </Button>
        ) : (
          <Button disabled fixed>
            Transaction in progress <Loading />
          </Button>
        ))}
    </Root>
  );
};
export default observer(BaseTokenAddLiquidityAmount);
