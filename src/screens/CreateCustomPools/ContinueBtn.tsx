import React from "react";
import Button from "@components/Button";
import { useCreateCustomPoolsVM } from "@screens/CreateCustomPools/CreateCustomPoolsVm";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import Loading from "@components/Loading";

const ContinueBtn: React.FC = () => {
  const vm = useCreateCustomPoolsVM();
  const { accountStore } = useStores();
  const handleContinue = (step: number) => {
    vm.setStep(step);
    vm.saveSettings();
  };
  if (accountStore.address == null)
    return (
      <Button onClick={() => accountStore.setLoginModalOpened(true)} fixed>
        Connect wallet
      </Button>
    );
  if (vm.loading)
    return (
      <Button disabled fixed>
        <Loading big />
      </Button>
    );

  switch (vm.step) {
    case 0:
      const stringShare = vm.totalTakenShare.div(10).toFormat(1);
      return (
        <Button onClick={() => handleContinue(1)} fixed disabled={!vm.correct0}>
          {vm.poolsAssets.length === 1 && "Select assets"}
          {vm.poolsAssets.length > 1 &&
            (vm.totalTakenShare.eq(1000)
              ? "Continue"
              : `Total share should be 100%, now ${stringShare}%`)}
        </Button>
      );
    case 1:
      return (
        <Button onClick={() => handleContinue(2)} fixed disabled={!vm.correct1}>
          {vm.correct1 ? "Continue" : "Fill in all fields"}
        </Button>
      );
    case 2:
      return (
        <Button onClick={vm.handleCreatePool} fixed disabled={!vm.correct2}>
          {vm.isDomainPaid
            ? "Continue"
            : vm.artefactToSpend == null
            ? "Select an artefact"
            : "Continue"}
        </Button>
      );
    case 3:
      return (
        <Button
          onClick={vm.provideLiquidityToPool}
          disabled={!vm.correct3}
          fixed
        >
          {vm.correct3 ? "Continue" : "Enter amount to provide"}
        </Button>
      );
    default:
      return (
        <Button disabled fixed>
          Continue
        </Button>
      );
  }
};
export default observer(ContinueBtn);
