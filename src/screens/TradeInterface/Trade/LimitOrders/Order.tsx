import styled from "@emotion/styled";
import React from "react";
import { IOrder } from "@screens/TradeInterface/LimitOrdersVM";
import Text from "@components/Text";
import { Column, Row } from "@src/components/Flex";
import SizedBox from "@components/SizedBox";
import Img from "@components/Img";
import { useTheme } from "@emotion/react";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import BN from "@src/utils/BN";
import { ReactComponent as CloseIcon } from "@src/assets/icons/cancelOrder.svg";
import CircularProgressbar from "@src/components/CircularProgressbar";

interface IProps extends IOrder {
  onCancel?: () => void;
  onClick?: () => void;
}

const Root = styled.div`
  display: flex;
  align-items: center;
`;

const Order: React.FC<IProps> = ({
  fulfilled0,
  amount1,
  amount0,
  token1,
  token0,
  status,
  onCancel,
  onClick,
}) => {
  const theme = useTheme();
  const t0 = TOKENS_BY_ASSET_ID[token0];
  const t1 = TOKENS_BY_ASSET_ID[token1];
  const am0 = BN.formatUnits(amount0, t0.decimals);
  const am1 = BN.formatUnits(amount1, t1.decimals);
  const percent = fulfilled0.times(100).div(amount0);
  const price = am0.div(am1);
  return (
    <Root>
      <Row alignItems="center" onClick={onClick} style={{ cursor: "pointer" }}>
        <CircularProgressbar
          percent={percent.toNumber()}
          red={status === "canceled"}
        />
        <SizedBox width={10} />
        <Column>
          <Row alignItems="center">
            <Text size="medium" fitContent weight={500}>
              {am0.toFormat(2)} {t0.symbol}
            </Text>
            <SizedBox width={2} />
            <Img
              height="16px"
              width="16px"
              src={theme.images.icons.orderRightArrow}
            />
            <SizedBox width={2} />
            <Text size="medium" fitContent weight={500}>
              {am1.toFormat(2)} {t1.symbol}
            </Text>
          </Row>
          <Text type="secondary" size="small">
            Price: {price.toFormat(2)} {t0.symbol}
          </Text>
        </Column>
      </Row>
      {onCancel && (
        <Row
          mainAxisSize="fit-content"
          alignItems="center"
          justifyContent="center"
          style={{ cursor: "pointer" }}
          onClick={onCancel}
        >
          <CloseIcon style={{ height: 16, width: 16 }} />
          <SizedBox width={2} />
          <Text size="medium" weight={500} type="blue500" fitContent>
            Cancel
          </Text>
        </Row>
      )}
    </Root>
  );
};
export default Order;
