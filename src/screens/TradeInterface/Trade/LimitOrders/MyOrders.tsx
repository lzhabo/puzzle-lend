import styled from "@emotion/styled";
import React, { useState } from "react";
import Tabs from "@components/Tabs";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { useStores } from "@stores";
import { Column, Row } from "@src/components/Flex";
import Button from "@components/Button";
import { observer } from "mobx-react-lite";
import OrdersHistory from "@screens/TradeInterface/Trade/LimitOrders/OrdersHistory";
import OpenedOrders from "@screens/TradeInterface/Trade/LimitOrders/OpenedOrders";
import { ReactComponent as CloseIcon } from "@src/assets/icons/cancelOrder.svg";
import { useLimitOrdersVM } from "@screens/TradeInterface/LimitOrdersVM";
import Skeleton from "react-loading-skeleton";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;
const MyOrders: React.FC<IProps> = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { accountStore } = useStores();
  const vm = useLimitOrdersVM();
  const handleCancelAll = () => {};
  return (
    <Root>
      <Text weight={500} style={{ fontSize: "24px", lineHeight: " 32px" }}>
        My orders
      </Text>
      <SizedBox height={24} />
      <Row style={{ position: "relative" }}>
        <Tabs
          tabs={[{ name: "Open" }, { name: "History" }]}
          activeTab={activeTab}
          setActive={(v) => setActiveTab(v)}
        />
        {accountStore.address != null &&
          activeTab === 0 &&
          vm.isThereOpenedOrders && (
            <Row
              mainAxisSize="fit-content"
              alignItems="center"
              justifyContent="center"
              style={{ cursor: "pointer", position: "absolute", right: 0 }}
              onClick={handleCancelAll}
            >
              <CloseIcon style={{ height: 16, width: 16 }} />
              <SizedBox width={2} />
              <Text
                size="medium"
                weight={500}
                type="blue500"
                fitContent
                onClick={() => vm.checkOrderCancel("", true)}
              >
                Cancel all
              </Text>
            </Row>
          )}
      </Row>
      <SizedBox height={40} />
      {accountStore.address == null ? (
        <Column justifyContent="center" alignItems="center" crossAxisSize="max">
          <Text fitContent>Connect your wallet to see your order history</Text>
          <SizedBox height={24} />
          <Button
            kind="secondary"
            size="medium"
            onClick={() => accountStore.setLoginModalOpened(true)}
          >
            Connect wallet
          </Button>
        </Column>
      ) : vm.initialized ? (
        <>
          {activeTab === 0 && <OpenedOrders />}
          {activeTab === 1 && <OrdersHistory />}
        </>
      ) : (
        <Skeleton height={56} style={{ marginBottom: 8 }} count={3} />
      )}
    </Root>
  );
};
export default observer(MyOrders);
