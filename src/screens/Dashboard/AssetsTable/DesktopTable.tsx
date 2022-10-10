import styled from "@emotion/styled";
import React, { useMemo, useState } from "react";
import Table from "@components/Table";
import { useDashboardVM } from "@screens/Dashboard/DashboardVm";
import { Column, Row } from "@src/components/Flex";
import Text from "@src/components/Text";
import SquareTokenIcon from "@components/SquareTokenIcon";
import SizedBox from "@components/SizedBox";
import Button from "@src/components/Button";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 96px;
`;

const DesktopTable: React.FC<IProps> = () => {
  const vm = useDashboardVM();
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);
  const columns = useMemo(
    () => [
      { Header: "Asset", accessor: "asset" },
      { Header: "LTV", accessor: "ltv" },
      { Header: "Total supply", accessor: "supply" },
      { Header: "Supply APY", accessor: "supplyApy" },
      { Header: "Total borrow", accessor: "borrowApy" },
      { Header: "", accessor: "borrowBtn" },
      { Header: "", accessor: "supplyBtn" },
    ],
    []
  );
  useMemo(() => {
    const data = vm.tokens.map((token) => ({
      asset: (
        <Row alignItems="center">
          <SquareTokenIcon size="small" src={token.logo} alt="logo" />
          <SizedBox width={16} />
          <Column>
            <Text size="small" fitContent>
              {token.symbol}
            </Text>
            <Text type="secondary" size="small" fitContent>
              $ 1
            </Text>
          </Column>
        </Row>
      ),
      ltv: "100%",
      supply: "100%",
      supplyApy: "100%",
      borrowApy: "100%",
      borrowBtn: (
        <Button kind="secondary" size="medium">
          Borrow
        </Button>
      ),
      supplyBtn: (
        <Button kind="secondary" size="medium">
          Supply
        </Button>
      ),
    }));
    setFilteredAssets(data);
  }, [vm.tokens]);
  return (
    <Root>
      <Table columns={columns} data={filteredAssets} />
    </Root>
  );
};
export default DesktopTable;
