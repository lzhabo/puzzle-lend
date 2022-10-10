import React from "react";
import Notification from "@components/Notification";
import { Link } from "react-router-dom";
import buildBuyTokenRoute from "@src/utils/buildBuyTokenRoute";
import { observer } from "mobx-react-lite";
import { useAddLiquidityInterfaceVM } from "@screens/AddLiquidityInterface/AddLiquidityInterfaceVM";
import BN from "@src/utils/BN";
import Text from "@components/Text";

interface IProps {}

const MultipleTokensNotifications: React.FC<IProps> = () => {
  const vm = useAddLiquidityInterfaceVM();
  const minBalanceAsset = vm.minBalanceAsset;
  const minBalance = minBalanceAsset?.balance ?? new BN(1);
  const addOneTokenRoute = `/pools/${vm.poolDomain}/addOneToken`;
  return (
    <>
      {vm.providedPercentOfPool.eq(100)! && !minBalance.eq(0) && (
        <Notification
          type="info"
          text={`You’ve reached the limit with ${minBalanceAsset?.symbol}.`}
          style={{ margin: 24 }}
        />
      )}
      {vm.minBalanceAsset &&
        minBalance.eq(0) &&
        (vm.zeroAssetBalances != null && vm.zeroAssetBalances >= 2 ? (
          <Notification
            type="warning"
            text={
              <Text size="medium">
                You must have all assets to bring liquidity to the pool. Top up
                empty balances or&nbsp;
                <Link to={addOneTokenRoute}>
                  provide liquidity with an {vm.baseToken.symbol} token.
                </Link>
              </Text>
            }
            style={{ margin: 24 }}
          />
        ) : (
          <Notification
            type="warning"
            text={
              <Text size="medium">
                You’ve reached the limit with {vm.minBalanceAsset?.symbol}
                .&nbsp;
                <Link
                  to={buildBuyTokenRoute(
                    `pools/${vm.poolDomain}`,
                    vm.minBalanceAsset!.assetId
                  )}
                >
                  &nbsp;Buy {vm.minBalanceAsset?.symbol}&nbsp;
                </Link>
                to deposit to this pool.
              </Text>
            }
            style={{ margin: 24 }}
          />
        ))}
    </>
  );
};
export default observer(MultipleTokensNotifications);
