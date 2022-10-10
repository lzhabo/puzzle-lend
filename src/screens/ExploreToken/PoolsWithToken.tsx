import styled from "@emotion/styled";
import React, { useMemo, useState } from "react";
import { useExploreTokenVM } from "@screens/ExploreToken/ExploreTokenVm";
import { observer } from "mobx-react-lite";
import Scrollbar from "@components/Scrollbar";
import Table from "@components/Table";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { useStores } from "@stores";
import SquareTokenIcon from "@components/SquareTokenIcon";
import TokenTags from "@screens/Invest/TokenTags";
import { useNavigate } from "react-router-dom";
import BN from "@src/utils/BN";
import { useTheme } from "@emotion/react";

interface IProps {}

const Root = styled.div<{ sort?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;

  .liquidity-group {
    width: 20px;
    height: 20px;
    transform: ${({ sort }) => (sort ? "scale(1)" : "scale(1, -1)")};
  }
`;

const PoolsWithToken: React.FC<IProps> = () => {
  const vm = useExploreTokenVM();
  const { poolsStore, accountStore } = useStores();
  const navigate = useNavigate();
  const [pools, setPools] = useState<any>([]);
  const [sortApy, setSortApy] = useState(true);
  const theme = useTheme();
  useMemo(() => {
    setPools(
      poolsStore.pools
        .filter(({ tokens }) =>
          tokens.map((t) => t.assetId).includes(vm.asset.assetId)
        )
        .sort((a, b) => {
          if (a.statistics?.apy != null && b.statistics?.apy != null) {
            if (new BN(a.statistics.apy).lt(b.statistics.apy)) {
              return sortApy ? 1 : -1;
            } else if (new BN(a.statistics.apy).eq(b.statistics.apy)) {
              return 0;
            } else {
              return sortApy ? -1 : 1;
            }
          } else if (a.statistics?.apy != null) {
            return -1;
          } else if (b.statistics?.apy != null) {
            return 1;
          }
          return 1;
        })
        .map((pool) => ({
          onClick: () => {
            navigate(`/pools/${pool.domain}/invest`);
          },
          poolName: (
            <Row>
              <SquareTokenIcon src={pool.logo} alt="logo" />
              <SizedBox width={8} />
              <Column crossAxisSize="max">
                <Row alignItems="center">
                  <Text
                    fitContent
                    style={{ whiteSpace: "nowrap" }}
                    weight={500}
                  >
                    {pool.title}
                  </Text>
                </Row>
                <TokenTags
                  tokens={pool.tokens}
                  findBalanceByAssetId={accountStore.findBalanceByAssetId}
                />
              </Column>
            </Row>
          ),
          apy: new BN(pool.statistics?.apy ?? 0).toFormat(2) + " %",
          value: "$ " + pool.globalLiquidity.toFormat(2),
        }))
    );
  }, [
    accountStore.findBalanceByAssetId,
    navigate,
    poolsStore.pools,
    sortApy,
    vm.asset.assetId,
  ]);
  const columns = React.useMemo(
    () => [
      {
        Header: "Pool name",
        accessor: "poolName",
      },
      {
        Header: "Pool value",
        accessor: "value",
      },
      {
        Header: () => (
          <Row style={{ cursor: "pointer" }}>
            <Text size="medium" fitContent>
              APY
            </Text>
            <img
              src={theme.images.icons.group}
              alt="group"
              className="liquidity-group"
              style={{ cursor: "pointer" }}
              onClick={() => setSortApy(!sortApy)}
            />
          </Row>
        ),
        accessor: "apy",
      },
    ],
    [sortApy, theme.images.icons.group]
  );
  return (
    <Root sort={sortApy}>
      <SizedBox height={40} />
      <Text weight={500} size="big">
        Pools with {vm.asset.name}
      </Text>
      <SizedBox height={16} />
      <Scrollbar style={{ maxWidth: "calc(100vw - 32px)", borderRadius: 16 }}>
        <Table
          columns={columns}
          data={pools}
          style={{
            whiteSpace: "nowrap",
            width: "fitContent",
            minWidth: "fit-content",
          }}
          withHover
        />
      </Scrollbar>
    </Root>
  );
};
export default observer(PoolsWithToken);
