import React from "react";
import { useStores } from "@stores";
import Button from "@components/Button";
import { observer } from "mobx-react-lite";
import Loading from "@components/Loading";
import { useSwapVM } from "@screens/TradeInterface/SwapVM";

interface IProps {}

const SwapButton: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const vm = useSwapVM();
  const { amount0, token0, balance0, amount1, synchronizing, loading } = vm;
  switch (true) {
    case accountStore.address == null:
      return (
        <Button onClick={() => accountStore.setLoginModalOpened(true)} fixed>
          Connect wallet
        </Button>
      );
    case synchronizing:
      return (
        <Button disabled fixed>
          Please wait <Loading />
        </Button>
      );
    case loading:
      return (
        <Button disabled fixed>
          Transaction in progress <Loading />
        </Button>
      );
    case amount0 == null || amount1 == null || amount0.eq(0):
      return (
        <Button disabled fixed>
          Enter an amount
        </Button>
      );
    case amount0!.gt(balance0!):
      return (
        <Button disabled fixed>
          Insufficient {`${token0?.name ?? ""} `}balance
        </Button>
      );
    case vm.priceImpact && vm.priceImpact.eq(100):
      return (
        <Button disabled fixed>
          Price impact too high
        </Button>
      );
    case amount0 != null && amount1 != null && !synchronizing:
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
