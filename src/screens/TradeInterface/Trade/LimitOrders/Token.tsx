import styled from "@emotion/styled";
import React, { useState } from "react";
import TokenSelectModal from "@components/TokensSelectModal";
import Balance from "@src/entities/Balance";
import { Column, Row } from "@components/Flex";
import SquareTokenIcon from "@components/SquareTokenIcon";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import Img from "@components/Img";
import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";

interface IProps {
  assetId: string;
  balances: Balance[];
  setAssetId: (assetId: string) => void;
  balanceError?: boolean;
}

const Root = styled.div`
  cursor: pointer;
  display: flex;
  padding: 16px;
  background: ${({ theme }) => theme.colors.primary100};
  border-radius: 12px;
  align-items: center;
  justify-content: space-between;
`;

const Token: React.FC<IProps> = (props) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const token = props.balances.find(({ assetId }) => assetId === props.assetId);
  const theme = useTheme();

  return (
    <>
      <Root onClick={() => setOpenModal(true)}>
        <Row alignItems="center">
          <SquareTokenIcon size="small" src={token?.logo} />
          <SizedBox width={12} />
          <Text weight={500}>{token?.symbol}</Text>
        </Row>
        <Row alignItems="center" mainAxisSize="fit-content">
          <Column style={{ textAlign: "right" }}>
            <Text
              weight={500}
              size="medium"
              type={props.balanceError ? "error" : "primary"}
            >
              {token?.formatBalance}
            </Text>
            <Text type="secondary" size="small">
              ${token?.usdnEquivalent?.toFormat(2)}
            </Text>
          </Column>
          <SizedBox width={12} />
          <Img src={theme.images.icons.arrowDownWithBorder} alt="arrow" />
        </Row>
      </Root>
      <TokenSelectModal
        selectedTokenId={props.assetId}
        visible={openModal}
        onSelect={props.setAssetId}
        balances={props.balances}
        onClose={() => setOpenModal(false)}
      />
    </>
  );
};
export default observer(Token);
