import styled from "@emotion/styled";
import React from "react";
import DesktopStep from "./DesktopStep";
import ResetAllButton from "@components/Stepper/ResetAllButton";
import SizedBox from "@components/SizedBox";

interface IProps {
  steps: string[];
  activeStep: number;
  onStepClick: (step: number) => void;
  minStep?: number;
  onReset?: () => void;
}

const Root = styled.div`
  display: none;
  @media (min-width: 880px) {
    display: flex;
  }
  flex-direction: column;
  transition: all 0.3s ease;
`;

const RopeContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 25px;
  height: 12px;
`;

const Rope = styled.div<{ done: boolean }>`
  width: 1px;
  height: 12px;
  background: ${({ done, theme }) =>
    done ? theme.colors.primary100 : theme.colors.primary300};
`;

const Stepper: React.FC<IProps> = ({
  steps,
  activeStep,
  onStepClick,
  minStep,
  onReset,
}) => {
  return (
    <Root>
      {steps.map((name, step, array) => {
        const state =
          step === activeStep
            ? "current"
            : step > activeStep
            ? "next"
            : "previous";
        return (
          <React.Fragment key={step + "step-step"}>
            <DesktopStep
              onClick={() => onStepClick(step)}
              title={name}
              state={state}
              index={step}
              key={step + name + "_step"}
              disabled={
                activeStep === 3
                  ? true
                  : minStep != null
                  ? minStep < step
                  : false
              }
            />
            {step !== array.length - 1 && (
              <RopeContainer>
                <Rope done={step >= activeStep} />
              </RopeContainer>
            )}
          </React.Fragment>
        );
      })}
      <SizedBox height={24} />
      <ResetAllButton onClick={onReset} />
    </Root>
  );
};
export default Stepper;
