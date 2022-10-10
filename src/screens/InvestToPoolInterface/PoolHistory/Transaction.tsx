import styled from "@emotion/styled";
import React from "react";
import { Row } from "@components/Flex";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";
import { ITransaction } from "@src/utils/types";
import { EXPLORER_URL, TOKENS_BY_ASSET_ID } from "@src/constants";
import Swap from "./Swap";
import BN from "@src/utils/BN";
import dayjs from "dayjs";
import PoolAction from "./PoolAction";

interface IProps extends ITransaction {
  usdnRate: (assetId: string, coefficient: number) => BN | null;
}

const Root = styled(Row)`
  box-sizing: border-box;
  padding: 16px !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  @media (min-width: 880px) {
    padding: 16px 24px !important;
  }
`;
const Transaction: React.FC<IProps> = ({
  id,
  timestamp,
  call,
  stateChanges,
  usdnRate,
  payment,
}) => {
  if (
    ![
      "swap",
      "swapWithReferral",
      "generateIndexAndStake",
      "generateIndexWithOneTokenAndStake",
      "unstakeAndRedeemIndex",
      "claimIndexRewards",
    ].some((v) => v === call?.function)
  ) {
    return null;
  }
  let amount: BN | null = BN.ZERO;

  const draw = () => {
    switch (call?.function) {
      case "swap":
      case "swapWithReferral":
        const token0 = TOKENS_BY_ASSET_ID[payment[0].assetId ?? "WAVES"];
        const amount0 = new BN(payment[0].amount);
        const token1 =
          TOKENS_BY_ASSET_ID[stateChanges.transfers[0]?.asset ?? ""];
        const am1 =
          call.args[1].type === "list"
            ? stateChanges.transfers[0].amount
            : call.args[1].value;
        const amount1 = new BN(am1);
        amount = token1 != null ? BN.formatUnits(am1, token1?.decimals) : null;
        if (token1 != null) {
          const rate = usdnRate(token1.assetId, 1) ?? BN.ZERO;
          amount = BN.formatUnits(amount1.times(rate), token1.decimals);
        } else {
          amount = null;
        }
        return amount ? (
          <Swap
            token0={token0}
            amount0={amount0}
            token1={token1}
            amount1={amount1}
          />
        ) : null;
      case "generateIndexAndStake":
        const addedTokens = payment.map(({ assetId, amount }) => ({
          amount: new BN(amount),
          ...TOKENS_BY_ASSET_ID[assetId ?? "WAVES"],
        }));
        const totalAddedUsdn = addedTokens.reduce(
          (acc, { assetId, amount, decimals }) => {
            const rate = usdnRate(assetId, 1) ?? BN.ZERO;
            const am = BN.formatUnits(amount, decimals);
            return acc.plus(am.times(rate));
          },
          BN.ZERO
        );
        amount = totalAddedUsdn;
        return <PoolAction tokens={addedTokens} action="add" />;
      case "generateIndexWithOneTokenAndStake":
        const oneToken = {
          amount: new BN(payment[0].amount),
          ...TOKENS_BY_ASSET_ID[payment[0].assetId ?? "WAVES"],
        };
        const am = BN.formatUnits(oneToken.amount, oneToken.decimals);
        const rate = usdnRate(oneToken.assetId, 1) ?? BN.ZERO;
        amount = am.times(rate);
        return <PoolAction tokens={[oneToken]} action="add" />;
      case "unstakeAndRedeemIndex":
        const removedTokens =
          stateChanges.invokes[1].stateChanges.transfers.map(
            ({ asset, amount }) => ({
              amount: new BN(amount),
              ...TOKENS_BY_ASSET_ID[asset ?? "WAVES"],
            })
          );
        const totalRemovedTokenUsdn = removedTokens.reduce(
          (acc, { assetId, amount, decimals }) => {
            const tokenAmount = BN.formatUnits(amount, decimals);
            const rate = usdnRate(assetId, 1) ?? BN.ZERO;
            return acc.plus(rate.times(tokenAmount));
          },
          BN.ZERO
        );
        amount = totalRemovedTokenUsdn;
        return <PoolAction tokens={removedTokens} action="remove" />;
      case "claimIndexRewards":
        const claimedTokens = stateChanges.transfers.map(
          ({ asset, amount }) => ({
            amount: new BN(amount),
            ...TOKENS_BY_ASSET_ID[asset ?? "WAVES"],
          })
        );
        const totalClaimedUsdn = claimedTokens.reduce(
          (acc, { assetId, amount, decimals }) => {
            const rate = usdnRate(assetId, 1) ?? BN.ZERO;
            const am = BN.formatUnits(amount, decimals);
            return acc.plus(rate.times(am));
          },
          BN.ZERO
        );
        amount = totalClaimedUsdn;
        return <PoolAction tokens={claimedTokens} action="claim" />;
      default:
        return null;
    }
  };
  const details = draw();
  return details != null ? (
    <Root
      className="gridRow"
      alignItems="center"
      onClick={() => window.open(`${EXPLORER_URL}/transactions/${id}`)}
    >
      <Row alignItems="center">{details}</Row>
      <Text fitContent nowrap>
        ${amount?.toFormat(2)}
      </Text>
      <Text fitContent nowrap>
        {(dayjs(timestamp) as any).fromNow()}
      </Text>
    </Root>
  ) : null;
};
export default observer(Transaction);
