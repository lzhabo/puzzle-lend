import styled from "@emotion/styled";
import { Column, Row } from "@src/components/Flex";
import Text from "@src/components/Text";
import React from "react";
import SizedBox from "@components/SizedBox";
import { useLimitOrdersVM } from "@screens/TradeInterface/LimitOrdersVM";
import { observer } from "mobx-react-lite";
import LimitTokenInput from "./LimitTokenInput";
import BN from "@src/utils/BN";
import { useStores } from "@stores";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;
const Note = styled.div`
  padding: 16px;
  gap: 4px;

  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 12px;
`;

const TextButton = styled(Text)<{ active?: boolean }>`
  width: fit-content;
  font-size: 14px;
  line-height: 20px;
  cursor: pointer;
  font-weight: ${({ active }) => (active ? 500 : 400)};
  color: ${({ theme, active }) =>
    active ? theme.colors?.primary800 : theme.colors?.primary650};
`;
const Percents = styled(Row)`
  & > * {
    :hover {
      color: ${({ theme }) => theme.colors.primary800};
    }
  }
`;
const Prices: React.FC<IProps> = () => {
  const vm = useLimitOrdersVM();
  const { accountStore } = useStores();
  const percents = [25, 50, 75, 100];

  return (
    <Root>
      <Column crossAxisSize="max">
        <Row>
          <TextButton
            onClick={() => vm.setPriceSettings(0)}
            active={vm.priceSettings === 0}
          >
            Custom price
          </TextButton>
          <SizedBox width={12} />
          <TextButton
            onClick={async () => {
              vm.setPriceSettings(1);
              await vm.getMarketPrice();
            }}
            active={vm.priceSettings === 1}
          >
            Market price
          </TextButton>
        </Row>
        <SizedBox height={4} />
        <LimitTokenInput
          placeholder={vm.priceSettings === 1 && vm.loading ? "..." : "0.00"}
          prefix={vm.token0.symbol}
          decimals={vm.token0.decimals}
          amount={vm.price}
          setAmount={vm.setPrice}
          usdnEquivalent={vm.dollEqForPrice}
          error={false}
          disabled={vm.priceSettings === 1}
          loading={vm.marketPriceLoading}
        />
      </Column>
      <SizedBox height={16} />
      <Column crossAxisSize="max">
        <Row>
          <TextButton
            onClick={() => vm.setPaymentSettings(0)}
            active={vm.paymentSettings === 0}
          >
            I want to pay
          </TextButton>
          <SizedBox width={12} />
          <TextButton
            onClick={() => vm.setPaymentSettings(1)}
            active={vm.paymentSettings === 1}
          >
            I want to get
          </TextButton>
        </Row>
        <SizedBox height={4} />
        <LimitTokenInput
          prefix={vm.tokenForPayment.symbol}
          decimals={vm.tokenForPayment.decimals}
          amount={vm.payment}
          setAmount={vm.setPayment}
          usdnEquivalent={vm.dollForPayment}
          error={vm.paymentError}
        />
        <SizedBox height={4} />
        {accountStore.address != null && vm.paymentSettings === 0 && (
          <Percents>
            {percents.map((v) => (
              <Text
                key={v}
                fitContent
                type="blue500"
                size="small"
                style={{ paddingRight: 12, cursor: "pointer" }}
                onClick={() => vm.onPercentClick(v)}
              >
                {v}%{" "}
              </Text>
            ))}
          </Percents>
        )}
      </Column>
      <SizedBox height={16} />
      <Note>
        <Text
          size="big"
          type={
            vm.paymentSettings === 1 && vm.paymentError ? "error" : "primary"
          }
        >
          {vm.paymentSettings === 0
            ? `You’ll get ${BN.formatUnits(
                vm.finalAmount,
                vm.token1.decimals
              ).toFormat(2)} ${vm.token1.symbol}`
            : `You’ll pay ${BN.formatUnits(
                vm.finalAmount,
                vm.token0.decimals
              ).toFormat(2)} ${vm.token0.symbol}`}
        </Text>
        <SizedBox height={4} />
        <Text type="secondary" size="medium">
          Transaction fee 0.005 WAVES
        </Text>
      </Note>
    </Root>
  );
};
export default observer(Prices);
