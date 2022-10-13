import React, { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import SwitchButtons from "@components/SwitchButtons";
import { OPERATIONS_TYPE } from "@src/constants";
import { sleep } from "@src/utils/sleep";
import DashboardModalBody from "@screens/Dashboard/DashboardModals/DashboardModalBody";
import Dialog from "@components/Dialog";
import {
  DashboardVMProvider,
  DashboardUseVM
} from "@screens/Dashboard/DashboardModals/DashboardModalVM";

interface IProps {
  operationName: OPERATIONS_TYPE;
}

const TabsWrapper = styled(Row)`
  border-radius: 16px 16px 0px 0px;
  height: 56px;
  margin-top: -56px;
`;

const DashboardModalContent: React.FC<IProps> = ({ operationName }) => {
  const vm = DashboardUseVM();
  const navigate = useNavigate();
  const [getModalTitles, setModalTitles] = useState<[string, string]>(["", ""]);
  const [isOpen, setOpen] = useState<boolean>(false);
  const urlParams = useParams<any>();

  useMemo(() => {
    const supplyTitles: [string, string] = ["Supply", "Withdraw"];
    const borrowTitles: [string, string] = ["Borrow", "Repay"];
    if (
      [OPERATIONS_TYPE.SUPPLY, OPERATIONS_TYPE.WITHDRAW].includes(operationName)
    )
      setModalTitles(supplyTitles);
    else setModalTitles(borrowTitles);
    setOpen(true);
  }, [operationName]);

  const setActiveTab = (step: 0 | 1) => {
    if (
      [OPERATIONS_TYPE.SUPPLY, OPERATIONS_TYPE.WITHDRAW].includes(operationName)
    ) {
      const operation =
        operationName === OPERATIONS_TYPE.SUPPLY
          ? OPERATIONS_TYPE.WITHDRAW
          : OPERATIONS_TYPE.SUPPLY;
      vm.setDashboardModalStep(step);
      return navigate(
        `/${urlParams?.modalPoolId}/${operation}/${urlParams?.tokenId}`
      );
    }

    if (
      [OPERATIONS_TYPE.BORROW, OPERATIONS_TYPE.REPAY].includes(operationName)
    ) {
      const operation =
        operationName === OPERATIONS_TYPE.BORROW
          ? OPERATIONS_TYPE.BORROW
          : OPERATIONS_TYPE.REPAY;
      vm.setDashboardModalStep(step);
      return navigate(
        `/${urlParams?.modalPoolId}/${operation}/${urlParams?.tokenId}`
      );
    }
  };

  const closeTab = async () => {
    setOpen(false);
    await sleep(400);
    return navigate("/");
  };

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
      <DashboardModalBody urlParams={urlParams} operationName={operationName} />
    </Dialog>
  );
};

const DashboardModal: React.FC<IProps> = ({ operationName }) => {
  return (
    <DashboardVMProvider>
      <DashboardModalContent operationName={operationName} />
    </DashboardVMProvider>
  );
};

export default observer(DashboardModal);
