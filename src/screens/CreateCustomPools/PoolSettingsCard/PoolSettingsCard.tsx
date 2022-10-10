import React from "react";
import { useCreateCustomPoolsVM } from "@screens/CreateCustomPools/CreateCustomPoolsVm";
import { observer } from "mobx-react-lite";
import SelectAssets from "./SelectAssets";
import ConfirmPoolCreation from "./ConfirmPoolCreation";
import TitleAndDomainPoolSetting from "./TitleAndDomailPoolSetting";
import styled from "@emotion/styled";
import ContinueBtn from "@screens/CreateCustomPools/ContinueBtn";
import SizedBox from "@components/SizedBox";
import AddLiquidityToCustomPool from "@screens/CreateCustomPools/PoolSettingsCard/AddLiquidityToCustomPool";
import DialogNotification from "@components/Dialog/DialogNotification";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const DesktopContinueBtn = styled.div`
  display: none;
  @media (min-width: 880px) {
    display: flex;
  }
`;
const PoolSettingsCard: React.FC<IProps> = () => {
  const vm = useCreateCustomPoolsVM();
  const currentStep = () => {
    switch (vm.step) {
      case 0:
        return <SelectAssets />;
      case 1:
        return <TitleAndDomainPoolSetting />;
      case 2:
        return <ConfirmPoolCreation />;
      case 3:
        return <AddLiquidityToCustomPool />;
      default:
        return null;
    }
  };
  return (
    <Root>
      {currentStep()}
      <SizedBox height={24} />
      <DesktopContinueBtn>
        <ContinueBtn />
      </DesktopContinueBtn>
      <DialogNotification
        onClose={() => vm.setNotificationParams(null)}
        title={vm.notificationParams?.title ?? ""}
        description={vm.notificationParams?.description}
        buttonsDirection={vm.notificationParams?.buttonsDirection}
        type={vm.notificationParams?.type}
        buttons={vm.notificationParams?.buttons}
        style={{ maxWidth: 360 }}
        visible={vm.notificationParams != null}
        icon={vm.notificationParams?.icon}
      />
    </Root>
  );
};
export default observer(PoolSettingsCard);
