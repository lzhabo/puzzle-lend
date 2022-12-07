import React from "react";
import { observer } from "mobx-react-lite";
import styled from "@emotion/styled";
import { Column } from "@src/components/Flex";
import { TMarketStats } from "@src/entities/Market";
import { OPERATIONS_TYPE } from "@src/constants";
import WithdrawAssets from "@screens/Market/MarketModals/WithdrawAssets";
import BorrowAssets from "@screens/Market/MarketModals/RepayAssets";
import { useMarketModalVM } from "@screens/Market/MarketModals/MarketModalVM";
import SupplyAssets from "@screens/Market/MarketModals/SupplyAssets";
import RepayAssets from "@screens/Market/MarketModals/RepayAssets";

type UrlParamsTypes = {
  tokenId?: string;
  marketId?: string;
};

interface IProps {
  urlParams: UrlParamsTypes;
  operationName: OPERATIONS_TYPE;
  tokenStats: TMarketStats;
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

const MarketModalBody: React.FC<IProps> = ({
  operationName,
  tokenStats,
  urlParams,
  onClose
}) => {
  const vm = useMarketModalVM();

  return (
    <Root>
      {operationName === OPERATIONS_TYPE.SUPPLY && (
        <SupplyAssets
          token={tokenStats}
          marketId={urlParams?.marketId ?? ""}
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
          marketId={urlParams?.marketId ?? ""}
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
          marketId={urlParams?.marketId ?? ""}
          // userHealth={vm.userHealth}
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
          marketId={urlParams?.marketId ?? ""}
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
export default observer(MarketModalBody);
