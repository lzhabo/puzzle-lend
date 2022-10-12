import React, { useState } from 'react';
import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import RcDialog from 'rc-dialog';
import { ReactComponent as CloseIcon } from "@src/assets/icons/close.svg";
import { Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Tabs from '@components/Tabs';
import { DashboardWalletVMProvider, DashboardWalletUseVM } from '@components/DashboardModals/DashboardWalletVM';

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
  background: #fff;
  height: 56px;
  margin-top: -56px;
`;

const DashboardModal: React.FC<IProps> = ({ ...rest }) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <>
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
            <SizedBox height={56} />
            <TabsWrapper>
              <Tabs
                tabs={[{ name: 'Supply' }, { name: 'Withdraw' }]}
                activeTab={activeTab}
                setActive={(v: number) => setActiveTab(v)}
                style={{ padding: 8 }}
                tabStyle={{ flex: 1 }}
              />
            </TabsWrapper>
            {/* <DashboardModalBody filteredTokens={filteredTokens} /> */}
          </Root>
        </DashboardWalletVMProvider>
      </RcDialog>
    </>
  );
};

export default observer(DashboardModal);