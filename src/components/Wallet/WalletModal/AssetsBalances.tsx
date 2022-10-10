import React, { HTMLAttributes } from "react";
import { observer } from "mobx-react-lite";
import { useWalletVM } from "@components/Wallet/WalletModal/WalletVM";
import InvestRow from "@components/InvestRow";
import { Column } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import Button from "@components/Button";
import { ReactComponent as NotFoundIcon } from "@src/assets/notFound.svg";
import styled from "@emotion/styled";
import { useStores } from "@stores";
import Skeleton from "react-loading-skeleton";
import BN from "@src/utils/BN";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 400px;
`;

const AssetsBalances: React.FC<IProps> = () => {
  const vm = useWalletVM();
  const { accountStore } = useStores();
  if (accountStore.assetBalances === null)
    return (
      <Root style={{ padding: "0 24px" }}>
        <Skeleton height={56} style={{ marginBottom: 8 }} count={3} />
      </Root>
    );
  //todo
  return (
    <Root>
      {vm.balances.length !== 0 ? (
        vm.balances.map((b) => {
          return (
            <InvestRow
              rateChange={BN.ZERO}
              key={b.assetId}
              logo={b.logo}
              topLeftInfo={b.name}
              topRightInfo={b.formatBalance}
              bottomLeftInfo={"$ "}
              bottomRightInfo={b.formatUsdnEquivalent}
              withClickLogic
              onClick={() => {
                accountStore.setAssetToSend(b);
                accountStore.setSendAssetModalOpened(true);
              }}
            />
          );
        })
      ) : (
        <Column justifyContent="center" alignItems="center" crossAxisSize="max">
          <SizedBox height={16} />
          <NotFoundIcon />
          <Text type="secondary" size="medium" textAlign="center">
            You don’t have any assets on your wallet.
            <br />
            Buy WAVES on Waves Exchange to start trading.
          </Text>
          <SizedBox height={16} />
          <Button size="medium">Buy WAVES</Button>
          <SizedBox height={100} />
        </Column>
      )}
    </Root>
  );
};
export default observer(AssetsBalances);
