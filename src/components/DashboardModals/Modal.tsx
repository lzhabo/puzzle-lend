import React from 'react';
import { useParams, useNavigate, Params } from "react-router-dom";
import styled from '@emotion/styled';
import { useStores } from "@stores";
import { observer } from 'mobx-react-lite';
import { Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import SwitchButtons from "@components/SwitchButtons";
import DashboardModalBody from '@components/DashboardModals/DashboardModalBody';
import Dialog from '@components/Dialog';
import { DashboardWalletVMProvider } from '@components/DashboardModals/DashboardWalletVM';
import './modal.css';

interface UrlParamsProps {
  tokenId: string;
  operationName: string;
  modalPoolId: string;
}

type IProps = {
  step: 0 | 1;
  urlParams: Readonly<Params<keyof UrlParamsProps>>;
  setActiveTab: (step: 0 | 1) => void;
};

type IModalProps = {};

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const TabsWrapper = styled(Row)`
  border-radius: 16px 16px 0px 0px;
  background: ${({ theme }) => theme.colors.white};
  height: 56px;
  margin-top: -56px;

  .rc-dialog-title {
    color: ${({ theme }) => theme.colors.white};
  }
`;

const DashboardModal: React.FC<IModalProps> = ({ ...rest }) => {
  const { lendStore } = useStores();
  const navigate = useNavigate();
  const urlParams = useParams<keyof UrlParamsProps>();

  const setActiveTab = (step: 0 | 1) => {
    if (urlParams?.operationName === 'supply' || urlParams?.operationName === 'withdraw') {
      const operation = urlParams?.operationName === 'supply' ? 'withdraw' : 'supply'
      lendStore.setDashboardModalOpened(true, step);
      return navigate(`/${urlParams?.modalPoolId}/${operation}/${urlParams?.tokenId}`)
    }
  }

  const closeTab = (step: 0 | 1) => {
    lendStore.setDashboardModalOpened(false, step);
    return navigate('/')
  }

  return (
    <Dialog
      wrapClassName="dashboard-dialog"
      title="Operations"
      visible={lendStore.dashboardModalOpened}
      onClose={() => closeTab(lendStore.dashboardModalStep)}
    >
      <DashboardWalletVMProvider>
        <DashboardModalContent
          urlParams={urlParams}
          step={lendStore.dashboardModalStep}
          setActiveTab={((step) => setActiveTab(step))}
        />
      </DashboardWalletVMProvider>
    </Dialog>
  );
};

const DashboardModalContent: React.FC<IProps> = ({ step, setActiveTab, urlParams }) => {
  return (
    <Root>
      <SizedBox height={72} />
      <TabsWrapper>
        <SwitchButtons
          values={['Supply', 'Withdraw']}
          active={step}
          onActivate={(v: 0 | 1) => setActiveTab(v)}
          border
        />
      </TabsWrapper>
      <DashboardModalBody urlParams={urlParams} />
    </Root>
  );
};


export default observer(DashboardModal);