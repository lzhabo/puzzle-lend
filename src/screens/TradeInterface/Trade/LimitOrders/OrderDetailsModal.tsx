import React from "react";
import Dialog from "@components/Dialog";
import Text from "@components/Text";
import styled from "@emotion/styled";
import SizedBox from "@components/SizedBox";
import { useLimitOrdersVM } from "@screens/TradeInterface/LimitOrdersVM";
import { Column, Row } from "@src/components/Flex";
import { EXPLORER_URL, TOKENS_BY_ASSET_ID } from "@src/constants";
import Img from "@components/Img";
import { useTheme } from "@emotion/react";
import BN from "@src/utils/BN";
import dayjs from "dayjs";
import Progressbar from "@components/Progressbar";
import Button from "@src/components/Button";
import cross from "@src/assets/icons/cross.svg";
import { Anchor } from "@components/Anchor";

interface IProps {
  onClose: () => void;
  visible: boolean;
}

const Icon = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
`;
const Details = styled(Column)`
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
const Btn = styled(Button)`
  background-color: transparent;
  color: ${({ theme }) => `${theme.colors.error500}`};
  border-color: ${({ theme }) => `${theme.colors.error100}`};
  :hover {
    background-color: transparent;
  }
`;
const OrderDetailsModal: React.FC<IProps> = ({ ...rest }) => {
  const { orderToDisplayDetails: order, checkOrderCancel } = useLimitOrdersVM();
  const token0 = TOKENS_BY_ASSET_ID[order?.token0 ?? ""];
  const token1 = TOKENS_BY_ASSET_ID[order?.token1 ?? ""];
  const am0 = BN.formatUnits(order?.amount0 ?? BN.ZERO, token0?.decimals);
  const am1 = BN.formatUnits(order?.amount1 ?? BN.ZERO, token1?.decimals);
  const theme = useTheme();
  const percent = order?.fulfilled0?.times(100).div(order?.amount0);
  const price = am1.div(am0);
  const data = [
    { key: "From", value: `${am0.toFormat(2)} ${token0?.symbol}` },
    { key: "Price", value: `${price.toFormat(2)} ${token1?.symbol}` },
    { key: "To", value: `${am1.toFormat(2)} ${token1?.symbol}` },
    { key: "Transaction fee", value: "0.005 WAVES" },
  ];
  return (
    <Dialog style={{ maxWidth: 360 }} title="Order details" {...rest}>
      <SizedBox height={24} />
      <Column crossAxisSize="max">
        <Row
          justifyContent="center"
          style={{ position: "relative", height: 40 }}
        >
          <Icon
            src={token0?.logo}
            alt="token0"
            style={{ position: "absolute", right: "calc(50% - 10px)" }}
          />
          <Icon
            src={token1?.logo}
            alt="token1"
            style={{ position: "absolute", right: "calc(50% - 40px)" }}
          />
        </Row>
        <SizedBox height={12} />
        <Row justifyContent="center" alignItems="center">
          <Text size="medium" fitContent weight={500}>
            {am0.toFormat(2)} {token0?.symbol}
          </Text>
          <SizedBox width={2} />
          <Img
            height="16px"
            width="16px"
            src={theme.images.icons.orderRightArrow}
          />
          <SizedBox width={2} />
          <Text size="medium" fitContent weight={500}>
            {am1.toFormat(2)} {token1?.symbol}
          </Text>
        </Row>
        <SizedBox height={4} />
        <Text size="medium" type="secondary" textAlign="center">
          {dayjs(order?.timestamp).format("MMM DD YYYY, HH:mm:ss")}
        </Text>
        <SizedBox height={24} />
        <Column crossAxisSize="max">
          <Row justifyContent="space-between">
            <Text weight={500} fitContent>
              Order progress
            </Text>
            <Text type="secondary" fitContent>
              {percent?.toFormat(2)} %
            </Text>
          </Row>
          <SizedBox height={8} />
          <Progressbar percent={percent?.toNumber() ?? 0} />
        </Column>
        <SizedBox height={24} />
        <Details crossAxisSize="max">
          {data.map(({ key, value }, v) => (
            <Row key={v} justifyContent="space-between">
              <Text fitContent size="medium" type="secondary">
                {key}
              </Text>
              <Text textAlign="right" fitContent size="medium">
                {value}
              </Text>
            </Row>
          ))}
        </Details>
        <SizedBox height={34} />
        <Column crossAxisSize="max" justifyContent="center">
          {order?.status === "active" && (
            <Btn
              size="medium"
              fixed
              kind="danger"
              onClick={() => checkOrderCancel(order?.id)}
            >
              <Img src={cross} alt="add" />
              <SizedBox width={12} />
              Cancel order
            </Btn>
          )}
          {order?.txId && (
            <Anchor
              style={{ paddingTop: 12, width: "100%" }}
              href={`${EXPLORER_URL}/tx/${order.txId}`}
            >
              <Text weight={500} textAlign="center" type="blue500">
                View in Waves Explorer
              </Text>
            </Anchor>
          )}
        </Column>
        <SizedBox height={34} />
      </Column>
    </Dialog>
  );
};
export default OrderDetailsModal;
