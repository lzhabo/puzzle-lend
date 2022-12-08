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
import { useTheme } from "@emotion/react";

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

  background: ${({ theme }) => theme.colors.marketCard.gradient};
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

const MarketCards: React.FC<IProps> = () => {
  const { marketsStore, accountStore } = useStores();
  const navigate = useNavigate();
  const theme = useTheme();
  return (
    <Root>
      {marketsStore.markets.length === 0 ? (
        <>
          <Skeleton height={56} style={{ marginBottom: 8 }} count={4} />
          <Skeleton height={56} style={{ marginBottom: 8 }} count={4} />
        </>
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
            const userData = [
              {
                title: "My supply balance",
                value: accountStore.address == null ? "—" : "0.00"
              },
              {
                title: "My borrow balance",
                value: accountStore.address == null ? "—" : "0.00"
              }
            ];
            const handleGoToMarket = () => navigate(`/${contractAddress}`);
            return (
              <div key={`market-card-${contractAddress}`}>
                <TopMarketCard>
                  <Row justifyContent="space-between">
                    <Column>
                      <Text
                        size="newBig"
                        fitContent
                        style={{ color: theme.colors.marketCard.titleText }}
                      >
                        {title}
                      </Text>
                      <SizedBox height={4} />
                      <Text
                        style={{ color: theme.colors.marketCard.subTitleText }}
                      >
                        {description}
                      </Text>
                    </Column>
                    <AssetsPic assets={assets ?? []} />
                  </Row>
                  <SizedBox height={16} />
                  <Row>
                    {marketStats.map(({ title, value }, i) => (
                      <Column crossAxisSize="max" key={i}>
                        <Text
                          type="secondary"
                          size="medium"
                          style={{
                            color: theme.colors.marketCard.subTitleText
                          }}
                        >
                          {title}
                        </Text>
                        <Text
                          weight={500}
                          style={{ color: theme.colors.marketCard.titleText }}
                        >{`$ ${value.toFormat(2)}`}</Text>
                      </Column>
                    ))}
                  </Row>
                </TopMarketCard>
                <BottomMarketCard>
                  <Row justifyContent="space-between" alignItems="flex-start">
                    {userData.map(({ title, value }, i) => (
                      <Column crossAxisSize="max" key={i}>
                        <Text
                          type="secondary"
                          size="medium"
                          style={{
                            color: theme.colors.marketCard.accountBalanceTitle
                          }}
                        >
                          {title}
                        </Text>
                        <Text
                          weight={500}
                          style={{
                            color: theme.colors.marketCard.accountBalanceValue
                          }}
                        >
                          {value}
                        </Text>
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
export default observer(MarketCards);
