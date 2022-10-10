import styled from "@emotion/styled";
import React from "react";
import SizedBox from "@components/SizedBox";
import { useTheme } from "@emotion/react";
import Token from "./Token";
import { useNavigate } from "react-router-dom";
import { useLimitOrdersVM } from "@screens/TradeInterface/LimitOrdersVM";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import { useSwapVM } from "@screens/TradeInterface/SwapVM";
import BN from "@src/utils/BN";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const ArrowImg = styled.img`
  width: 32px;
  height: 32px;
  cursor: pointer;
  position: absolute;
  right: calc(50% - 16px);
  top: -12px;
  transition: 0.4s;

  :hover {
    transform: rotate(180deg);
  }
`;

const Tokens: React.FC<IProps> = () => {
  const vm = useLimitOrdersVM();
  const swapVm = useSwapVM();
  const { accountStore, notificationStore } = useStores();
  const theme = useTheme();
  const navigate = useNavigate();
  const handleSetAssetId0 = (assetId: string) => {
    if (assetId === vm.assetId0) {
      notificationStore.notify("You can't choose same assets", {
        type: "error",
        title: "Warning",
      });
      return;
    }
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.set("asset0", assetId);
    navigate({
      pathname: window.location.pathname,
      search: `?${urlSearchParams.toString()}`,
    });
    vm.setAssetId0(assetId);
    vm.setPrice(BN.ZERO);
    swapVm.setAssetId0(assetId);
  };
  const handleSetAssetId1 = (assetId: string) => {
    if (assetId === vm.assetId1) {
      notificationStore.notify("You can't choose same assets", {
        type: "error",
        title: "Warning",
      });
      return;
    }
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.set("asset1", assetId);
    navigate({
      pathname: window.location.pathname,
      search: `?${urlSearchParams.toString()}`,
    });
    vm.setAssetId1(assetId);
    vm.setPrice(BN.ZERO);
    swapVm.setAssetId1(assetId);
  };

  const handleSwitch = async () => {
    await vm.switchTokens();
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.set("asset0", vm.assetId0);
    urlSearchParams.set("asset1", vm.assetId1);
    navigate({
      pathname: window.location.pathname,
      search: `?${urlSearchParams.toString()}`,
    });
    swapVm.setAssetId0(vm.assetId0);
    swapVm.setAssetId1(vm.assetId1);
  };
  return (
    <Root>
      <Token
        assetId={vm.assetId0}
        balances={accountStore.balances}
        setAssetId={handleSetAssetId0}
        balanceError={vm.paymentError}
      />
      <SizedBox height={8} style={{ position: "relative" }}>
        <ArrowImg
          onClick={handleSwitch}
          src={theme.images.icons.limitOrderArrow}
        />
      </SizedBox>
      <Token
        assetId={vm.assetId1}
        balances={accountStore.balances}
        setAssetId={handleSetAssetId1}
      />
    </Root>
  );
};
export default observer(Tokens);
