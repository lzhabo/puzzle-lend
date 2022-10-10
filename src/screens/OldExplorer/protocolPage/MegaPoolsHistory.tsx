import styled from "@emotion/styled";
import React, { useMemo, useState } from "react";
import TitleWithTips from "@components/TitleWithTips";
import { observer } from "mobx-react-lite";
import SizedBox from "@components/SizedBox";
import Scrollbar from "@components/Scrollbar";
import Table from "@components/Table";
import { useStores } from "@stores";
import centerEllipsis from "@src/utils/centerEllipsis";
import dayjs from "dayjs";
import PoolAction from "@screens/InvestToPoolInterface/PoolHistory/PoolAction";
import BN from "@src/utils/BN";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import { useOldExploreVM } from "@screens/OldExplorer/OldExploreVm";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const MegaPoolsHistory: React.FC<IProps> = () => {
  const vm = useOldExploreVM();
  const [tr, setTr] = useState<any[]>([]);
  const { poolsStore } = useStores();

  //todo in progress
  useMemo(() => {
    const data = vm.megaPolsInvestHistory.map((v) => ({
      details: (() => {
        switch (v.call?.function) {
          case "generateIndexAndStake":
            // const addedTokens = v.payment.map(({ assetId, amount }) => ({
            //   amount: new BN(amount),
            //   ...TOKENS_BY_ASSET_ID[assetId ?? "WAVES"],
            // }));
            // const totalAddedUsdn = addedTokens.reduce(
            //   (acc, { assetId, amount, decimals }) => {
            //     const rate = poolsStore.usdnRate(assetId, 1) ?? BN.ZERO;
            //     const am = BN.formatUnits(amount, decimals);
            //     return acc.plus(am.times(rate));
            //   },
            //   BN.ZERO
            // );
            // amount = totalAddedUsdn;
            // return <PoolAction tokens={addedTokens} action="add" />;
            return "generateIndexAndStake";
          case "generateIndexWithOneTokenAndStake":
            const oneToken = {
              amount: new BN(v.payment[0].amount),
              ...TOKENS_BY_ASSET_ID[v.payment[0].assetId ?? "WAVES"],
            };
            return <PoolAction tokens={[oneToken]} action="add" />;
          case "unstakeAndRedeemIndex":
            const removedTokens =
              v.stateChanges[0].invokes[1].stateChanges.transfers.map(
                ({ asset, amount }: { asset: string; amount: number }) => ({
                  amount: new BN(amount),
                  ...TOKENS_BY_ASSET_ID[asset ?? "WAVES"],
                })
              );
            return <PoolAction tokens={removedTokens} action="remove" />;
          case "claimIndexRewards":
            const claimedTokens = v.stateChanges.transfers.map(
              ({ asset, amount }: any) => ({
                amount: new BN(amount),
                ...TOKENS_BY_ASSET_ID[asset ?? "WAVES"],
              })
            );
            return <PoolAction tokens={claimedTokens} action="claim" />;
          default:
            return null;
        }
      })(),
      poolName: poolsStore.pools.find(({ domain }) => v.domain === domain)
        ?.title,
      value: (() => {
        switch (v.call?.function) {
          case "generateIndexAndStake":
            const addedTokens = v.payment.map(({ assetId, amount }: any) => ({
              amount: new BN(amount),
              ...TOKENS_BY_ASSET_ID[assetId ?? "WAVES"],
            }));
            const totalAddedUsdn = addedTokens.reduce(
              (acc: any, { assetId, amount, decimals }: any) => {
                const rate = poolsStore.usdnRate(assetId, 1) ?? BN.ZERO;
                const am = BN.formatUnits(amount, decimals);
                return acc.plus(am.times(rate));
              },
              BN.ZERO
            );
            return totalAddedUsdn.toFormat(2);
          case "generateIndexWithOneTokenAndStake":
            const t = {
              ...TOKENS_BY_ASSET_ID[v.payment[0].assetId ?? "WAVES"],
              amount: new BN(v.payment[0].amount),
            };
            const am = BN.formatUnits(t.amount, t.decimals);
            const rate = poolsStore.usdnRate(t.assetId, 1) ?? BN.ZERO;
            return "$ " + am.times(rate).toFormat(2);
          case "unstakeAndRedeemIndex":
            const removedTokens =
              v.stateChanges[0].invokes[1].stateChanges.transfers.map(
                ({ asset, amount }: { asset: string; amount: number }) => ({
                  amount: new BN(amount),
                  ...TOKENS_BY_ASSET_ID[asset ?? "WAVES"],
                })
              );
            const totalRemovedTokenUsdn = removedTokens.reduce(
              (acc: any, { assetId, amount, decimals }: any) => {
                const tokenAmount = BN.formatUnits(amount, decimals);
                const rate = poolsStore.usdnRate(assetId, 1) ?? BN.ZERO;
                return acc.plus(rate.times(tokenAmount));
              },
              BN.ZERO
            );
            return "$ " + totalRemovedTokenUsdn.toFormat(2);
          case "claimIndexRewards":
            // const claimedTokens = v.stateChanges.transfers.map(
            //   ({ asset, amount }) => ({
            //     amount: new BN(amount),
            //     ...TOKENS_BY_ASSET_ID[asset ?? "WAVES"],
            //   })
            // );
            // const totalClaimedUsdn = claimedTokens.reduce(
            //   (acc, { assetId, amount, decimals }) => {
            //     const rate = poolsStore.usdnRate(assetId, 1) ?? BN.ZERO;
            //     const am = BN.formatUnits(amount, decimals);
            //     return acc.plus(rate.times(am));
            //   },
            //   BN.ZERO
            // );
            // amount = totalClaimedUsdn;
            // return <PoolAction tokens={claimedTokens} action="claim" />;
            return "claimIndexRewards";
          default:
            return "default";
        }
      })(),
      account: centerEllipsis(v.sender, 6),
      time: (dayjs(v.timestamp) as any).fromNow(),
    }));
    setTr(data);
  }, [poolsStore, vm.megaPolsInvestHistory]);
  const columns = React.useMemo(
    () => [
      { Header: "Details", accessor: "details" },
      { Header: "Pool", accessor: "poolName" },
      { Header: "Value", accessor: "value" },
      { Header: "Account", accessor: "account" },
      { Header: "Time", accessor: "time" },
    ],
    []
  );
  if (tr.length === 0) return null;
  return (
    <Root>
      <TitleWithTips
        title="Megapools invest history"
        description="Megapools invest history"
      />
      <SizedBox height={8} />
      <Scrollbar style={{ maxWidth: "calc(100vw - 32px)", borderRadius: 16 }}>
        <Table
          style={{ minWidth: 900 }}
          columns={columns}
          data={tr}
          onLoadMore={vm.syncMegaPolsInvestHistory}
          loading={vm.loading}
        />
      </Scrollbar>
    </Root>
  );
};
export default observer(MegaPoolsHistory);
