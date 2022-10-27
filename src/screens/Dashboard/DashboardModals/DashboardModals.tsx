import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import SwitchButtons from "@components/SwitchButtons";
import { OPERATIONS_TYPE } from "@src/constants";
import { useStores } from "@stores";
import Skeleton from "react-loading-skeleton";
import DashboardModalBody from "@screens/Dashboard/DashboardModals/DashboardModalBody";
import Dialog from "@components/Dialog";
import {
  DashboardVMProvider,
  DashboardUseVM
} from "@screens/Dashboard/DashboardModals/DashboardModalVM";

interface IProps {}

interface IPropsVM {
  operationName: OPERATIONS_TYPE;
}

const TabsWrapper = styled(Row)`
  border-radius: 16px 16px 0px 0px;
  height: 56px;
  margin-top: -56px;
`;

const DashboardModalContent: React.FC<IProps> = () => {
  const vm = DashboardUseVM();
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
      vm.setDashboardModalStep(1);
    else vm.setDashboardModalStep(0);
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
      vm.setDashboardModalStep(step);
      return navigate(
        `/${vm.urlParams?.poolId}/${operation}/${vm.urlParams?.tokenId}`
      );
    }

    if (
      [OPERATIONS_TYPE.BORROW, OPERATIONS_TYPE.REPAY].includes(vm.operationName)
    ) {
      const operation =
        vm.operationName === OPERATIONS_TYPE.BORROW
          ? OPERATIONS_TYPE.REPAY
          : OPERATIONS_TYPE.BORROW;
      vm.setDashboardModalStep(step);
      return navigate(
        `/${vm.urlParams?.poolId}/${operation}/${vm.urlParams?.tokenId}`
      );
    }
  };

  const closeTab = () => navigate(`/${vm.urlParams?.poolId}`);

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
        <DashboardModalBody
          urlParams={vm.urlParams}
          operationName={vm.operationName}
          tokenStats={vm.token}
          onClose={closeTab}
        />
      )}
    </Dialog>
  );
};

const DashboardModal: React.FC<IPropsVM> = ({ operationName }) => {
  const urlParams = useParams<{ tokenId: string; poolId: string }>();
  const { lendStore } = useStores();

  return (
    <DashboardVMProvider operationName={operationName} urlParams={urlParams}>
      {lendStore.initialized ? (
        <DashboardModalContent />
      ) : (
        <Dialog
          wrapClassName="dashboard-dialog"
          title="Operations"
          visible={true}
          style={{ maxWidth: "415px" }}
        >
          <Skeleton height={56} style={{ marginBottom: 8 }} count={4} />
        </Dialog>
      )}
    </DashboardVMProvider>
  );
};

export default observer(DashboardModal);
