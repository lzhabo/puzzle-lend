import styled from "@emotion/styled";
import React from "react";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import Text from "@components/Text";
import { Column, Row } from "@src/components/Flex";
import Skeleton from "react-loading-skeleton";
import SizedBox from "@components/SizedBox";
import AssetsPic from "@components/AssetsPic";
import BN from "@src/utils/BN";
import Button from "@components/Button";
import { useNavigate } from "react-router-dom";

interface IProps {}

const Root = styled.div`
  display: grid;
  gap: 24px;
  @media (min-width: 880px) {
    grid-template-columns: 1fr 1fr;
    flex-direction: row;
  }
`;
const TopMarketCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  @media (min-width: 880px) {
    padding: 24px;
  }

  background: linear-gradient(94.61deg, #16214b 0.61%, #213069 100%);
  border-radius: 16px 16px 0 0;
`;
const BottomMarketCard = styled.div`
  padding: 24px 16px;
  border-radius: 0 0 16px 16px;

  background: ${({ theme }) => theme.colors.white};
  @media (min-width: 880px) {
    padding: 24px;
  }
`;

const PoolCards: React.FC<IProps> = () => {
  const { marketsStore } = useStores();
  const navigate = useNavigate();
  return (
    <Root>
      {marketsStore.markets.length == 0 ? (
        <Skeleton height={56} style={{ marginBottom: 8 }} count={4} />
      ) : (
        marketsStore.markets.map(
          ({ title, description, contractAddress, assets, statistics }) => {
            const marketStats = [
              {
                title: "Total supplied",
                value: new BN(statistics?.totalSupplied ?? 0)
              },
              {
                title: "Total borrowed",
                value: new BN(statistics?.totalBorrowed ?? 0)
              }
            ];
            const handleGoToMarket = () => navigate(`/`);
            return (
              <div key={`market-card-${contractAddress}`}>
                <TopMarketCard>
                  <Row justifyContent="space-between">
                    <Column>
                      <Text size="newBig" fitContent>
                        {title}
                      </Text>
                      <SizedBox height={4} />
                      <Text>{description}</Text>
                    </Column>
                    <AssetsPic assets={assets ?? []} />
                  </Row>
                  <SizedBox height={16} />
                  <Row>
                    {marketStats.map(({ title, value }) => (
                      <Column crossAxisSize="max">
                        <Text type="secondary" size="medium">
                          {title}
                        </Text>
                        <Text weight={500}>{`$ ${value.toFormat(2)}`}</Text>
                      </Column>
                    ))}
                  </Row>
                </TopMarketCard>
                <BottomMarketCard>
                  <Row justifyContent="space-between" alignItems="flex-start">
                    {marketStats.map(({ title, value }) => (
                      <Column crossAxisSize="max">
                        <Text type="secondary" size="medium">
                          {title}
                        </Text>
                        <Text weight={500}>{`$ ${value.toFormat(2)}`}</Text>
                      </Column>
                    ))}
                  </Row>
                  <SizedBox height={16} />
                  <Button
                    fixed
                    kind="secondary"
                    size="medium"
                    onClick={handleGoToMarket}
                  >
                    Go to market
                  </Button>
                </BottomMarketCard>
              </div>
            );
          }
        )
      )}
    </Root>
  );
};
export default observer(PoolCards);
