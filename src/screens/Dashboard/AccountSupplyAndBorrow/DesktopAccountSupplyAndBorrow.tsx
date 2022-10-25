import styled from "@emotion/styled";
import React, { useMemo, useState, useCallback } from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@src/components/Flex";
import { useStores } from "@stores";
import Table from "@components/Table";
import SquareTokenIcon from "@components/SquareTokenIcon";
import BN from "@src/utils/BN";
import Button from "@components/Button";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@src/constants";
import { useTheme } from "@emotion/react";
import { TPoolStats } from "@src/stores/LendStore";

interface IProps {}

type ISortTypes =
  | "borrowAPY"
  | "supplyAPY"
  | "selfSupply"
  | "selfBorrow"
  | "dailyIncome"
  | "dailyLoan";

const Root = styled.div<{ sort?: boolean }>`
  display: flex;
  flex-direction: column;

  .sort-icon {
    width: 20px;
    height: 20px;
  }

  .sort-icon-active {
    width: 20px;
    height: 20px;
    transform: ${({ sort }) => (sort ? "scale(1)" : "scale(1, -1)")};
  }
`;
const DesktopAccountSupplyAndBorrow: React.FC<IProps> = () => {
  const { lendStore } = useStores();
  const navigate = useNavigate();
  const theme = useTheme();
  const [filteredSupplies, setFilteredSupplies] = useState<any[]>([]);
  const [filteredBorrows, setFilteredBorrows] = useState<any[]>([]);
  const [sort, setActiveSort] = useState<ISortTypes>("selfSupply");
  const [sortMode, setActiveSortMode] = useState<"descending" | "ascending">(
    "descending"
  );
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
  const sortData = useCallback(
    (poolsData: TPoolStats[]) => {
      return poolsData.slice().sort((a, b) => {
        const stats1: TPoolStats = a;
        const stats2: TPoolStats = b;
        let key: keyof TPoolStats | undefined;
        if (sort === "borrowAPY") key = "borrowAPY";
        if (sort === "supplyAPY") key = "supplyAPY";
        if (sort === "selfSupply") key = "selfSupply";
        if (sort === "selfBorrow") key = "selfBorrow";
        if (sort === "dailyIncome") key = "dailyIncome";
        if (sort === "dailyLoan") key = "dailyLoan";
        if (key == null) return 0;

        if (stats1 == null || stats2 == null) return 0;
        if (stats1[key] == null && stats2[key] != null)
          return sortMode === "descending" ? 1 : -1;
        if (stats1[key] == null && stats2[key] == null)
          return sortMode === "descending" ? -1 : 1;

        const stat1 = stats1[key] as keyof TPoolStats;
        const stat2 = stats2[key] as keyof TPoolStats;

        // if filtering in $ equivalent
        if (
          ["selfSupply", "selfBorrow", "dailyIncome", "dailyLoan"].includes(
            sort
          )
        ) {
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
    },
    [sort, sortMode]
  );

  const supplyColumns = useMemo(
    () => [
      { Header: "Asset", accessor: "asset" },
      { Header: "", accessor: "emptyCell" },
      {
        Header: () => (
          <Row
            style={{ cursor: "pointer" }}
            onClick={() =>
              lendStore.accountSupply.length > 1
                ? selectSort("selfSupply")
                : null
            }
            justifyContent="flex-end"
          >
            <Text size="medium" fitContent nowrap>
              Supplied
            </Text>
            <img
              src={theme.images.icons.group}
              alt="group"
              className={
                sort === "selfSupply" ? "sort-icon-active" : "sort-icon"
              }
            />
          </Row>
        ),
        accessor: "supplied"
      },
      {
        Header: () => (
          <Row
            style={{ cursor: "pointer" }}
            onClick={() =>
              lendStore.accountSupply.length > 1
                ? selectSort("supplyAPY")
                : null
            }
            justifyContent="flex-end"
          >
            <Text size="medium" fitContent nowrap>
              Supply APY
            </Text>
            <img
              src={theme.images.icons.group}
              alt="group"
              className={
                sort === "supplyAPY" ? "sort-icon-active" : "sort-icon"
              }
            />
          </Row>
        ),
        accessor: "supplyApy"
      },
      {
        Header: () => (
          <Row
            style={{ cursor: "pointer" }}
            onClick={() => selectSort("dailyIncome")}
            justifyContent="flex-end"
          >
            <Text size="medium" fitContent nowrap>
              Daily income
            </Text>
            <img
              src={theme.images.icons.group}
              alt="group"
              className={
                sort === "dailyIncome" ? "sort-icon-active" : "sort-icon"
              }
            />
          </Row>
        ),
        accessor: "dailyIncome"
      },
      { Header: "", accessor: "supplyBtn" },
      { Header: "", accessor: "withdrawBtn" }
    ],
    [selectSort, sort, theme.images.icons.group, lendStore.accountSupply.length]
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
    const data = sortData(lendStore.accountSupply).map((s: TPoolStats) => ({
      onClick: () =>
        navigate(
          ROUTES.DASHBOARD_TOKEN_DETAILS.replace(
            ":poolId",
            lendStore.pool.address
          ).replace(":assetId", s.assetId)
        ),
      asset: (
        <Row alignItems="center">
          <SquareTokenIcon size="small" src={s.logo} alt="logo" />
          <SizedBox width={16} />
          <Column>
            <Text size="small" fitContent>
              {s.symbol}
            </Text>
            <Text type="secondary" size="small" fitContent>
              $ {s.prices.max.toBigFormat(2)}
            </Text>
          </Column>
        </Row>
      ),
      emptyCell: <SizedBox width={120} />,
      supplied: (
        <Column crossAxisSize="max">
          <Text weight={500} textAlign="right" size="medium">
            {BN.formatUnits(s.selfSupply, s.decimals).toBigFormat(2) +
              ` ${s.symbol}`}
          </Text>
          <Text textAlign="right" size="small" type="secondary">
            ${" "}
            {BN.formatUnits(s.selfSupply, s.decimals)
              .times(s.prices.min)
              .toBigFormat(2)}
          </Text>
        </Column>
      ),
      supplyApy: s.supplyAPY.toBigFormat(2) + "%",
      dailyIncome: (
        <Column crossAxisSize="max">
          <Text weight={500} textAlign="right" size="medium">
            {BN.formatUnits(s.dailyIncome, s.decimals).toBigFormat(6) +
              ` ${s.symbol}`}
          </Text>
          <Text textAlign="right" size="small" type="secondary">
            ${" "}
            {BN.formatUnits(s.dailyIncome, s.decimals)
              .times(s.prices.min)
              .toBigFormat(6)}
          </Text>
        </Column>
      ),
      supplyBtn: (
        <Button
          kind="secondary"
          size="medium"
          fixed
          onClick={(e) => openModal(e, lendStore.poolId, "supply", s.assetId)}
          style={{ width: "100px", margin: "0 auto" }}
        >
          Supply
        </Button>
      ),
      withdrawBtn: (
        <Button
          kind="secondary"
          size="medium"
          fixed
          onClick={(e) => openModal(e, lendStore.poolId, "withdraw", s.assetId)}
          style={{ width: "100px", margin: "0 auto" }}
        >
          Withdraw
        </Button>
      )
    }));
    setFilteredSupplies(data);
  }, [
    sortData,
    lendStore.pool.address,
    lendStore.accountSupply,
    lendStore.poolId,
    openModal,
    navigate
  ]);

  //-------------
  const borrowColumns = useMemo(
    () => [
      { Header: "Asset", accessor: "asset" },
      { Header: "", accessor: "emptyCell" },
      {
        Header: () => (
          <Row
            style={{ cursor: "pointer" }}
            onClick={() =>
              lendStore.accountBorrow.length > 1
                ? selectSort("selfBorrow")
                : null
            }
            justifyContent="flex-end"
          >
            <Text size="medium" fitContent nowrap>
              To be repaid
            </Text>
            {lendStore.accountBorrow.length > 1 && (
              <img
                src={theme.images.icons.group}
                alt="group"
                className={
                  sort === "selfBorrow" ? "sort-icon-active" : "sort-icon"
                }
              />
            )}
          </Row>
        ),
        accessor: "toRepay"
      },
      {
        Header: () => (
          <Row
            style={{ cursor: "pointer" }}
            onClick={() =>
              lendStore.accountBorrow.length > 1
                ? selectSort("borrowAPY")
                : null
            }
            justifyContent="flex-end"
          >
            <Text size="medium" fitContent nowrap>
              Borrow APY
            </Text>
            {lendStore.accountBorrow.length > 1 && (
              <img
                src={theme.images.icons.group}
                alt="group"
                className={
                  sort === "borrowAPY" ? "sort-icon-active" : "sort-icon"
                }
              />
            )}
          </Row>
        ),
        accessor: "borrowAPY"
      },
      {
        Header: () => (
          <Row
            style={{ cursor: "pointer" }}
            onClick={() =>
              lendStore.accountBorrow.length > 1
                ? selectSort("dailyLoan")
                : null
            }
            justifyContent="flex-end"
          >
            <Text size="medium" fitContent nowrap>
              Daily loan interest
            </Text>
            {lendStore.accountBorrow.length > 1 && (
              <img
                src={theme.images.icons.group}
                alt="group"
                className={
                  sort === "dailyLoan" ? "sort-icon-active" : "sort-icon"
                }
              />
            )}
          </Row>
        ),
        accessor: "dailyLoan"
      },
      { Header: "", accessor: "borrowBtn" },
      { Header: "", accessor: "repayBtn" }
    ],
    [lendStore.accountBorrow.length, selectSort, sort, theme.images.icons.group]
  );
  useMemo(() => {
    const data = sortData(lendStore.accountBorrow).map((s: TPoolStats) => ({
      onClick: () =>
        navigate(
          ROUTES.DASHBOARD_TOKEN_DETAILS.replace(
            ":poolId",
            lendStore.pool.address
          ).replace(":assetId", s.assetId)
        ),

      asset: (
        <Row alignItems="center">
          <SquareTokenIcon size="small" src={s.logo} alt="logo" />
          <SizedBox width={16} />
          <Column>
            <Text size="small" fitContent>
              {s.symbol}
            </Text>
            <Text type="secondary" size="small" fitContent>
              $ {s.prices.max.toBigFormat(2)}
            </Text>
          </Column>
        </Row>
      ),
      emptyCell: <SizedBox width={120} />,
      toRepay: (
        <Column crossAxisSize="max">
          <Text weight={500} textAlign="right" size="medium">
            {BN.formatUnits(s.selfBorrow, s.decimals).toBigFormat(2) +
              ` ${s.symbol}`}
          </Text>
          <Text textAlign="right" size="small" type="secondary">
            ${" "}
            {BN.formatUnits(s.selfBorrow, s.decimals)
              .times(s.prices.min)
              .toBigFormat(2)}
          </Text>
        </Column>
      ),
      borrowAPY: s.borrowAPY.toBigFormat(2) + " %",
      dailyLoan: (
        <Column crossAxisSize="max">
          <Text weight={500} textAlign="right" size="medium">
            {BN.formatUnits(s.dailyLoan, s.decimals).toBigFormat(6) +
              ` ${s.symbol}`}
          </Text>
          <Text textAlign="right" size="small" type="secondary">
            ${" "}
            {BN.formatUnits(s.dailyLoan, s.decimals)
              .times(s.prices.min)
              .toBigFormat(6)}
          </Text>
        </Column>
      ),
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
      repayBtn: (
        <Button
          kind="secondary"
          size="medium"
          fixed
          onClick={(e) => openModal(e, lendStore.poolId, "repay", s.assetId)}
          style={{ width: "100px", margin: "0 auto" }}
        >
          Repay
        </Button>
      )
    }));
    setFilteredBorrows(data);
  }, [
    sortData,
    lendStore.pool.address,
    lendStore.poolId,
    lendStore.accountBorrow,
    openModal,
    navigate
  ]);
  return (
    <Root sort={sortMode === "descending"}>
      {lendStore.accountSupply.length > 0 && (
        <>
          <Text weight={500} type="secondary">
            My supply
          </Text>
          <SizedBox height={8} />
          <Table
            style={{ width: "100%" }}
            columns={supplyColumns}
            data={filteredSupplies}
          />
          <SizedBox height={24} />
        </>
      )}
      {lendStore.accountBorrow.length > 0 && (
        <>
          <Text weight={500} type="secondary">
            My borrow
          </Text>
          <SizedBox height={8} />
          <Table
            style={{ width: "100%" }}
            columns={borrowColumns}
            data={filteredBorrows}
          />
          <SizedBox height={24} />
        </>
      )}
    </Root>
  );
};
export default observer(DesktopAccountSupplyAndBorrow);
