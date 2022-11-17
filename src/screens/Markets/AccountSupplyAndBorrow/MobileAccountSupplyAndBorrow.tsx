import styled from "@emotion/styled";
import React, { useCallback } from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@src/components/Flex";
import SquareTokenIcon from "@components/SquareTokenIcon";
import Button from "@components/Button";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import { ROUTES } from "@src/constants";
import { useNavigate } from "react-router-dom";
import { ASSETS_TYPE } from "@src/constants";
import Tooltip from "@components/Tooltip";
import { TPoolStats } from "@src/stores/LendStore";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;
const Wrapper = styled.div`
  display: grid;
  width: 100%;
  gap: 24px;
  grid-template-columns: 1fr;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;
const Asset = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.colors.white};

  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 16px;
  @media (min-width: 768px) {
    padding: 24px;
  }
`;

const StatsRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: ${({ theme }) => `1px solid ${theme.colors.primary100}`};
  padding-bottom: 8px;
  margin-bottom: 16px;

  &:first-child {
    margin-top: 16px;
  }

  &:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }
`;

const Data = styled(Column)`
  & > * {
    margin-bottom: 16px;
  }
`;
const MobileAccountSupplyAndBorrow: React.FC<IProps> = () => {
  const { lendStore } = useStores();
  const navigate = useNavigate();

  const isSupplyDisabled = (token: TPoolStats): boolean => {
    if (token?.supplyLimit.eq(0)) return false;
    if (!token?.totalSupply || !token?.totalBorrow) return false;
    const reserves = BN.formatUnits(
      token?.totalSupply?.minus(token?.totalBorrow),
      token?.decimals
    );
    return reserves.gt(token?.supplyLimit.div(token.prices.min));
  };

  const openModal = useCallback(
    (
      e: React.MouseEvent,
      poolId: string,
      operationName: string,
      assetId: string
    ) => {
      e.stopPropagation();
      return navigate(`/${poolId}/${operationName}/${assetId}`);
    },
    [navigate]
  );

  return (
    <Root>
      <SizedBox height={40} />
      {lendStore.mobileDashboardAssets === ASSETS_TYPE.SUPPLY_BLOCK &&
        lendStore.accountSupply.length > 0 && (
          <Column crossAxisSize="max">
            <Text weight={500} type="secondary">
              My supply
            </Text>
            <SizedBox height={8} />
            <Wrapper>
              {lendStore.accountSupply.map((s) => {
                const supplied = BN.formatUnits(s.selfSupply, s.decimals);
                const dIncome = BN.formatUnits(s.dailyIncome, s.decimals);
                const data = [
                  {
                    title: "Supplied",
                    value: `${supplied.toFormat(4)} ${s.symbol}`,
                    dollarValue: "$ " + supplied.times(s.prices.min).toFormat(2)
                  },
                  { title: "Supply APY", value: s.supplyAPY.toFormat(2) + "%" },
                  {
                    title: "Daily income",
                    value: `${dIncome.toFormat(6)} ` + s.symbol,
                    dollarValue: "$ " + dIncome.times(s.prices.min).toFormat(6)
                  }
                ];
                return (
                  <Asset key={`token-${s.assetId}`}>
                    <Row
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        navigate(
                          ROUTES.DASHBOARD_TOKEN_DETAILS.replace(
                            ":poolId",
                            lendStore.pool.address
                          ).replace(":assetId", s.assetId)
                        )
                      }
                    >
                      <SquareTokenIcon size="small" src={s.logo} alt="token" />
                      <SizedBox width={16} />
                      <Column>
                        <Text>{s.symbol}</Text>
                        <Text size="small" type="secondary">
                          ${s.prices.max.toFormat(2)}
                        </Text>
                      </Column>
                    </Row>
                    <SizedBox height={16} />
                    <Data crossAxisSize="max">
                      {data.map(({ title, value, dollarValue }, index) => (
                        <StatsRow key={`asset-${index}`}>
                          <Text fitContent nowrap>
                            {title}
                          </Text>
                          <Column crossAxisSize="max">
                            <Text weight={500} textAlign="right" size="medium">
                              {value}
                            </Text>
                            {dollarValue && (
                              <Text size="medium" textAlign="right">
                                {dollarValue}
                              </Text>
                            )}
                          </Column>
                        </StatsRow>
                      ))}
                    </Data>
                    <SizedBox height={16} />
                    <Row>
                      {isSupplyDisabled(s) ? (
                        <Tooltip
                          fixed
                          content={
                            <Text textAlign="left">
                              Maximum total supply is reached
                            </Text>
                          }
                        >
                          <Button
                            size="medium"
                            kind="secondary"
                            fixed
                            disabled={true}
                            onClick={(e) =>
                              openModal(
                                e,
                                lendStore.poolId,
                                "supply",
                                s.assetId
                              )
                            }
                          >
                            Supply
                          </Button>
                        </Tooltip>
                      ) : (
                        <Button
                          size="medium"
                          kind="secondary"
                          fixed
                          onClick={(e) =>
                            openModal(e, lendStore.poolId, "supply", s.assetId)
                          }
                        >
                          Supply
                        </Button>
                      )}
                      <SizedBox width={8} />
                      <Button
                        size="medium"
                        kind="secondary"
                        fixed
                        onClick={(e) =>
                          openModal(e, lendStore.poolId, "withdraw", s.assetId)
                        }
                      >
                        Withdraw
                      </Button>
                    </Row>
                  </Asset>
                );
              })}
            </Wrapper>
          </Column>
        )}
      {lendStore.mobileDashboardAssets === ASSETS_TYPE.BORROW_BLOCK &&
        lendStore.accountBorrow.length > 0 && (
          <Column crossAxisSize="max">
            <Text weight={500} type="secondary">
              My borrow
            </Text>
            <SizedBox height={8} />
            <Wrapper>
              {lendStore.accountBorrow.map((s) => {
                const borrowed = BN.formatUnits(s.selfBorrow, s.decimals);
                const data = [
                  {
                    title: "Borrow APR",
                    value: `${s.borrowAPY.toFormat(2)} %`
                  },
                  {
                    title: "To be repaid",
                    value: `${borrowed.toFormat(2)} ${s.symbol}`,
                    dollarValue: "$ " + borrowed.times(s.prices.min).toFormat(6)
                  },
                  {
                    title: "Daily loan interest",
                    value:
                      BN.formatUnits(s.dailyLoan, s.decimals).toFormat(6) +
                      ` ${s.symbol}`,
                    dollarValue:
                      "$ " +
                      BN.formatUnits(s.dailyLoan, s.decimals)
                        .times(s.prices.min)
                        .toFormat(6)
                  }
                ];
                return (
                  <Asset key={`token-${s.assetId}`}>
                    <Row
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        navigate(
                          ROUTES.DASHBOARD_TOKEN_DETAILS.replace(
                            ":poolId",
                            lendStore.pool.address
                          ).replace(":assetId", s.assetId)
                        )
                      }
                    >
                      <SquareTokenIcon size="small" src={s.logo} alt="token" />
                      <SizedBox width={16} />
                      <Column>
                        <Text>{s.symbol}</Text>
                        <Text size="small" type="secondary">
                          ${s.prices.max.toFormat(2)}
                        </Text>
                      </Column>
                    </Row>
                    <SizedBox height={16} />
                    <Data crossAxisSize="max">
                      {data.map(({ title, value, dollarValue }, index) => (
                        <StatsRow
                          style={{ cursor: "pointer" }}
                          key={`asset-${index}`}
                        >
                          <Text fitContent nowrap>
                            {title}
                          </Text>
                          <Column crossAxisSize="max">
                            <Text weight={500} textAlign="right" size="medium">
                              {value}
                            </Text>
                            {dollarValue && (
                              <Text size="medium" textAlign="right">
                                {dollarValue}
                              </Text>
                            )}
                          </Column>
                        </StatsRow>
                      ))}
                    </Data>
                    <SizedBox height={16} />
                    <Row>
                      <Button
                        size="medium"
                        kind="secondary"
                        fixed
                        onClick={(e) =>
                          openModal(e, lendStore.poolId, "borrow", s.assetId)
                        }
                      >
                        Borrow
                      </Button>
                      <SizedBox width={8} />
                      <Button
                        size="medium"
                        kind="secondary"
                        fixed
                        onClick={(e) =>
                          openModal(e, lendStore.poolId, "repay", s.assetId)
                        }
                      >
                        Repay
                      </Button>
                    </Row>
                  </Asset>
                );
              })}
            </Wrapper>
          </Column>
        )}
    </Root>
  );
};
export default observer(MobileAccountSupplyAndBorrow);
