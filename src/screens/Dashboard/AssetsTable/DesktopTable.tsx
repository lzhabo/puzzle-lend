import styled from "@emotion/styled";
import React, { useMemo, useState } from "react";
import Table from "@components/Table";
import { Column, Row } from "@src/components/Flex";
import Text from "@src/components/Text";
import SquareTokenIcon from "@components/SquareTokenIcon";
import SizedBox from "@components/SizedBox";
import Button from "@src/components/Button";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import Skeleton from "react-loading-skeleton";
import { ROUTES } from "@src/constants";
import { useNavigate } from "react-router-dom";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 96px;
`;

const DesktopTable: React.FC<IProps> = () => {
  const { lendStore } = useStores();
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);
  const navigate = useNavigate();
  const columns = useMemo(
    () => [
      { Header: "Asset", accessor: "asset" },
      { Header: "Total supply", accessor: "supply" },
      { Header: "Supply APY", accessor: "supplyApy" },
      { Header: "Total borrow", accessor: "borrow" },
      { Header: "Borrow APY", accessor: "borrowApy" },
      { Header: "", accessor: "borrowBtn" },
      { Header: "", accessor: "supplyBtn" },
    ],
    []
  );
  useMemo(() => {
    const data = lendStore.poolsStats.map((s) => ({
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
      supply:
        BN.formatUnits(s.totalSupply, s.decimals).toFormat(2) + ` ${s.symbol}`,
      supplyApy: s.supplyAPY.toFormat(2) + " %",
      borrow:
        BN.formatUnits(s.totalBorrow, s.decimals).toFormat(2) + ` ${s.symbol}`,
      borrowApy: s.borrowAPY.toFormat(2) + " %",
      borrowBtn: (
        <Button kind="secondary" size="medium" fixed>
          Borrow
        </Button>
      ),
      supplyBtn: (
        <Button kind="secondary" size="medium" fixed>
          Supply
        </Button>
      ),
    }));
    setFilteredAssets(data);
  }, [lendStore.pool.address, lendStore.poolsStats, navigate]);
  return (
    <Root>
      {lendStore.initialized && filteredAssets.length > 0 ? (
        <Table columns={columns} data={filteredAssets} />
      ) : (
        <Skeleton height={56} style={{ marginBottom: 8 }} count={4} />
      )}
    </Root>
  );
};
export default observer(DesktopTable);
