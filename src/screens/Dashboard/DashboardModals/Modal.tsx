import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import { Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import SwitchButtons from "@components/SwitchButtons";
import DashboardModalBody from '@screens/Dashboard/DashboardModals/DashboardModalBody';
import Dialog from '@components/Dialog';
import { DashboardWalletVMProvider, DashboardWalletUseVM } from '@screens/Dashboard/DashboardModals/DashboardWalletVM';

type IProps = {
  operationName: string;
};

const TabsWrapper = styled(Row)`
  border-radius: 16px 16px 0px 0px;
  background: ${({ theme }) => theme.colors.white};
  height: 56px;
  margin-top: -56px;

  .rc-dialog-title {
    color: ${({ theme }) => theme.colors.white};
  }
`;

const DashboardModal: React.FC<IProps> = ({ operationName }) => {
  return (
    <DashboardWalletVMProvider>
      <DashboardModalContent
        operationName={operationName}
      />
    </DashboardWalletVMProvider>
  );
};

const DashboardModalContent: React.FC<IProps> = ({ operationName }) => {
  const vm = DashboardWalletUseVM();
  const navigate = useNavigate();
  const urlParams = useParams<any>();

  console.log(urlParams, '-PPARAANS')

  const setActiveTab = (step: 0 | 1) => {
    if (operationName === 'supply' || operationName === 'withdraw') {
      const operation = operationName === 'supply' ? 'withdraw' : 'supply'
      vm.setDashboardModalOpened(true, step);
      return navigate(`/${urlParams?.modalPoolId}/${operation}/${urlParams?.tokenId}`)
    }
  }

  const closeTab = (step: 0 | 1) => {
    vm.setDashboardModalOpened(false, step);
    return navigate('/')
  }

  return (
    <Dialog
      wrapClassName="dashboard-dialog"
      title="Operations"
      visible={!!operationName}
      onClose={() => closeTab(vm.dashboardModalStep)}
      style={{ maxWidth: '415px' }}
    >
      <SizedBox height={72} />
      <TabsWrapper>
        <SwitchButtons
          values={['Supply', 'Withdraw']}
          active={vm.dashboardModalStep}
          onActivate={(v: 0 | 1) => setActiveTab(v)}
          border
        />
      </TabsWrapper>
      <DashboardModalBody urlParams={urlParams} operationName={operationName} />
    </Dialog>
  );
};


export default observer(DashboardModal);