import React, { useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import styled from '@emotion/styled';
import { useStores } from "@stores";
import { observer } from 'mobx-react-lite';
import RcDialog from 'rc-dialog';
import { ReactComponent as CloseIcon } from "@src/assets/icons/close.svg";
import { Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import SwitchButtons from "@components/SwitchButtons";
import DashboardModalBody from '@components/DashboardModals/DashboardModalBody';
import { DashboardWalletVMProvider, DashboardWalletUseVM } from '@components/DashboardModals/DashboardWalletVM';
import './modal.css';

type IProps = {
  onClose: () => void;
  visible: boolean;
};

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
`;

const DashboardModal: React.FC<IProps> = ({ ...rest }) => {
  const { lendStore } = useStores();
  const navigate = useNavigate();
  const urlParams = useParams<{ tokenId: string, operationName: string, modalPoolId: string }>();

  const setActiveTab = (step: 0 | 1) => {
    if (urlParams?.operationName === 'supply' || urlParams?.operationName === 'withdraw') {
      const operation = urlParams?.operationName === 'supply' ? 'withdraw' : 'supply'
      lendStore.setDashboardModalOpened(true, step);
      return navigate(`/${urlParams?.modalPoolId}/${operation}/${urlParams?.tokenId}`)
    }
  }

  return (
    <RcDialog
      wrapClassName="dashboard-dialog"
      closeIcon={<CloseIcon style={{ marginTop: 8 }} />}
      animation="zoom"
      maskAnimation="fade"
      destroyOnClose
      title="Operations"
      {...rest}>
      <DashboardWalletVMProvider>
        <Root>
          <SizedBox height={72} />
          <TabsWrapper>
            <SwitchButtons
              values={['Supply', 'Withdraw']}
              active={lendStore.dashboardModalStep}
              onActivate={(v: 0 | 1) => setActiveTab(v)}
              border
            />
          </TabsWrapper>
          <DashboardModalBody urlParams={urlParams} />
        </Root>
      </DashboardWalletVMProvider>
    </RcDialog>
  );
};

export default observer(DashboardModal);