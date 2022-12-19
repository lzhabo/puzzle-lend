import styled from "@emotion/styled";
import React from "react";
import { Navigate, RouteProps, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { PoolCardsVmProvider, usePoolCardsVM } from "./PoolCardsVm";
import Layout from "@components/Layout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { POOLS, ROUTES } from "@src/constants";
import Card from "@components/Card";
import RoundTokenIcon from "@components/RoundTokenIcon";
import tokenLogos from "@src/constants/tokenLogos";
import Button from "@components/Button";

interface IProps {}

const Root = styled.div<{ apySort?: boolean; liquiditySort?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 100%;
  max-width: calc(1328px + 32px);
  text-align: left;
`;

const PoolCardsContainer = styled.div`
  margin: 24px 0 0 0;
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;
const PoolCard = styled(Card)`
  padding: 0 !important;
  overflow: hidden;
`;
const PoolCardHeader = styled.div`
  background: linear-gradient(94.61deg, #16214b 0.61%, #213069 100%);
  padding: 24px;
`;
const PoolCardBody = styled.div`
  padding: 16px 24px 24px 24px;
`;
const PoolCardHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;
const PoolCardTitle = styled(Text)`
  font-size: 24px;
  line-height: 32px;
  color: white;
`;
const PoolCardTokens = styled.div`
  flex-grow: 1;
  display: flex;
  margin: 0 0 0 16px;
  justify-content: flex-end;
`;
const PoolCardInfo = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  @media (min-width: 560px) {
    flex-wrap: nowrap;
  }
`;
const PoolCardInfoItem = styled.div`
  width: 140px;
  margin: 4px 0;
  @media (min-width: 560px) {
    margin: 0;
    width: 180px;
  }
`;

const RoundTokenIconStyled = styled(RoundTokenIcon)`
  border: 2.5px solid #213069;
  margin: 0 -4px;
`;

const PoolCardsImpl: React.FC<IProps> = observer(() => {
  const vm = usePoolCardsVM();

  const poolStats = [
    { title: "Total supplied", value: "000" },
    { title: "Total borrowed", value: "000" },
    { title: "NET PAY", value: "000" }
  ];
  const accountStats = [
    { title: "My supply balance", value: "000" },
    { title: "My borrow balance", value: "000" },
    { title: "Account health", value: "000" }
  ];

  return (
    <Layout>
      <Root apySort={vm.sortApy} liquiditySort={vm.sortLiquidity}>
        <PoolCardsContainer>
          {[1, 2, 3, 4, 5].map((e) => (
            <PoolCard>
              <PoolCardHeader>
                <PoolCardHeaderContainer>
                  <div>
                    <PoolCardTitle size="big" type="light">
                      Main pool
                    </PoolCardTitle>
                    <Text size="medium" type="secondary">
                      Rapidly growing market with great liquidity and reliable
                      assets
                    </Text>
                  </div>
                  <PoolCardTokens>
                    {["USDT", "USDN", "WAVES"].map((e) => (
                      <RoundTokenIconStyled src={tokenLogos[e]} alt="logo" />
                    ))}
                  </PoolCardTokens>
                </PoolCardHeaderContainer>
                <SizedBox height={16} />
                <PoolCardInfo>
                  {poolStats.map((e) => (
                    <PoolCardInfoItem>
                      <Text size="medium" type="secondary">
                        {e.title}
                      </Text>
                      <Text type="white">{e.value}</Text>
                    </PoolCardInfoItem>
                  ))}
                </PoolCardInfo>
              </PoolCardHeader>
              <PoolCardBody>
                <PoolCardInfo>
                  {accountStats.map((e) => (
                    <PoolCardInfoItem>
                      <Text size="medium" type="secondary">
                        {e.title}
                      </Text>
                      <Text type="primary">{e.value}</Text>
                    </PoolCardInfoItem>
                  ))}
                </PoolCardInfo>
                <SizedBox height={16} />
                <Button kind={"secondary"} weight={"fat"} fixed size={"medium"}>
                  Go to market
                </Button>
              </PoolCardBody>
            </PoolCard>
          ))}
        </PoolCardsContainer>
      </Root>
    </Layout>
  );
});

const PoolCards: React.FC<IProps & RouteProps> = () => {
  const params = useParams<{ poolId: string }>();
  if (params.poolId && !POOLS.some((p) => p.address === params.poolId)) {
    return <Navigate to={ROUTES.ROOT} />;
  }
  return (
    <PoolCardsVmProvider poolId={params.poolId}>
      <PoolCardsImpl />
    </PoolCardsVmProvider>
  );
};

export default observer(PoolCards);
