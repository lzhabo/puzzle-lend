import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import GridTable from "@components/GridTable";
import { observer } from "mobx-react-lite";
import { useInvestToPoolInterfaceVM } from "@screens/InvestToPoolInterface/InvestToPoolInterfaceVM";
import Skeleton from "react-loading-skeleton";
import Transaction from "./Transaction";
import Loading from "@components/Loading";
import { useStores } from "@stores";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 24px;
`;
const PoolHistory: React.FC<IProps> = () => {
  const { poolsStore } = useStores();
  const vm = useInvestToPoolInterfaceVM();
  return (
    <Root>
      <Text weight={500} type="secondary">
        Pool history
      </Text>
      <SizedBox height={8} />
      <Card
        style={{ padding: 0, overflow: "auto", maxWidth: "calc(100vw - 32px)" }}
      >
        <GridTable
          style={{ width: "fit-content", minWidth: "100%" }}
          desktopTemplate={"2fr 1fr 1fr"}
          mobileTemplate={"2fr 1fr 1fr"}
        >
          <div className="gridTitle">
            <div>Details</div>
            <div>Value</div>
            <div>Time</div>
          </div>
          {vm.transactionsHistory == null ? (
            <Skeleton
              height={45}
              count={3}
              style={{ margin: "16px 24px", width: "calc(100% - 48px)" }}
            />
          ) : (
            <>
              {vm.transactionsHistory.map((tr) => (
                <Transaction
                  {...tr}
                  key={tr.id}
                  usdnRate={poolsStore.usdnRate}
                />
              ))}
              <SizedBox height={16} />
              <Text
                type="secondary"
                weight={500}
                textAlign="center"
                style={{ cursor: "pointer" }}
                onClick={async () => {
                  if (!vm.loadingHistory) {
                    await vm.loadMoreHistory();
                  }
                }}
              >
                {vm.loadingHistory ? <Loading big /> : "Load more"}
              </Text>
              <SizedBox height={16} />
            </>
          )}
        </GridTable>
      </Card>
    </Root>
  );
};
export default observer(PoolHistory);
