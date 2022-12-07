import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import SwitchButtons from "@components/SwitchButtons";
import { OPERATIONS_TYPE } from "@src/constants";
import Dialog from "@components/Dialog";
import {
  MarketModalVMProvider,
  useMarketModalVM
} from "@screens/Market/MarketModals/MarketModalVM";
import MarketModalBody from "@screens/Market/MarketModals/MarketModalBody";
import { useStores } from "@stores";
import { useMarketVM } from "@screens/Market/MarketVm";

interface IProps {}

interface IPropsVM {
  operationName: OPERATIONS_TYPE;
}

const TabsWrapper = styled(Row)`
  border-radius: 16px 16px 0 0;
  height: 56px;
  margin-top: -56px;
`;

const MarketModalContent: React.FC<IProps> = () => {
  const vm = useMarketModalVM();
  const navigate = useNavigate();
  const [getModalTitles, setModalTitles] = useState<[string, string]>(["", ""]);
  const [isOpen, setOpen] = useState<boolean>(false);

  useMemo(() => {
    const supplyTitles: [string, string] = ["Supply", "Withdraw"];
    const borrowTitles: [string, string] = ["Borrow", "Repay"];
    if (
      [OPERATIONS_TYPE.SUPPLY, OPERATIONS_TYPE.WITHDRAW].includes(
        vm.operationName
      )
    )
      setModalTitles(supplyTitles);
    else setModalTitles(borrowTitles);

    if (
      [OPERATIONS_TYPE.WITHDRAW, OPERATIONS_TYPE.REPAY].includes(
        vm.operationName
      )
    )
      vm.setMarketModalStep(1);
    else vm.setMarketModalStep(0);
    setOpen(true);
  }, [vm]);

  const setActiveTab = (step: 0 | 1) => {
    if (
      [OPERATIONS_TYPE.SUPPLY, OPERATIONS_TYPE.WITHDRAW].includes(
        vm.operationName
      )
    ) {
      const operation =
        vm.operationName === OPERATIONS_TYPE.SUPPLY
          ? OPERATIONS_TYPE.WITHDRAW
          : OPERATIONS_TYPE.SUPPLY;
      vm.setMarketModalStep(step);
      return navigate(
        `/${vm.urlParams?.marketId}/${operation}/${vm.urlParams?.tokenId}`
      );
    }

    if (
      [OPERATIONS_TYPE.BORROW, OPERATIONS_TYPE.REPAY].includes(vm.operationName)
    ) {
      const operation =
        vm.operationName === OPERATIONS_TYPE.BORROW
          ? OPERATIONS_TYPE.REPAY
          : OPERATIONS_TYPE.BORROW;
      vm.setMarketModalStep(step);
      return navigate(
        `/${vm.urlParams?.marketId}/${operation}/${vm.urlParams?.tokenId}`
      );
    }
  };

  const closeTab = () => navigate(`/${vm.urlParams?.marketId}`);

  return (
    <Dialog
      wrapClassName="dashboard-dialog"
      title="Operations"
      visible={isOpen}
      onClose={() => closeTab()}
      style={{ maxWidth: "415px" }}
    >
      <SizedBox height={72} />
      <TabsWrapper>
        <SwitchButtons
          values={getModalTitles}
          active={vm.dashboardModalStep}
          onActivate={(v: 0 | 1) => setActiveTab(v)}
          border
        />
      </TabsWrapper>
      {vm.token && (
        <MarketModalBody
          urlParams={vm.urlParams}
          operationName={vm.operationName}
          tokenStats={vm.token}
          onClose={closeTab}
        />
      )}
    </Dialog>
  );
};

const MarketModal: React.FC<IPropsVM> = ({ operationName }) => {
  const urlParams = useParams<{ tokenId: string; poolId: string }>();
  const vm = useMarketVM();
  return (
    <MarketModalVMProvider
      operationName={operationName}
      urlParams={urlParams}
      market={vm.market}
    >
      <MarketModalContent />
    </MarketModalVMProvider>
  );
};

export default observer(MarketModal);
