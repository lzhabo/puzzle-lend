import React from "react";
import { observer } from "mobx-react-lite";
import styled from "@emotion/styled";
import { Column } from "@src/components/Flex";
import { TPoolStats } from "@src/stores/LendStore";
import { DashboardUseVM } from "@screens/Dashboard/DashboardModals/DashboardModalVM";
import { OPERATIONS_TYPE } from "@src/constants";

import RepayAssets from "@screens/Dashboard/DashboardModals/RepayAssets";
import SupplyAssets from "@screens/Dashboard/DashboardModals/SupplyAssets";
import WithdrawAssets from "@screens/Dashboard//DashboardModals/WithdrawAssets";
import BorrowAssets from "@screens/Dashboard/DashboardModals/BorrowAssets";

type UrlParamsTypes = {
  tokenId?: string;
  poolId?: string;
};

interface IProps {
  urlParams: UrlParamsTypes;
  operationName: OPERATIONS_TYPE;
  tokenStats: TPoolStats;
  onClose: () => void;
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
  tokenStats,
  urlParams,
  onClose
}) => {
  const vm = DashboardUseVM();

  return (
    <Root>
      {operationName === OPERATIONS_TYPE.SUPPLY && (
        <SupplyAssets
          token={tokenStats}
          poolId={urlParams?.poolId || vm.currentPoolId}
          modalAmount={vm.modalAmount}
          modalSetAmount={vm.setVMamount}
          onMaxClick={vm.triggerMaxClickFunc}
          onSubmit={vm.submitSupply}
          onClose={onClose}
        />
      )}
      {operationName === OPERATIONS_TYPE.WITHDRAW && (
        <WithdrawAssets
          token={tokenStats}
          poolId={urlParams?.poolId || vm.currentPoolId}
          userHealth={vm.userHealth}
          modalAmount={vm.modalAmount}
          modalSetAmount={vm.setVMamount}
          onMaxClick={vm.triggerMaxClickFunc}
          onSubmit={vm.submitWithdraw}
          onClose={onClose}
        />
      )}
      {operationName === OPERATIONS_TYPE.BORROW && (
        <BorrowAssets
          token={tokenStats}
          poolId={urlParams?.poolId || vm.currentPoolId}
          userHealth={vm.userHealth}
          modalAmount={vm.modalAmount}
          modalSetAmount={vm.setVMamount}
          onMaxClick={vm.triggerMaxClickFunc}
          onSubmit={vm.submitBorrow}
          onClose={onClose}
        />
      )}
      {operationName === OPERATIONS_TYPE.REPAY && (
        <RepayAssets
          token={tokenStats}
          poolId={urlParams?.poolId || vm.currentPoolId}
          modalAmount={vm.modalAmount}
          modalSetAmount={vm.setVMamount}
          onMaxClick={vm.triggerMaxClickFunc}
          onSubmit={vm.submitRepay}
          onClose={onClose}
        />
      )}
    </Root>
  );
};
export default observer(DashboardModalBody);
