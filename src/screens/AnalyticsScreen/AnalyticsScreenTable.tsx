import styled from "@emotion/styled";
import React from "react";
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
  max-width: auto;
  width: 100%;
  @media (max-width: 1440px) {
    margin: 40px 0 0 0;
  }
`;

const UsersTable = styled(Table)`
  border: 1px solid ${({ theme }) => `${theme.colors.primary100}`};

  @media (max-width: 880px) {
    max-width: calc(100vw - 38px);
    overflow-x: scroll;
    margin: auto;
  }
`;

//TODO пометка для себя я бы эти стили переписал без трех > div селекторов, а на классах
const RowSelect = styled(Row)`
  @media (max-width: 880px) {
    flex-direction: column;
    > div {
      width: 100%;
      margin: 4px 0 0 0;
      > div {
        max-width: calc(100vw - 32px);
        width: calc(100vw - 32px);
        > div {
          display: flex;
          justify-content: space-between;
        }
      }
    }
  }
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
      <RowSelect>
        <Select
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
            ...vm.sortOptions.map((t) => ({
              title: t,
              key: t
            }))
          ]}
          selected={vm.sort ?? undefined}
          onSelect={vm.setSort}
        />
      </RowSelect>
      <SizedBox height={16} />
      <UsersTable
        columns={[
          { Header: "User", accessor: "user" },
          { Header: "Supplied", accessor: "supplied" },
          { Header: "Borrowed", accessor: "borrowed" },
          { Header: "", accessor: "action" }
        ]}
        data={vm.tableData.map((e: ITableData) => ({
          ...e,
          //TODO добавить онклик на кнопку для переброса на новую страницу
          action: (
            <Button size="medium" kind="secondary" fixed>
              Check User
            </Button>
          )
        }))}
      ></UsersTable>
    </Root>
  );
};
export default observer(AnalyticsScreenTable);
