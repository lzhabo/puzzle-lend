import styled from "@emotion/styled";
import React from "react";
import Card from "@components/Card";
import SettingsHeader from "@screens/TradeInterface/Trade/SettingsHeader";
import SizedBox from "@components/SizedBox";
import Tokens from "./Tokens";
import Prices from "./Prices";
import MyOrders from "./MyOrders";
import useWindowSize from "@src/hooks/useWindowSize";
import { useSwapVM } from "@screens/TradeInterface/SwapVM";
import PlaceOrderBtn from "@screens/TradeInterface/Trade/LimitOrders/PlaceOrderBtn";
import DialogNotification from "@components/Dialog/DialogNotification";
import { useLimitOrdersVM } from "@screens/TradeInterface/LimitOrdersVM";
import { observer } from "mobx-react-lite";
import OrderDetailsModal from "./OrderDetailsModal";

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

const LimitOrders: React.FC<IProps> = ({ ...rest }) => {
  const { width } = useWindowSize();
  const { openedChart } = useSwapVM();
  const vm = useLimitOrdersVM();
  return (
    <Root {...rest}>
      <Card
        style={{ position: "relative" }}
        paddingDesktop="16px 24px"
        paddingMobile="16px"
      >
        <SettingsHeader />
        <Tokens />
        <SizedBox height={16} />
        <Prices />
        <SizedBox height={16} />
        <PlaceOrderBtn />
      </Card>

      <SizedBox height={40} />
      {((width && width < 880) || !openedChart) && <MyOrders />}
      <DialogNotification
        onClose={() => vm.setNotificationParams(null)}
        icon={vm.notificationParams?.icon}
        title={vm.notificationParams?.title ?? ""}
        description={vm.notificationParams?.description}
        buttonsDirection={vm.notificationParams?.buttonsDirection}
        type={vm.notificationParams?.type}
        buttons={vm.notificationParams?.buttons}
        style={{ maxWidth: 360 }}
        visible={vm.notificationParams != null}
      />
      <OrderDetailsModal
        visible={vm.orderToDisplayDetails != null}
        onClose={() => vm.setOrderToDisplayDetails(null)}
      />
    </Root>
  );
};

export default observer(LimitOrders);
