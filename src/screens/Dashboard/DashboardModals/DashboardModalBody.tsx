import React, { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import styled from "@emotion/styled";
import { Column } from "@src/components/Flex";
import { TPoolStats } from "@src/stores/LendStore";
import { DashboardUseVM } from "@screens/Dashboard/DashboardModals/DashboardModalVM";
import { OPERATIONS_TYPE } from "@src/constants";
import BN from "@src/utils/BN";

import RepayAssets from "@screens/Dashboard/DashboardModals/RepayAssets";
import SupplyAssets from "@screens/Dashboard/DashboardModals/SupplyAssets";
import WithdrawAssets from "@screens/Dashboard//DashboardModals/WithdrawAssets";
import BorrowAssets from "@screens/Dashboard/DashboardModals/BorrowAssets";

type UrlParamsTypes = {
  tokenId?: string;
  modalPoolId?: string;
};

interface IProps {
  urlParams: UrlParamsTypes;
  operationName: OPERATIONS_TYPE;
  step: 0 | 1;
  poolStats: TPoolStats[];
  userAssetsBalance: any[];
}

const Root = styled(Column)`
  width: 100%;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.white};

  & > * {
    width: 100%;
  }
`;

const WalletModalBody: React.FC<IProps> = ({
  step,
  operationName,
  poolStats,
  urlParams,
  userAssetsBalance
}) => {
  const vm = DashboardUseVM();
  const [choosenToken, setChoosenToken] = useState<TPoolStats>();

  const getTokenBalance: any = () => {
    const getAssetData = userAssetsBalance.find(
      (tokenData) => tokenData.assetId === urlParams.tokenId
    );

    return getAssetData?.balance;
  };

  const triggerMaxClickFunc = (amount: BN) => {
    const getAssetData = userAssetsBalance.find(
      (tokenData) => tokenData.assetId === urlParams.tokenId
    );

    if (getAssetData) vm.setModalAmount(amount || getAssetData.balance!);
  };

  useMemo(() => {
    const token = poolStats.find((_) => _.assetId === urlParams.tokenId);

    setChoosenToken(token!);
  }, [poolStats, urlParams]);

  return (
    <Root>
      {step === 0 && operationName === OPERATIONS_TYPE.SUPPLY && (
        <SupplyAssets
          token={choosenToken!}
          poolId={urlParams?.modalPoolId || vm.currentPoolId}
          userBalance={getTokenBalance()}
          modalAmount={vm.modalAmount}
          modalSetAmount={vm.setModalAmount}
          onMaxClick={triggerMaxClickFunc}
          onSubmit={vm.submitSupply}
        />
      )}
      {step === 1 && operationName === OPERATIONS_TYPE.WITHDRAW && (
        <WithdrawAssets
          poolStats={poolStats}
          token={choosenToken!}
          poolId={urlParams?.modalPoolId || vm.currentPoolId}
          userBalance={getTokenBalance()}
          modalAmount={vm.modalAmount}
          modalSetAmount={vm.setModalAmount}
          onMaxClick={triggerMaxClickFunc}
          onSubmit={vm.submitWithdraw}
        />
      )}
      {step === 0 && operationName === OPERATIONS_TYPE.BORROW && (
        <BorrowAssets
          poolStats={poolStats}
          token={choosenToken!}
          poolId={urlParams?.modalPoolId || vm.currentPoolId}
          userHealth={vm.userHealth}
          userCollateral={vm.userCollateral}
          modalAmount={vm.modalAmount}
          modalSetAmount={vm.setModalAmount}
          onMaxClick={triggerMaxClickFunc}
          onSubmit={vm.submitBorrow}
        />
      )}
      {step === 1 && operationName === OPERATIONS_TYPE.REPAY && (
        <RepayAssets
          token={choosenToken!}
          poolId={urlParams?.modalPoolId || vm.currentPoolId}
          userBalance={getTokenBalance()}
          modalAmount={vm.modalAmount}
          modalSetAmount={vm.setModalAmount}
          onMaxClick={triggerMaxClickFunc}
          onSubmit={vm.submitRepay}
        />
      )}
    </Root>
  );
};
export default observer(WalletModalBody);
