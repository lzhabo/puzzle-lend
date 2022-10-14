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
      e: any,
      poolId: string,
      operationName: string,
      assetId: string,
      step: 0 | 1
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
      supplied:
        `${BN.formatUnits(s.selfSupply, s.decimals).toFormat(4)} ` + s.symbol,
      supplyApy: s.supplyAPY.toFormat(2) + "%",
      dailyIncome:
        `${BN.formatUnits(s.dailyIncome, s.decimals).toFormat(6)} ` + s.symbol,
      supplyBtn: (
        <Button
          onClick={(e) =>
            openModal(e, lendStore.poolId, "supply", s.assetId, 0)
          }
          kind="secondary"
          size="medium"
          fixed
        >
          Supply
        </Button>
      ),
      withdrawBtn: (
        <Button kind="secondary" size="medium" fixed>
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
      toRepair:
        BN.formatUnits(s.selfBorrow, s.decimals).toFormat(2) + ` ${s.symbol}`,
      borrowApr: s.borrowAPY.toFormat(2) + " %",
      dailyLoan:
        BN.formatUnits(s.dailyLoan, s.decimals).toFormat(6) + " " + s.symbol,
      borrowBtn: (
        <Button kind="secondary" size="medium" fixed>
          Borrow
        </Button>
      ),
      repayBtn: (
        <Button kind="secondary" size="medium" fixed>
          Repay
        </Button>
      )
    }));
    setFilteredBorrows(data);
  }, [lendStore.accountBorrow, lendStore.pool.address, navigate]);
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
