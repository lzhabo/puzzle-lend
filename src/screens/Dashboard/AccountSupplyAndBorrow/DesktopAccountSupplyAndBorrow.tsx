import styled from "@emotion/styled";
import React, { useMemo, useState } from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@src/components/Flex";
import { useStores } from "@stores";
import Table from "@components/Table";
import SquareTokenIcon from "@components/SquareTokenIcon";
import BN from "@src/utils/BN";
import Button from "@components/Button";
import { observer } from "mobx-react-lite";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  @media (min-width: 768px) {
    gap: 24px;
  }
`;
const MobileAccountSupplyAndBorrow: React.FC<IProps> = () => {
  const { lendStore } = useStores();
  //todo add loader and check if [].lenght ===0
  const [filteredSupplies, setFilteredSupplies] = useState<any[]>([]);
  const [filteredBorrows, setFilteredBorrows] = useState<any[]>([]);
  const supplyColumns = useMemo(
    () => [
      { Header: "Asset", accessor: "asset" },
      { Header: "Total supply", accessor: "supply" },
      { Header: "Supply APY", accessor: "supplyApy" },
      { Header: "Total borrow", accessor: "borrow" },
      { Header: "Borrow APY", accessor: "borrowApy" },
      { Header: "", accessor: "supplyBtn" },
      { Header: "", accessor: "withdrawBtn" },
    ],
    []
  );
  useMemo(() => {
    const data = lendStore.poolsStats.map((s) => ({
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
      supply:
        BN.formatUnits(s.totalSupply, s.decimals).toFormat(2) + ` ${s.symbol}`,
      supplyApy: s.supplyAPY.toFormat(2) + " %",
      borrow:
        BN.formatUnits(s.totalBorrow, s.decimals).toFormat(2) + ` ${s.symbol}`,
      borrowApy: s.borrowAPY.toFormat(2) + " %",
      supplyBtn: (
        <Button kind="secondary" size="medium">
          Supply
        </Button>
      ),
      withdrawBtn: (
        <Button kind="secondary" size="medium">
          Withdraw
        </Button>
      ),
    }));
    setFilteredSupplies(data);
  }, [lendStore.poolsStats]);

  //-------------
  const borrowColumns = useMemo(
    () => [
      { Header: "Asset", accessor: "asset" },
      { Header: "", accessor: "gap" },
      { Header: "", accessor: "gap2" },
      { Header: "To be repaid", accessor: "toRepair" },
      { Header: "Borrow APR", accessor: "borrowApr" },
      { Header: "", accessor: "borrowBtn" },
      { Header: "", accessor: "repayBtn" },
    ],
    []
  );
  useMemo(() => {
    const data = lendStore.poolsStats.map((s) => ({
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
      toRepair: "100",
      borrowApr: "200",
      borrowBtn: (
        <Button kind="secondary" size="medium">
          Borrow
        </Button>
      ),
      repayBtn: (
        <Button kind="secondary" size="medium">
          Repay
        </Button>
      ),
    }));
    setFilteredBorrows(data);
  }, [lendStore.poolsStats]);
  //todo change for supply and borrow
  return (
    <Root>
      <Column>
        <Text weight={500} type="secondary">
          My supply
        </Text>
        <SizedBox height={8} />
        <Table
          style={{ width: "100%" }}
          columns={supplyColumns}
          data={filteredSupplies}
        />
      </Column>
      <Column>
        <Text weight={500} type="secondary">
          My borrow
        </Text>
        <SizedBox height={8} />
        <Table
          style={{ width: "100%" }}
          columns={borrowColumns}
          data={filteredBorrows}
        />
      </Column>
    </Root>
  );
};
export default observer(MobileAccountSupplyAndBorrow);
