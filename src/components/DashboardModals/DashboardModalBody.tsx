import styled from '@emotion/styled';
import React, { useState, useMemo } from 'react';
import { Column } from '@src/components/Flex';
import { observer } from 'mobx-react-lite';
import { DashboardWalletUseVM } from '@src/components/DashboardModals/DashboardWalletVM';
import { TPoolStats } from "@src/stores/LendStore";
import BN from '@src/utils/BN';
import SupplyAssets from '@src/components/DashboardModals/SupplyAssets';
import WithdrawAssets from './WithdrawAssets';

type UrlParamsTypes = {
  tokenId?: string;
  operationName?: string;
  modalPoolId?: string;
}

interface IProps {
  urlParams: UrlParamsTypes;
  operationName: string;
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
  urlParams,
  operationName
}) => {
  const [choosenToken, setChoosenToken] = useState<TPoolStats>();
  const vm = DashboardWalletUseVM();
  const { lendStore } = vm.rootStore;

  const getTokenBalance: any = () => {
    const getAssetData = vm.balances.find((tokenData) => tokenData.assetId === urlParams.tokenId);

    return getAssetData?.balance;
  };

  const supplyMaxClickFunc = (amount?: BN) => {
    const getAssetData = vm.balances.find((tokenData) => tokenData.assetId === urlParams.tokenId);

    if (getAssetData) vm.setSupplyAmount(amount || getAssetData.balance!);
  };

  useMemo(() => {
    const token = lendStore.poolsStats.find((_) => _.assetId === urlParams.tokenId);

    setChoosenToken(token!);
  }, [urlParams.tokenId, lendStore.poolsStats]);

  return (
    <Root>
      {lendStore.dashboardModalStep === 0 && operationName === 'supply' && (
        <SupplyAssets
          token={choosenToken!}
          userBalance={getTokenBalance()}
          modalAmount={vm.supplyAmount}
          modalSetAmount={vm.setSupplyAmount}
          onMaxClick={supplyMaxClickFunc}
          onSubmit={vm.submitSupply}
          onClose={vm.onCloseModal}
        />
      )}
      {lendStore.dashboardModalStep === 1 && operationName === 'withdraw' && (
        <WithdrawAssets
          token={choosenToken!}
          userBalance={getTokenBalance()}
          modalAmount={vm.supplyAmount}
          modalSetAmount={vm.setSupplyAmount}
          onMaxClick={supplyMaxClickFunc}
          onSubmit={vm.submitSupply}
          onClose={vm.onCloseModal}
        />
      )}
    </Root>
  );
};
export default observer(WalletModalBody);
