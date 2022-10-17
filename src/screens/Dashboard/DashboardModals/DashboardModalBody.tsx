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

const DashboardModalBody: React.FC<IProps> = ({
  operationName,
  poolStats,
  urlParams,
  userAssetsBalance
}) => {
  const vm = DashboardUseVM();
  const [choosenToken, setChoosenToken] = useState<TPoolStats>();

  // const getTokenBalance: any = () => {
  //   const getAssetData = userAssetsBalance.find(
  //     (tokenData) => tokenData.assetId === urlParams.tokenId
  //   );
  //
  //   return getAssetData?.balance;
  // };

  const triggerMaxClickFunc = (amount: BN) => {
    const getAssetData = userAssetsBalance.find(
      (tokenData) => tokenData.assetId === urlParams.tokenId
    );

    if (getAssetData) vm.setVMamount(amount || getAssetData.balance!);
  };

  useMemo(() => {
    const token = poolStats.find((_) => _.assetId === urlParams.tokenId);

    setChoosenToken(token!);
  }, [poolStats, urlParams]);

  return (
    <Root>
      {operationName === OPERATIONS_TYPE.SUPPLY && (
        <SupplyAssets
          token={choosenToken!}
          poolId={urlParams?.modalPoolId || vm.currentPoolId}
          error={vm.modalError}
          modalAmount={vm.modalAmount}
          modalSetAmount={vm.setVMamount}
          onMaxClick={triggerMaxClickFunc}
          onSubmit={vm.submitSupply}
        />
      )}
      {operationName === OPERATIONS_TYPE.WITHDRAW && (
        <WithdrawAssets
          token={choosenToken!}
          poolId={urlParams?.modalPoolId || vm.currentPoolId}
          error={vm.modalError}
          userHealth={vm.userHealth}
          modalAmount={vm.modalAmount}
          modalSetAmount={vm.setVMamount}
          onMaxClick={triggerMaxClickFunc}
          onSubmit={vm.submitWithdraw}
        />
      )}
      {operationName === OPERATIONS_TYPE.BORROW && (
        <BorrowAssets
          token={choosenToken!}
          poolId={urlParams?.modalPoolId || vm.currentPoolId}
          userHealth={vm.userHealth}
          modalAmount={vm.modalAmount}
          error={vm.modalError}
          modalSetAmount={vm.setVMamount}
          onMaxClick={triggerMaxClickFunc}
          onSubmit={vm.submitBorrow}
        />
      )}
      {operationName === OPERATIONS_TYPE.REPAY && (
        <RepayAssets
          token={choosenToken!}
          poolId={urlParams?.modalPoolId || vm.currentPoolId}
          modalAmount={vm.modalAmount}
          modalSetAmount={vm.setVMamount}
          error={vm.modalError}
          onMaxClick={triggerMaxClickFunc}
          onSubmit={vm.submitRepay}
        />
      )}
    </Root>
  );
};
export default observer(DashboardModalBody);
