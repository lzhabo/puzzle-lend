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

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  @media (min-width: 768px) {
    //gap: 24px;
  }
`;
const DesktopAccountSupplyAndBorrow: React.FC<IProps> = () => {
  const { lendStore } = useStores();
  const navigate = useNavigate();
  const [filteredSupplies, setFilteredSupplies] = useState<any[]>([]);
  const [filteredBorrows, setFilteredBorrows] = useState<any[]>([]);
  const supplyColumns = useMemo(
    () => [
      { Header: "Asset", accessor: "asset" },
      { Header: "Supplied", accessor: "supplied" },
      { Header: "Supply APY", accessor: "supplyApy" },
      { Header: "Daily income", accessor: "dailyIncome" },
      { Header: "", accessor: "supplyBtn" },
      { Header: "", accessor: "withdrawBtn" }
    ],
    []
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
    const data = lendStore.accountSupply.map((s) => ({
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
              $ {s.prices.max.toFormat(2)}
            </Text>
          </Column>
        </Row>
      ),
      supplied: (
        <Column crossAxisSize="max">
          <Text weight={500} textAlign="right" size="medium">
            {BN.formatUnits(s.selfSupply, s.decimals).toFormat(2) +
              ` ${s.symbol}`}
          </Text>
          <Text textAlign="right" size="small" type="secondary">
            ${" "}
            {BN.formatUnits(s.selfSupply, s.decimals)
              .times(s.prices.min)
              .toFormat(2)}
          </Text>
        </Column>
      ),
      supplyApy: s.supplyAPY.toFormat(2) + "%",
      dailyIncome: (
        <Column crossAxisSize="max">
          <Text weight={500} textAlign="right" size="medium">
            {BN.formatUnits(s.dailyIncome, s.decimals).toFormat(6) +
              ` ${s.symbol}`}
          </Text>
          <Text textAlign="right" size="small" type="secondary">
            ${" "}
            {BN.formatUnits(s.dailyIncome, s.decimals)
              .times(s.prices.min)
              .toFormat(6)}
          </Text>
        </Column>
      ),
      supplyBtn: (
        <Button
          onClick={(e) => openModal(e, lendStore.poolId, "supply", s.assetId)}
          kind="secondary"
          size="medium"
          fixed
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
        >
          Withdraw
        </Button>
      )
    }));
    setFilteredSupplies(data);
  }, [
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
      { Header: "To be repaid", accessor: "toRepair" },
      { Header: "Borrow APR", accessor: "borrowApr" },
      { Header: "Daily loan interest", accessor: "dailyLoan" },
      { Header: "", accessor: "borrowBtn" },
      { Header: "", accessor: "repayBtn" }
    ],
    []
  );
  useMemo(() => {
    const data = lendStore.accountBorrow.map((s) => ({
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
              $ {s.prices.max.toFormat(2)}
            </Text>
          </Column>
        </Row>
      ),
      toRepair: (
        <Column crossAxisSize="max">
          <Text weight={500} textAlign="right" size="medium">
            {BN.formatUnits(s.selfBorrow, s.decimals).toFormat(2) +
              ` ${s.symbol}`}
          </Text>
          <Text textAlign="right" size="small" type="secondary">
            ${" "}
            {BN.formatUnits(s.selfBorrow, s.decimals)
              .times(s.prices.min)
              .toFormat(2)}
          </Text>
        </Column>
      ),
      borrowApr: s.borrowAPY.toFormat(2) + " %",
      dailyLoan: (
        <Column crossAxisSize="max">
          <Text weight={500} textAlign="right" size="medium">
            {BN.formatUnits(s.dailyLoan, s.decimals).toFormat(6) +
              ` ${s.symbol}`}
          </Text>
          <Text textAlign="right" size="small" type="secondary">
            ${" "}
            {BN.formatUnits(s.dailyLoan, s.decimals)
              .times(s.prices.min)
              .toFormat(6)}
          </Text>
        </Column>
      ),
      borrowBtn: (
        <Button
          kind="secondary"
          size="medium"
          fixed
          onClick={(e) => openModal(e, lendStore.poolId, "borrow", s.assetId)}
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
        >
          Repay
        </Button>
      )
    }));
    setFilteredBorrows(data);
  }, [
    lendStore.pool.address,
    lendStore.poolId,
    lendStore.accountBorrow,
    openModal,
    navigate
  ]);
  return (
    <Root>
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
        </>
      )}
      <SizedBox height={24} />
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
        </>
      )}
    </Root>
  );
};
export default observer(DesktopAccountSupplyAndBorrow);
