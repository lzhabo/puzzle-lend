import styled from "@emotion/styled";
import React from "react";
import Card from "@components/Card";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { useCreateCustomPoolsVM } from "@screens/CreateCustomPools/CreateCustomPoolsVm";
import { observer } from "mobx-react-lite";
import DesktopStepper from "@src/components/Stepper/DesktopStepper";
import MobileStepper from "@components/Stepper/MobileStepper";
import { Row } from "@src/components/Flex";
import ResetAllButton from "@components/Stepper/ResetAllButton";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  max-width: calc(100vw - 32px);
`;

const StyledResetButton = styled(ResetAllButton)`
  justify-content: flex-end;
  @media (min-width: 880px) {
    display: none;
  }
`;

const CreatePoolsStepper: React.FC<IProps> = () => {
  const steps = [
    "Select the composition",
    "Set up a title \nand an icon",
    "Confirm pool creation",
    "Add your \nliquidity",
  ];
  const vm = useCreateCustomPoolsVM();

  return (
    <Root>
      <Row>
        <Text type="secondary" weight={500}>
          Steps
        </Text>
        <StyledResetButton onClick={vm.reset} />
      </Row>
      <SizedBox height={8} />
      <Card style={{ overflowX: "auto" }}>
        <DesktopStepper
          activeStep={vm.step}
          steps={steps}
          onStepClick={(s) => vm.maxStep >= s && vm.setStep(s, true)}
          minStep={vm.minStep}
          onReset={vm.reset}
        />
        <MobileStepper
          activeStep={vm.step}
          steps={steps}
          onStepClick={(s) => vm.maxStep >= s && vm.setStep(s, true)}
          minStep={vm.minStep}
        />
      </Card>
    </Root>
  );
};
export default observer(CreatePoolsStepper);
