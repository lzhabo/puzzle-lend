import styled from "@emotion/styled";
import React, { useMemo, useState, useCallback } from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@src/components/Flex";
import { useStores } from "@stores";
import Table from "@components/Table";
import Tooltip from "@components/Tooltip";
import SquareTokenIcon from "@components/SquareTokenIcon";
import BN from "@src/utils/BN";
import Button from "@components/Button";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@src/constants";
import { useTheme } from "@emotion/react";
import { TPoolStats } from "@src/stores/LendStore";
import { useSupplyAndBorrowVM } from "@screens/Dashboard/AccountSupplyAndBorrow/DesktopAccountSupplyAndBorrow/SupplyAndBorrowVM";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const TableWrap = styled.div<{ sort?: boolean }>`
  .sort-icon {
    width: 20px;
    height: 20px;
    margin-left: 4px;
  }

  .sort-icon-active {
    width: 20px;
    height: 20px;
    margin-left: 4px;
    transform: ${({ sort }) => (sort ? "scale(1)" : "scale(1, -1)")};
  }
`;

const AccountBorrowTable: React.FC<IProps> = () => {
  const { lendStore } = useStores();
  const [filteredBorrows, setFilteredBorrows] = useState<any[]>([]);
  const theme = useTheme();
  const vm = useSupplyAndBorrowVM();
  const navigate = useNavigate();

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

  //-------------
  const borrowColumns = useMemo(
    () => [
      { Header: "Asset", accessor: "asset" },
      { Header: "", accessor: "emptyCell" },
      {
        Header: () => (
          <Row
            style={{ cursor: "pointer" }}
            onClick={() => {
              console.log("To be repaid");
              vm.selectSort("selfBorrow", false);
            }}
            justifyContent="flex-end"
          >
            <Text size="medium" fitContent nowrap>
              To be repaid
            </Text>
            {lendStore.accountBorrow.length > 1 ? (
              <img
                src={theme.images.icons.group}
                alt="group"
                className={
                  vm.sortBorrow === "selfBorrow"
                    ? "sort-icon-active"
                    : "sort-icon"
                }
              />
            ) : (
              <SizedBox width={24} />
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
                ? vm.selectSort("borrowAPY", false)
                : null
            }
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
            {lendStore.accountBorrow.length > 1 ? (
              <img
                src={theme.images.icons.group}
                alt="group"
                className={
                  vm.sortBorrow === "borrowAPY"
                    ? "sort-icon-active"
                    : "sort-icon"
                }
              />
            ) : (
              <SizedBox width={24} />
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
                ? vm.selectSort("dailyLoan", false)
                : null
            }
            justifyContent="flex-end"
          >
            <Text size="medium" fitContent nowrap>
              Daily loan interest
            </Text>
            {lendStore.accountBorrow.length > 1 ? (
              <img
                src={theme.images.icons.group}
                alt="group"
                className={
                  vm.sortBorrow === "dailyLoan"
                    ? "sort-icon-active"
                    : "sort-icon"
                }
              />
            ) : (
              <SizedBox width={24} />
            )}
          </Row>
        ),
        accessor: "dailyLoan"
      },
      { Header: "", accessor: "borrowBtn" },
      { Header: "", accessor: "repayBtn" }
    ],
    [vm, lendStore.accountBorrow.length, theme.images.icons.group]
  );
  useMemo(() => {
    const data = vm
      .sortData(lendStore.accountBorrow, false)
      .map((s: TPoolStats) => ({
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
        emptyCell: <SizedBox width={80} />,
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
    vm.sortBorrow,
    vm.sortModeBorrow,
    lendStore.pool.address,
    lendStore.poolId,
    lendStore.accountBorrow,
    openModal,
    navigate
  ]);
  //todo fix dependency problem
  return (
    <Root>
      {lendStore.accountBorrow.length > 0 && (
        <TableWrap sort={vm.sortModeBorrow === "descending"}>
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
        </TableWrap>
      )}
    </Root>
  );
};
export default observer(AccountBorrowTable);
