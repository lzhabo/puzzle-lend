import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { IToken, POOL_CONFIG } from "@src/constants";
import Text from "@components/Text";
import TableRow from "@screens/Landing/TokensList/TableRow";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import ShowMoreButton from "./ShowMoreButton";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #f1f2fe;
  border-radius: 12px;
  margin-top: 24px;
  @media (min-width: 880px) {
    margin-top: 56px;
  }
`;

const Table = styled.table`
  text-align: left;
  border-spacing: 0;

  th,
  td {
    padding: 0 16px;
    height: 48px;
    box-sizing: border-box;
    border-bottom: 1px solid #f1f2fe;
  }

  tr {
    :last-of-type {
      & > td {
        border-bottom: none;
      }
    }
    .tableText {
      font-size: 12px;
      @media (min-width: 350px) {
        font-size: 14px;
      }
      @media (min-width: 380px) {
        font-size: 16px;
      }
    }
  }

  td {
    height: 64px;
    background: transparent;
    padding: 0 8px;
    @media (min-width: 350px) {
      padding: 0 12px;
    }
    @media (min-width: 380px) {
      padding: 0 16px;
    }
  }

  @media (min-width: 880px) {
    th,
    td {
      padding: 0 24px;
      width: 200px;
    }
  }
`;

const tokens = Object.entries(POOL_CONFIG).reduce(
  (acc, [id, { tokens }]) => [
    ...acc,
    ...tokens
      .filter((token) => acc.every(({ assetId }) => assetId !== token.assetId))
      .map((t) => ({ ...t, poolId: id })),
  ],
  [] as Array<IToken & { poolId: string }>
);

const TokensTable: React.FC<IProps> = () => {
  const { poolsStore } = useStores();
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const interval = setInterval(
      () =>
        setBalances(
          tokens.reduce(
            (acc, { assetId }) => ({
              ...acc,
              [assetId]: poolsStore.usdnRate(assetId)?.toFormat(2) ?? "0.00",
            }),
            {} as Record<string, string>
          )
        ),
      15000
    );
    return () => clearInterval(interval);
  }, [balances, poolsStore]);

  return (
    <Root>
      <Table>
        <thead>
          <tr>
            <th>
              <Text type="secondary">Asset</Text>
            </th>
            <th>
              <Text type="secondary">Price</Text>
            </th>
            <th />
          </tr>
        </thead>
        <tbody>
          {(opened ? tokens : tokens.slice(0, 5)).map((v) => (
            <TableRow
              key={v.assetId}
              v={{ ...v, balance: balances[v.assetId] ?? "0.00" }}
            />
          ))}
          <ShowMoreButton onClick={() => setOpened((v) => !v)}>
            {opened ? "Show less" : "Show  more"}
          </ShowMoreButton>
        </tbody>
      </Table>
    </Root>
  );
};

export default observer(TokensTable);
