import React, { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import Tooltip from "@components/Tooltip";
import Table from "@components/Table";
import { ROUTES } from "@src/constants";
import { Column, Row } from "@src/components/Flex";
import Text from "@src/components/Text";
import SquareTokenIcon from "@components/SquareTokenIcon";
import SizedBox from "@components/SizedBox";
import Button from "@src/components/Button";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import Skeleton from "react-loading-skeleton";
import { useTheme } from "@emotion/react";
import { TPoolStats } from "@src/stores/LendStore";

type ISortTypes = "totalSupply" | "supplyAPY" | "totalBorrow" | "borrowAPY";

interface IProps {}

const Root = styled.div<{ sort?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: 96px;

  .sort-icon {
    width: 20px;
    height: 20px;
    margin-left: 4px;
    transform: ${({ sort }) => (sort ? "scale(1)" : "scale(1, -1)")};
  }
`;

const SupplyApy = styled.div`
  display: flex;
  white-space: nowrap;

  img {
    margin: 1px 4px 0 -1px;
  }
`;

const TooltipText = styled(Text)`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  max-width: 180px;
  white-space: normal;
`;

const DesktopTable: React.FC<IProps> = () => {
  const { lendStore } = useStores();
  const theme = useTheme();
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);
  const [sortMode, setActiveSortMode] = useState<"descending" | "ascending">(
    "descending"
  );
  const [sort, setActiveSort] = useState<ISortTypes>("totalSupply");

  const selectSort = useCallback(
    (v: ISortTypes) => {
      if (sort === v) {
        setActiveSortMode(
          sortMode === "ascending" ? "descending" : "ascending"
        );
      } else {
        setActiveSort(v);
        setActiveSortMode("descending");
      }
    },
    [sortMode, sort]
  );
  const navigate = useNavigate();

  const isSupplyDisabled = useCallback((token: TPoolStats) => {
    if (token?.supplyLimit.eq(0)) return false;
    if (!token?.totalSupply || !token?.totalBorrow) return false;
    const reserves = BN.formatUnits(
      token?.totalSupply?.minus(token?.totalBorrow),
      token?.decimals
    );

    return reserves.gt(token?.supplyLimit.div(token.prices.min));
  }, []);

  const columns = useMemo(
    () => [
      { Header: "Asset", accessor: "asset" },
      {
        Header: () => (
          <Row
            style={{ cursor: "pointer" }}
            onClick={() => selectSort("totalSupply")}
            justifyContent="flex-end"
          >
            <Tooltip
              content={
                <Text textAlign="left">
                  Amount of deposited tokens in total.
                </Text>
              }
            >
              <Text
                style={{ textDecoration: "underline dotted" }}
                size="medium"
                fitContent
                nowrap
              >
                Total supply
              </Text>
            </Tooltip>
            <img
              src={theme.images.icons.group}
              alt="group"
              className="sort-icon"
            />
          </Row>
        ),
        accessor: "supply"
      },
      {
        Header: () => (
          <Row
            style={{ cursor: "pointer" }}
            onClick={() => selectSort("supplyAPY")}
            justifyContent="flex-end"
          >
            <Tooltip
              content={
                <Text textAlign="left">
                  Amount of deposited tokens in total.
                </Text>
              }
            >
              <Text
                style={{ textDecoration: "underline dotted" }}
                size="medium"
                fitContent
                nowrap
              >
                Supply APY
              </Text>
            </Tooltip>
            <img
              src={theme.images.icons.group}
              alt="group"
              className="sort-icon"
            />
          </Row>
        ),
        accessor: "supplyApy"
      },
      {
        Header: () => (
          <Row
            style={{ cursor: "pointer" }}
            onClick={() => selectSort("totalBorrow")}
            justifyContent="flex-end"
          >
            <Tooltip
              content={
                <Text textAlign="left">
                  Amount of borrowed tokens in total.
                </Text>
              }
            >
              <Text
                style={{ textDecoration: "underline dotted" }}
                size="medium"
                fitContent
                nowrap
              >
                Total borrow
              </Text>
            </Tooltip>
            <img
              src={theme.images.icons.group}
              alt="group"
              className="sort-icon"
            />
          </Row>
        ),
        accessor: "borrow"
      },
      {
        Header: () => (
          <Row
            style={{ cursor: "pointer" }}
            onClick={() => selectSort("borrowAPY")}
            justifyContent="flex-end"
          >
            <Tooltip
              content={
                <Text textAlign="left">
                  Annual interest paid by borrowers taking into account
                  compounding.
                </Text>
              }
            >
              <Text
                style={{ textDecoration: "underline dotted" }}
                size="medium"
                fitContent
                nowrap
              >
                Borrow APY
              </Text>
            </Tooltip>
            <img
              src={theme.images.icons.group}
              alt="group"
              className="sort-icon"
            />
          </Row>
        ),
        accessor: "borrowApy"
      },
      { Header: "", accessor: "borrowBtn" },
      { Header: "", accessor: "supplyBtn" }
    ],
    [theme.images.icons.group, selectSort]
  );

  const openModal = useCallback(
    (
      e: React.MouseEvent,
      poolId: string,
      operationName: string,
      assetId: string
    ) => {
      e.stopPropagation();
      return navigate(`/${poolId}/${operationName}/${assetId}`);
    },
    [navigate]
  );

  useMemo(() => {
    let data: any = lendStore.poolsStats.slice().sort((a, b) => {
      const stats1: TPoolStats = a;
      const stats2: TPoolStats = b;
      let key: keyof TPoolStats | undefined;
      if (sort === "totalSupply") key = "totalSupply";
      if (sort === "totalBorrow") key = "totalBorrow";
      if (sort === "supplyAPY") key = "supplyAPY";
      if (sort === "borrowAPY") key = "borrowAPY";
      if (key == null) return 0;

      if (stats1 == null || stats2 == null) return 0;
      if (stats1[key] == null && stats2[key] != null)
        return sortMode === "descending" ? 1 : -1;
      if (stats1[key] == null && stats2[key] == null)
        return sortMode === "descending" ? -1 : 1;

      const stat1 = stats1[key] as keyof TPoolStats;
      const stat2 = stats2[key] as keyof TPoolStats;

      // if filtering in $ equivalent
      if (["totalBorrow", "totalSupply"].includes(sort)) {
        const val1 = (BN.formatUnits(stat1, stats1.decimals) as BN)
          .times(stats1?.prices.min)
          .toDecimalPlaces(0);
        const val2 = (BN.formatUnits(stat2, stats2.decimals) as BN)
          .times(stats2?.prices.min)
          .toDecimalPlaces(0);

        if (sortMode === "descending") return val1.lt(val2) ? 1 : -1;
        else return val1.lt(val2) ? -1 : 1;
      }

      if (sortMode === "descending") {
        return BN.formatUnits(stat1, 0).lt(stat2) ? 1 : -1;
      } else return BN.formatUnits(stat1, 0).lt(stat2) ? -1 : 1;
    });

    data = data.map((s: TPoolStats) => ({
      onClick: () => {
        navigate(
          ROUTES.DASHBOARD_TOKEN_DETAILS.replace(
            ":poolId",
            lendStore.pool.address
          ).replace(":assetId", s.assetId)
        );
      },
      asset: (
        <Row alignItems="center">
          <SquareTokenIcon size="small" src={s.logo} alt="logo" />
          <SizedBox width={16} />
          <Column>
            <Text size="small" fitContent>
              {s.symbol}
            </Text>
            <Text type="secondary" size="small" fitContent>
              $ {s.prices.min.toBigFormat(2)}
            </Text>
          </Column>
        </Row>
      ),
      supply: (
        <Column crossAxisSize="max">
          <Text weight={500} textAlign="right" size="medium">
            {BN.formatUnits(s.totalSupply, s.decimals).toBigFormat(2) +
              ` ${s.symbol}`}
          </Text>
          <Text textAlign="right" size="small" type="secondary">
            ${" "}
            {BN.formatUnits(s.totalSupply, s.decimals)
              .times(s.prices.min)
              .toBigFormat(2)}
          </Text>
        </Column>
      ),
      supplyApy: (
        <SupplyApy>
          <Tooltip
            config={{ placement: "top-start" }}
            content={
              <TooltipText textAlign="left">
                Non-borrowed tokens are automatically staked within native
                protocol to generate additional interest
              </TooltipText>
            }
          >
            {s.isAutostakeAvl && (
              <img
                src={theme.images.icons.autostaking}
                alt="autostaking"
                className="autostaking-icon"
              />
            )}
          </Tooltip>
          {s.supplyAPY.toFormat(2) + " %"}
        </SupplyApy>
      ),
      borrow: (
        <Column crossAxisSize="max">
          <Text weight={500} textAlign="right" size="medium">
            {BN.formatUnits(s.totalBorrow, s.decimals).toBigFormat(2) +
              ` ${s.symbol}`}
          </Text>
          <Text textAlign="right" size="small" type="secondary">
            ${" "}
            {BN.formatUnits(s.totalBorrow, s.decimals)
              .times(s.prices.min)
              .toBigFormat(2)}
          </Text>
        </Column>
      ),
      borrowApy: s.borrowAPY.toBigFormat(2) + " %",
      borrowBtn: (
        <Button
          kind="secondary"
          size="medium"
          fixed
          onClick={(e) => openModal(e, lendStore.poolId, "borrow", s.assetId)}
          style={{ width: "100px", margin: "0 auto" }}
        >
          Borrow
        </Button>
      ),
      supplyBtn: isSupplyDisabled(s) ? (
        <Tooltip
          content={
            <Text textAlign="left">Maximum total supply is reached</Text>
          }
        >
          <Button
            kind="secondary"
            size="medium"
            fixed
            disabled={true}
            onClick={(e) => openModal(e, lendStore.poolId, "supply", s.assetId)}
            style={{ width: "100px", margin: "0 auto" }}
          >
            Supply
          </Button>
        </Tooltip>
      ) : (
        <Button
          kind="secondary"
          size="medium"
          fixed
          onClick={(e) => openModal(e, lendStore.poolId, "supply", s.assetId)}
          style={{ width: "100px", margin: "0 auto" }}
        >
          Supply
        </Button>
      )
    }));
    setFilteredAssets(data);
  }, [
    theme.images.icons.autostaking,
    sort,
    sortMode,
    isSupplyDisabled,
    lendStore.pool.address,
    lendStore.poolsStats,
    lendStore.poolId,
    openModal,
    navigate
  ]);

  return (
    <Root sort={sortMode === "descending"}>
      {lendStore.initialized && filteredAssets.length ? (
        <Table columns={columns} data={filteredAssets} />
      ) : (
        <Skeleton height={56} style={{ marginBottom: 8 }} count={4} />
      )}
    </Root>
  );
};
export default observer(DesktopTable);
