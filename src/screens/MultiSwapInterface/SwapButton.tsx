import React from "react";
import { useStores } from "@stores";
import Button from "@components/Button";
import { observer } from "mobx-react-lite";
import { useMultiSwapVM } from "@screens/MultiSwapInterface/MultiSwapVM";
import Loading from "@components/Loading";

interface IProps {}

const SwapButton: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const vm = useMultiSwapVM();
  const { amount0, balance0, token0, amount1, token1, loading } = vm;
  switch (true) {
    case accountStore.address == null:
      return (
        <Button onClick={() => accountStore.setLoginModalOpened(true)} fixed>
          Connect wallet
        </Button>
      );

    case amount0 == null ||
      token0 == null ||
      amount1 == null ||
      token1 == null ||
      amount0.eq(0):
      return (
        <Button disabled fixed>
          Enter an amount
        </Button>
      );
    case amount0!.gt(balance0!):
      return (
        <Button disabled fixed>
          Insufficient {`${vm.token0?.name ?? ""} `}balance
        </Button>
      );
    case vm.priceImpact && vm.priceImpact.eq(100):
      return (
        <Button disabled fixed>
          Price impact too high
        </Button>
      );
    case loading:
      return (
        <Button disabled fixed>
          Transaction in progress <Loading />
        </Button>
      );
    case amount0 != null || token0 != null || amount1 != null || token1 != null:
      return (
        <Button onClick={vm.swap} fixed>
          Swap
        </Button>
      );
    default:
      return (
        <Button disabled fixed>
          Swap
        </Button>
      );
  }
};
export default observer(SwapButton);
