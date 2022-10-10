import styled from "@emotion/styled";
import React, { useMemo, useState } from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Scrollbar from "@components/Scrollbar";
import Table from "@components/Table";
import { observer } from "mobx-react-lite";
import dayjs from "dayjs";
import { useExploreTokenVM } from "@screens/ExploreToken/ExploreTokenVm";
import BN from "@src/utils/BN";
import {
  EXPLORER_URL,
  TOKENS_BY_ASSET_ID,
  TOKENS_BY_SYMBOL,
} from "@src/constants";
import PoolAction from "@screens/InvestToPoolInterface/PoolHistory/PoolAction";
import Swap from "@screens/InvestToPoolInterface/PoolHistory/Swap";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const AggregatorHistory: React.FC<IProps> = () => {
  const vm = useExploreTokenVM();
  const [tr, setTr] = useState<any[]>([]);
  const columns = React.useMemo(
    () => [
      { Header: "Details", accessor: "details" },
      { Header: "Value", accessor: "value" },
      { Header: "Time", accessor: "time" },
    ],
    []
  );
  useMemo(() => {
    setTr(
      vm.operations.map((v) => {
        return {
          onClick: () => window.open(`${EXPLORER_URL}/tx/${v.id}`),
          details: (() => {
            switch (v.call?.function) {
              case "swap":
              case "swapWithReferral":
                const waves = TOKENS_BY_SYMBOL.WAVES;
                const t0 = TOKENS_BY_ASSET_ID[v.payment[0].assetId];
                const t1 = TOKENS_BY_ASSET_ID[v.call.args[0].value];
                return (
                  <Swap
                    token0={t0 ?? waves}
                    amount0={new BN(v.payment[0].amount)}
                    token1={t1 ?? waves}
                    amount1={new BN(v.call.args[1].value)}
                    hideZeros
                  />
                );
              case "generateIndexAndStake":
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
                return "–";
            }
          })(),
          value: v.payment
            .map(({ assetId, amount }: any) => {
              const token = TOKENS_BY_ASSET_ID[assetId];
              const units = BN.formatUnits(amount, token?.decimals).toFormat(2);
              return `${units} ${token?.symbol ?? "WAVES"}`;
            })
            .join(" ,"),
          time: (dayjs(v.timestamp) as any).fromNow(),
        };
      })
    );
  }, [vm.operations]);
  if (tr.length === 0) return null;
  return (
    <Root>
      <SizedBox height={40} />
      <Text weight={500} size="big">
        Operations with {vm.asset.name}
      </Text>
      <SizedBox height={16} />
      <Scrollbar style={{ maxWidth: "calc(100vw - 32px)", borderRadius: 16 }}>
        <Table
          columns={columns}
          data={tr}
          onLoadMore={vm.loadOperations}
          style={{
            width: "100%",
            whiteSpace: "nowrap",
            minWidth: "fit-content",
          }}
          loading={vm.loading}
        />
      </Scrollbar>
    </Root>
  );
};
export default observer(AggregatorHistory);
