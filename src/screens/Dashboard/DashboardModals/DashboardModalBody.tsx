import React, { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import styled from "@emotion/styled";
import { Column } from "@src/components/Flex";
import { TPoolStats } from "@src/stores/LendStore";
import { DashboardUseVM } from "@screens/Dashboard/DashboardModals/DashboardModalVM";
import { OPERATIONS_TYPE } from "@src/constants";
import BN from "@src/utils/BN";

import SupplyAssets from "@screens/Dashboard/DashboardModals/SupplyAssets";
import WithdrawAssets from "@screens/Dashboard//DashboardModals/WithdrawAssets";

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

  const triggerMaxClickFunc = (amount?: BN) => {
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
          userBalance={getTokenBalance()}
          modalAmount={vm.modalAmount}
          modalSetAmount={vm.setModalAmount}
          onMaxClick={triggerMaxClickFunc}
          onSubmit={vm.submitSupply}
        />
      )}
      {step === 1 && operationName === OPERATIONS_TYPE.WITHDRAW && (
        <WithdrawAssets
          token={choosenToken!}
          userBalance={getTokenBalance()}
          modalAmount={vm.modalAmount}
          modalSetAmount={vm.setModalAmount}
          onMaxClick={triggerMaxClickFunc}
          onSubmit={vm.submitSupply}
        />
      )}
    </Root>
  );
};
export default observer(WalletModalBody);
