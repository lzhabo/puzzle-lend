import React, { useMemo, useState } from "react";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import PoolNotFound from "@screens/Invest/PoolNotFound";
import { useStores } from "@src/stores";
import { useInvestVM } from "@screens/Invest/InvestVm";
import SizedBox from "@components/SizedBox";
import { tokenCategoriesEnum } from "@components/TokensSelectModal/TokenSelectModal";
import Table from "@src/components/Table";
import TokenTags from "@screens/Invest/TokenTags";
import SquareTokenIcon from "@components/SquareTokenIcon";
import Scrollbar from "@components/Scrollbar";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import BN from "@src/utils/BN";
import Checkbox from "@components/Checkbox";
import Tag from "@src/components/Tag";
import { useTheme } from "@emotion/react";

const PoolsTable: React.FC = () => {
  const { poolsStore, accountStore } = useStores();
  const [activeSort, setActiveSort] = useState<0 | 1>(1);
  const [showEmptyBalances, setShowEmptyBalances] = useState(true);
  const vm = useInvestVM();
  const navigate = useNavigate();
  const theme = useTheme();

  const columns = React.useMemo(
    () => [
      { Header: "Pool name", accessor: "poolName" },
      { Header: "My balance", accessor: "accountBalance" },
      {
        Header: () => (
          <Row style={{ cursor: "pointer" }}>
            <Text size="medium" fitContent>
              Liquidity
            </Text>
            <img
              src={theme.images.icons.group}
              alt="group"
              className="liquidity-group"
              onClick={() => {
                setActiveSort(0);
                vm.setSortLiquidity(!vm.sortLiquidity);
              }}
            />
          </Row>
        ),
        accessor: "liquidity",
      },
      { Header: "Volume (30d)", accessor: "volume" },
      {
        accessor: "apy",
        Header: () => (
          <Row style={{ cursor: "pointer" }}>
            <Text size="medium" fitContent>
              APY
            </Text>
            <img
              src={theme.images.icons.group}
              alt="group"
              className="apy-group"
              onClick={() => {
                setActiveSort(1);
                vm.setSortApy(!vm.sortApy);
              }}
            />
          </Row>
        ),
      },
    ],
    [vm, theme.images.icons.group]
  );
  const [filteredPools, setFilteredPools] = useState<any[]>([]);
  useMemo(() => {
    const data = vm.pools
      .filter(({ domain }) => domain !== "puzzle")
      .filter((pool) => {
        if (!showEmptyBalances) {
          const data = poolsStore.accountPoolsLiquidity?.find(
            (v) => pool.domain === v.pool.domain
          );
          return data?.liquidityInUsdn != null && data.liquidityInUsdn.gt(0);
        }
        return true;
      })
      .sort((a, b) => {
        if (activeSort === 0) {
          if (a.globalLiquidity != null && b.globalLiquidity != null) {
            if (a.globalLiquidity.lt(b.globalLiquidity)) {
              return vm.sortLiquidity ? 1 : -1;
            } else {
              return vm.sortLiquidity ? -1 : 1;
            }
          }
        } else if (activeSort === 1) {
          const apy0 =
            a.statistics?.boostedApy != null
              ? a.statistics?.boostedApy
              : a.statistics?.apy;
          const apy1 =
            b.statistics?.boostedApy != null
              ? b.statistics?.boostedApy
              : b.statistics?.apy;
          if (apy0 != null && apy1 != null) {
            if (new BN(apy0).lt(apy1)) {
              return vm.sortApy ? 1 : -1;
            } else if (new BN(apy0).eq(apy1)) {
              return 0;
            } else {
              return vm.sortApy ? -1 : 1;
            }
          } else if (apy0 != null) {
            return -1;
          } else if (apy1 != null) {
            return 1;
          }
        }
        return 1;
      })
      .filter(({ title, tokens }) =>
        vm.searchValue
          ? [title, ...tokens.map(({ symbol }) => symbol)]
              .map((v) => v?.toLowerCase())
              .some((v) => v?.includes(vm.searchValue?.toLowerCase()))
          : true
      )
      .filter((pool) => {
        if (vm.poolCategoryFilter === 0) return true;
        const poolsCategories = pool.tokens.reduce(
          (acc, { category }) =>
            category != null ? [...acc, ...category] : [...acc],
          [] as string[]
        );
        const categories = poolsCategories.filter(
          (category) => tokenCategoriesEnum[vm.poolCategoryFilter] === category
        );
        return categories.length > 1;
      })
      .filter(({ isCustom }) => {
        if (vm.customPoolFilter === 0) return true;
        if (vm.customPoolFilter === 1) return isCustom;
        if (vm.customPoolFilter === 2) return !isCustom;
        return false;
      })
      .map((pool) => ({
        onClick: () => navigate(`/pools/${pool.domain}/invest`),
        disabled:
          pool.statistics == null && pool.owner !== accountStore.address,
        poolName: (
          <Row>
            <SquareTokenIcon src={pool.logo} alt="logo" />
            <SizedBox width={8} />
            <Column crossAxisSize="max">
              <Row alignItems="center">
                <Text fitContent style={{ whiteSpace: "nowrap" }} weight={500}>
                  {pool.title}
                </Text>
                <SizedBox width={4} />
                {pool.statistics?.boostedApy != null && (
                  <Tag background={theme.colors.blue500} type="primary">
                    Boosted APY 🚀
                  </Tag>
                )}
              </Row>
              <TokenTags
                tokens={pool.tokens}
                findBalanceByAssetId={accountStore.findBalanceByAssetId}
              />
            </Column>
          </Row>
        ),
        accountBalance: (() => {
          const data = poolsStore.accountPoolsLiquidity?.find(
            (v) => pool.domain === v.pool.domain
          );
          return data?.liquidityInUsdn != null && data.liquidityInUsdn.gt(0)
            ? `$${data.liquidityInUsdn.toFormat(2)}`
            : "—";
        })(),
        liquidity: "$ " + pool.globalLiquidity.toFormat(2),
        volume: (() => {
          const volume =
            pool.statistics != null
              ? new BN(pool.statistics.monthlyVolume).toFormat(2)
              : null;
          return volume != null ? `$ ${volume}` : "—";
        })(),
        apy: (
          <Row>
            {pool.statistics?.boostedApy != null ? (
              <Row alignItems="center">
                <Text fitContent type="secondary" crossed>
                  {new BN(pool.statistics.apy).toFormat(2).concat(" %")}
                </Text>
                <SizedBox width={2} />
                {new BN(pool.statistics.apy)
                  .plus(pool.statistics.boostedApy)
                  .toBigFormat(2)
                  .concat(" %")}
              </Row>
            ) : (
              new BN(pool.statistics?.apy ?? 0).toFormat(2).concat(" %")
            )}
          </Row>
        ),
        owner: pool.owner,
      }));
    setFilteredPools(data);
  }, [
    theme.colors.blue500,
    vm.pools,
    vm.sortLiquidity,
    vm.sortApy,
    vm.searchValue,
    vm.poolCategoryFilter,
    vm.customPoolFilter,
    showEmptyBalances,
    poolsStore.accountPoolsLiquidity,
    activeSort,
    accountStore.address,
    accountStore.findBalanceByAssetId,
    navigate,
  ]);
  const myPools = filteredPools.filter(
    ({ owner }) => owner != null && accountStore.address === owner
  );
  return (
    <>
      {myPools.length > 0 && (
        <>
          <Row alignItems="center">
            <Text weight={500} type="secondary" fitContent>
              My pools ({myPools.length})
            </Text>
          </Row>
          <SizedBox height={8} />
          <Scrollbar
            style={{ maxWidth: "calc(100vw - 32px)", borderRadius: 16 }}
          >
            <Table style={{ minWidth: 900 }} columns={columns} data={myPools} />
          </Scrollbar>
          <SizedBox height={24} />
        </>
      )}
      <Row alignItems="center">
        <Text weight={500} type="secondary" fitContent nowrap>
          All pools ({vm.pools.length})
        </Text>
        {accountStore.address != null && (
          <>
            <SizedBox width={28} />
            <Checkbox
              checked={showEmptyBalances}
              onChange={(e) => setShowEmptyBalances(e)}
            />
            <SizedBox width={12} />
            <Text>Show my empty balances</Text>
          </>
        )}
      </Row>
      <SizedBox height={8} />
      {filteredPools.length > 0 ? (
        <Scrollbar style={{ maxWidth: "calc(100vw - 32px)", borderRadius: 16 }}>
          <Table
            style={{ minWidth: 900 }}
            columns={columns}
            data={filteredPools}
            withHover
          />
        </Scrollbar>
      ) : (
        <PoolNotFound
          onClear={() => vm.setSearchValue("")}
          searchValue={vm.searchValue}
        />
      )}
    </>
  );
};
export default observer(PoolsTable);
