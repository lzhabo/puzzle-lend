import styled from "@emotion/styled";
import React, { useEffect } from "react";
import Text from "@components/Text";
import { Row } from "@src/components/Flex";
import { POOLS, TOKENS_BY_ASSET_ID } from "@src/constants";
import { observer } from "mobx-react-lite";
import { useAnalyticsScreenVM } from "@screens/AnalyticsScreen/AnalyticsScreenVM";
import Select from "@components/Select";
import SizedBox from "@components/SizedBox";
import Table from "@components/Table";
import Button from "@components/Button";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;
interface ITableData {
  borrowed: string;
  supplied: string;
  user: string;
  action?: typeof Button;
}
const AnalyticsScreenTable: React.FC<IProps> = () => {
  const vm = useAnalyticsScreenVM();

  return (
    <Root>
      <Text type="secondary" weight={500}>
        All users ({vm.uniqueUsers.length})
      </Text>
      <SizedBox height={8} />
      <Row>
        <Select
          style={{ width: 100 }}
          options={[
            { key: null as any, title: "All pools" },
            ...POOLS.map((p) => ({ title: p.name, key: p.address }))
          ]}
          selected={vm.poolId ?? undefined}
          onSelect={(key) => vm.setPoolId(key)}
        />
        <SizedBox width={24} />
        <Select
          options={[
            { key: null as any, title: "All tokens" },
            ...vm.tokens.map((t) => ({
              title: TOKENS_BY_ASSET_ID[t].symbol,
              key: t
            }))
          ]}
          selected={vm.assetId ?? undefined}
          onSelect={vm.setAssetId}
        />
        <SizedBox width={24} />
        <Select
          options={[
            { key: null as any, title: "Most borrowed" }
            // ...vm.tokens.map((t) => ({
            //   title: TOKENS_BY_ASSET_ID[t].symbol,
            //   key: t
            // }))
          ]}
          selected={vm.assetId ?? undefined}
          onSelect={console.log}
        />
      </Row>
      <SizedBox height={16} />
      <Table
        columns={[
          { Header: "User", accessor: "user" },
          { Header: "Supplied", accessor: "supplied" },
          { Header: "Borrowed", accessor: "borrowed" },
          { Header: "", accessor: "action" }
        ]}
        data={vm.tableData.map((e: ITableData) => ({
          ...e,
          action: (
            <Button size="medium" kind="secondary" fixed>
              Check User
            </Button>
          )
        }))}
      ></Table>
    </Root>
  );
};
export default observer(AnalyticsScreenTable);
