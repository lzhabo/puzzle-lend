import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import { Row } from "../Flex";
import SizedBox from "@components/SizedBox";
import doneIcon from "@src/assets/icons/done.svg";

export type TStep = "previous" | "current" | "next";

interface IProps {
  steps: string[];
  activeStep: number;
  onStepClick: (step: number) => void;
  minStep?: number;
}

const Root = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  overflow-x: scroll;
  @media (min-width: 880px) {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

  ::-webkit-scrollbar {
    display: none;
  }
`;

const RopeContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 56px;
  height: 42px;
`;
const Rope = styled.div<{ done: boolean }>`
  width: 56px;
  height: 2px;
  background: ${({ done }) => (done ? "#F1F2FE" : "#C6C9F4")};
`;
const TextContainer = styled(Text)<{ state: TStep }>`
  text-align: center;
  width: 96px;
  @media (min-width: 880px) {
    text-align: left;
    max-width: none;
  }
  font-weight: ${({ state }) => (state === "current" ? 500 : 400)};
  color: ${({ state }) => (state === "next" ? "#8082C5" : "#363870")};
`;
const IconContainer = styled.div<{ state: TStep }>`
  display: flex;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  transition: 0.4s;
  position: relative;
  background: ${({ state }) => (state === "current" ? "#7075E9" : "#F1F2FE")};

  ${({ state }) => (state === "previous" ? "background: #c6c9f4;" : "")}
  & > div {
    color: ${({ state }) => (state === "current" ? "#ffffff" : "#7075E9")};
    ${({ state }) => (state === "previous" ? "color: #C6C9F4;" : "")}
  }

  ::after {
    transition: 0.4s;
    opacity: ${({ state }) => (state === "previous" ? 1 : 0)};
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 4px;
    left: 0;
    right: 0;
    bottom: 0;
    content: url(${doneIcon});
  }
`;
const MobileStepper: React.FC<IProps> = ({
  steps,
  activeStep,
  onStepClick,
  minStep,
}) => {
  return (
    <Root>
      <Row
        alignItems="center"
        justifyContent="center"
        mainAxisSize="fit-content"
        style={{ paddingLeft: 28 }}
      >
        {steps.map((name, step, array) => {
          const state =
            step === activeStep
              ? "current"
              : step > activeStep
              ? "next"
              : "previous";
          const disabled =
            activeStep === 3 ? true : minStep != null ? minStep < step : false;
          return (
            <React.Fragment key={step + "mobile-step"}>
              <IconContainer
                style={{ cursor: disabled ? "not-allowed" : "pointer" }}
                state={state}
                onClick={() => !disabled && onStepClick(step)}
              >
                <Text fitContent size="small" weight={500}>
                  {step + 1}
                </Text>
              </IconContainer>
              {step !== array.length - 1 && (
                <RopeContainer>
                  <Rope done={step >= activeStep} />
                </RopeContainer>
              )}
            </React.Fragment>
          );
        })}
      </Row>
      <SizedBox height={8} />
      <Row
        alignItems="center"
        justifyContent="center"
        mainAxisSize="fit-content"
        style={{ whiteSpace: "pre-line" }}
      >
        {steps.map((name, index) => {
          const state =
            index === activeStep
              ? "current"
              : index > activeStep
              ? "next"
              : "previous";
          return (
            <TextContainer
              size="small"
              weight={500}
              state={state}
              key={index + "mobile-step-desc"}
            >
              {name}
            </TextContainer>
          );
        })}
      </Row>
    </Root>
  );
};
export default MobileStepper;
