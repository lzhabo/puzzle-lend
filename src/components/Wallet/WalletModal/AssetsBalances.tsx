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
import { Anchor } from "@components/Anchor";

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
        <Skeleton height={56} style={{ marginBottom: 8 }} count={4} />
      </Root>
    );

  return (
    <Root>
      {vm.userAssets.length !== 0 ? (
        vm.userAssets.map((b) => {
          const stats = vm.tokenStats(b.assetId);
          const dollarEquivalent = new BN(b.formatBalance ?? 0)
            .times(stats?.prices?.min ?? BN.ZERO)
            .toFormat(2);

          return (
            <InvestRow
              rateChange={BN.ZERO}
              key={b.assetId}
              logo={b.logo}
              topLeftInfo={b.name}
              topRightInfo={b.formatBalance}
              bottomLeftInfo={`$ ${stats?.prices.min}`}
              bottomRightInfo={dollarEquivalent}
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
          <Anchor href="https://waves.exchange/trading/spot/WAVES_USDN">
            <Button size="medium">Buy WAVES</Button>
          </Anchor>
          <SizedBox height={100} />
        </Column>
      )}
    </Root>
  );
};
export default observer(AssetsBalances);
