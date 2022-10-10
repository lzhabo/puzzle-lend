import styled from "@emotion/styled";
import React from "react";
import { useLimitOrdersVM } from "@screens/TradeInterface/LimitOrdersVM";
import { observer } from "mobx-react-lite";
import { Column } from "@src/components/Flex";
import Text from "@src/components/Text";
import SizedBox from "@components/SizedBox";
import Order from "./Order";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;
const Orders = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.white};
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 16px;
  padding: 18px;
  box-sizing: border-box;

  & > * {
    padding: 10px 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.primary100};
  }

  & > :first-of-type {
    padding-top: 0;
  }

  & > :last-of-type {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const OrderHistory: React.FC<IProps> = () => {
  const vm = useLimitOrdersVM();
  return (
    <Root>
      {vm.orders.length === 0 && (
        <Text textAlign="center">
          Your orders will show up here. Create an order above this section!
        </Text>
      )}
      {Object.entries(vm.groupedOrders()).map(([time, orders]) => (
        <Column key={time} crossAxisSize="max">
          <Text type="secondary" size="small">
            {time}
          </Text>
          <SizedBox height={8} />
          <Orders>
            {orders.map((o) => (
              <Order
                key={o.id}
                onClick={() => vm.setOrderToDisplayDetails(o)}
                {...o}
              />
            ))}
          </Orders>
          <SizedBox height={24} />
        </Column>
      ))}
    </Root>
  );
};
export default observer(OrderHistory);
