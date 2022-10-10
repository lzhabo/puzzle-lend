import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import React, { useMemo, useState } from "react";
import SearchTab from "./SearchTab";
import SizedBox from "@components/SizedBox";
import GridTable from "@components/GridTable";
import Card from "@components/Card";
import { IToken, TOKENS_BY_ASSET_ID } from "@src/constants";
import useWindowSize from "@src/hooks/useWindowSize";
import DesktopTokenTableRow from "./DesktopTokenTableRow";
import MobileTokenTableRow from "@screens/Explore/MobileTokenTableRow";
import { useStores } from "@stores";
import { tokenCategoriesEnum } from "@components/TokensSelectModal/TokenSelectModal";
import { useExploreVM } from "@screens/Explore/ExploreVm";
import { Column, Row } from "@src/components/Flex";
import Text from "@components/Text";
import { ReactComponent as NotFoundIcon } from "@src/assets/notFound.svg";
import { ReactComponent as SortDownIcon } from "@src/assets/icons/sortDown.svg";
import { TTokenStatistics } from "@stores/TokenStore";
import BN from "@src/utils/BN";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const TableTitle: React.FC<{
  sort: boolean;
  mode: "descending" | "ascending";
  onClick: () => void;
}> = ({ sort, mode, onClick, children }) => (
  <Row
    alignItems="center"
    onClick={onClick}
    style={{
      userSelect: "none",
      cursor: "pointer",
      ...(sort ? { color: "#363870" } : {}),
    }}
  >
    <div>{children}</div>
    {sort && mode === "descending" && (
      <SortDownIcon style={{ marginLeft: 8 }} />
    )}
    {sort && mode === "ascending" && (
      <SortDownIcon style={{ marginLeft: 8, transform: "scale(1, -1)" }} />
    )}
  </Row>
);

const TokensTable: React.FC<IProps> = () => {
  const { tokenStore, accountStore, notificationStore } = useStores();
  const { width } = useWindowSize();
  const vm = useExploreVM();
  const [sort, setSort] = useState<"price" | "change" | "volume">("change");
  const [sortMode, setSortMode] = useState<"descending" | "ascending">(
    "descending"
  );

  const selectSort = (v: "price" | "change" | "volume") => {
    if (sort === v) {
      setSortMode(sortMode === "ascending" ? "descending" : "ascending");
    } else {
      setSort(v);
      setSortMode("descending");
    }
  };

  const handleWatchListChange = (assetId: string) => {
    const watchListText =
      'Keep track of your favorite coins by turning on the "Watchlist" filter above the table';
    const tokenStatus = tokenStore.watchList.includes(assetId);
    if (tokenStatus) {
      tokenStore.removeFromWatchList(assetId);
      notificationStore.notify(watchListText, {
        type: "info",
        title: `${TOKENS_BY_ASSET_ID[assetId].symbol} has been removed to the watchlist`,
      });
    } else {
      tokenStore.addToWatchList(assetId);
      notificationStore.notify(watchListText, {
        type: "success",
        title: `${TOKENS_BY_ASSET_ID[assetId].symbol} has been added to the watchlist`,
      });
    }
  };
  // const [displayedTokens, setDisplayedTokens] = useState(10);

  const [filteredTokens, setFilteredTokens] = useState<IToken[]>([]);
  useMemo(() => {
    const data = vm.assetsWithStats
      // .slice(
      //   0,
      //   !isFiltersChosen ? displayedTokens : vm.assetsWithStats.length - 1
      // )
      .sort((a, b) => {
        const stats1: TTokenStatistics | undefined =
          tokenStore.statisticsByAssetId[a.assetId];
        const stats2: TTokenStatistics | undefined =
          tokenStore.statisticsByAssetId[b.assetId];
        let key: keyof TTokenStatistics | undefined;
        if (sort === "change") key = "change24H";
        if (sort === "price") key = "currentPrice";
        if (sort === "volume") key = "volume24";
        if (key == null) return 0;

        if (stats1 == null && stats2 == null) return 0;
        if (stats1[key] == null && stats2[key] != null) {
          return sortMode === "descending" ? 1 : -1;
        }
        if (stats1[key] == null && stats2[key] == null) {
          return sortMode === "descending" ? -1 : 1;
        }
        return sortMode === "descending"
          ? (stats1[key] as BN).lt(stats2[key])
            ? 1
            : -1
          : (stats1[key] as BN).lt(stats2[key])
          ? -1
          : 1;
      })

      .filter(({ name, symbol }) =>
        vm.tokenNameFilter
          ? [name, symbol]
              .map((v) => v.toLowerCase())
              .some((v) => v.includes(vm.tokenNameFilter.toLowerCase()))
          : true
      )
      .filter(({ category }) => {
        if (vm.tokenCategoryFilter === 0) return true;
        return category?.includes(tokenCategoriesEnum[vm.tokenCategoryFilter]);
      })
      .filter(({ assetId, symbol }) => {
        if (vm.tokenUserFilter === 0) return true;
        if (vm.tokenUserFilter === 1) {
          return tokenStore.watchList.includes(assetId);
        }
        if (vm.tokenUserFilter === 2) {
          return accountStore.assetBalances
            ?.filter((v) => v.balance?.gt(0))
            ?.map((v) => v.assetId)
            .includes(assetId);
        }
        return true;
      });
    setFilteredTokens(data);
  }, [
    accountStore.assetBalances,
    // displayedTokens,
    sort,
    sortMode,
    tokenStore.statisticsByAssetId,
    tokenStore.watchList,
    vm.assetsWithStats,
    vm.tokenCategoryFilter,
    vm.tokenNameFilter,
    vm.tokenUserFilter,
  ]);

  return (
    <Root>
      <SearchTab />
      <SizedBox height={24} />
      <Card
        style={{ padding: 0, overflow: "auto", maxWidth: "calc(100vw - 32px)" }}
        justifyContent="center"
      >
        <GridTable
          style={{ width: "fit-content", minWidth: "100%" }}
          desktopTemplate={"2fr 1fr 1fr 1fr 1fr "}
          mobileTemplate={"2fr 1fr"}
        >
          {width && width >= 880 && (
            <div className="gridTitle">
              <div>Token name</div>
              <TableTitle
                onClick={() => selectSort("price")}
                sort={sort === "price"}
                mode={sortMode}
              >
                Price
              </TableTitle>
              <TableTitle
                onClick={() => selectSort("change")}
                sort={sort === "change"}
                mode={sortMode}
              >
                Change (24h)
              </TableTitle>
              <TableTitle
                onClick={() => selectSort("volume")}
                sort={sort === "volume"}
                mode={sortMode}
              >
                Volume (24h)
              </TableTitle>
            </div>
          )}
          {filteredTokens.length === 0 && (
            <Column
              justifyContent="center"
              alignItems="center"
              crossAxisSize="max"
            >
              <SizedBox height={24} />
              <NotFoundIcon style={{ marginBottom: 24 }} />
              <Text type="secondary" className="text" textAlign="center">
                Unfortunately, there are no tokens that fit your filters.
              </Text>
              <SizedBox height={24} />
            </Column>
          )}
          {filteredTokens.map((t) => {
            const stats = tokenStore.statisticsByAssetId[t.assetId];
            return width && width >= 880 ? (
              <DesktopTokenTableRow
                token={t}
                change={stats?.change24H}
                vol24={stats?.volume24}
                fav={tokenStore.watchList.includes(t.assetId)}
                key={t.assetId}
                rate={stats.currentPrice}
                handleWatchListChange={handleWatchListChange}
              />
            ) : (
              <MobileTokenTableRow
                token={t}
                change={stats?.change24H}
                fav={tokenStore.watchList.includes(t.assetId)}
                key={t.assetId}
                rate={stats.currentPrice}
                handleWatchListChange={handleWatchListChange}
              />
            );
          })}
          {/*{!isFiltersChosen && displayedTokens !== vm.assetsWithStats.length && (*/}
          {/*  <>*/}
          {/*    <SizedBox height={16} />*/}
          {/*    <Text*/}
          {/*      type="secondary"*/}
          {/*      weight={500}*/}
          {/*      textAlign="center"*/}
          {/*      style={{ cursor: "pointer" }}*/}
          {/*      onClick={() =>*/}
          {/*        vm.assetsWithStats.length - displayedTokens >= 10*/}
          {/*          ? setDisplayedTokens(displayedTokens + 10)*/}
          {/*          : setDisplayedTokens(vm.assetsWithStats.length)*/}
          {/*      }*/}
          {/*    >*/}
          {/*      Load more*/}
          {/*    </Text>*/}
          {/*    <SizedBox height={16} />*/}
          {/*  </>*/}
          {/*)}*/}
        </GridTable>
      </Card>
    </Root>
  );
};
export default observer(TokensTable);
