import styled from "@emotion/styled";
import React from "react";
import Card from "@components/Card";
import TokenInput from "@components/TokenInput";
import SizedBox from "@components/SizedBox";
import SwapDetailRow from "@components/SwapDetailRow";
import { Row } from "@components/Flex";
import Text from "@components/Text";
import { ReactComponent as ArrowIcon } from "@src/assets/icons/arrowRightBorderless.svg";
import { ReactComponent as ShowMoreIcon } from "@src/assets/icons/showMore.svg";
import Divider from "@components/Divider";
import Tooltip from "@components/Tooltip";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import { useStores } from "@stores";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import TooltipFeeInfo from "./TooltipFeeInfo";
import RoutingModal from "./RoutingModal";
import SwapButton from "./SwapButton";
import Settings from "./Settings";
import SettingsHeader from "../SettingsHeader";
import { useSwapVM } from "@screens/TradeInterface/SwapVM";
import SwitchTokensButton from "./SwitchTokensButton";
import Details from "./Details";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  max-width: 560px;
`;

const Swap: React.FC<IProps> = ({ ...rest }) => {
  const { notificationStore, accountStore } = useStores();
  const vm = useSwapVM();
  const navigate = useNavigate();

  const handleSetAssetId0 = (assetId: string) => {
    if (assetId === vm.assetId1) {
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
  };

  const handleSetAssetId1 = (assetId: string) => {
    if (assetId === vm.assetId0) {
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
  };
  return (
    <Root {...rest}>
      <Card
        style={{ position: "relative" }}
        paddingDesktop="16px 24px"
        paddingMobile="16px"
      >
        <SettingsHeader withSetting />
        <Settings />
        <TokenInput
          decimals={vm.token0.decimals}
          amount={vm.amount0}
          setAmount={vm.setAmount0}
          assetId={vm.assetId0}
          setAssetId={handleSetAssetId0}
          balances={accountStore.balances}
          onMaxClick={vm.amount0MaxClickFunc}
          selectable
        />
        <SwitchTokensButton />
        <TokenInput
          decimals={vm.token1.decimals}
          amount={vm.amount1}
          assetId={vm.assetId1}
          setAssetId={handleSetAssetId1}
          balances={accountStore.balances}
          selectable
        />
        <SizedBox height={24} />
        <SwapButton />
        <SizedBox height={16} />
        <SwapDetailRow title="Route">
          <Row
            alignItems="center"
            mainAxisSize="fit-content"
            justifyContent="flex-end"
            style={{ cursor: "pointer" }}
            onClick={() => vm.setRoutingModalState(true)}
          >
            {vm.simpleRoute != null
              ? vm.simpleRoute.map((symbol, i) => (
                  <React.Fragment key={i}>
                    <Text style={{ lineHeight: 0 }}>{symbol}&nbsp;</Text>
                    {i !== vm.simpleRoute!.length - 1 && (
                      <ArrowIcon style={{ minWidth: 16 }} />
                    )}
                  </React.Fragment>
                ))
              : "—"}
            &nbsp;
            <ShowMoreIcon style={{ minWidth: 16, cursor: "pointer" }} />
          </Row>
        </SwapDetailRow>
        <Divider />
        <SwapDetailRow title="Price impact">
          <Row
            alignItems="center"
            mainAxisSize="fit-content"
            justifyContent="flex-end"
          >
            {vm.priceImpact && (
              <Text>~{vm.priceImpact.toFormat(4)}%&nbsp;</Text>
            )}
            {vm.token0 && !vm.amount0.isNaN() && (
              <Tooltip
                content={<TooltipFeeInfo />}
                config={{ placement: "top", trigger: "click" }}
              >
                <InfoIcon />
              </Tooltip>
            )}
          </Row>
        </SwapDetailRow>
      </Card>
      <SizedBox height={16} />
      <Details />
      <RoutingModal
        visible={vm.routingModalOpened}
        onClose={() => vm.setRoutingModalState(false)}
      />
    </Root>
  );
};
export default observer(Swap);
