import styled from "@emotion/styled";
import React, { useCallback } from "react";
import Text from "@src/components/Text";
import { Column, Row } from "@src/components/Flex";
import SquareTokenIcon from "@components/SquareTokenIcon";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import { useStores } from "@stores";
import BN from "@src/utils/BN";
import { observer } from "mobx-react-lite";
import Skeleton from "react-loading-skeleton";
import { ROUTES } from "@src/constants";
import { useNavigate } from "react-router-dom";
import Tooltip from "@components/Tooltip";
import { TPoolStats } from "@src/stores/LendStore";
import { useTheme } from "@emotion/react";

interface IProps {}

const Root = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const SupplyApy = styled.div`
  display: flex;
  justify-content: flex-end;

  > div {
    white-space: nowrap;
    display: flex;
    img {
      margin: 1px 4px 0 -1px;
    }
  }
`;

const TooltipText = styled(Text)`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  max-width: 180px;
  white-space: normal;
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
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary100};
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
const MobileAssetsTable: React.FC<IProps> = () => {
  const { lendStore } = useStores();
  const navigate = useNavigate();
  const theme = useTheme();

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

  const isSupplyDisabled = (token: TPoolStats): boolean => {
    if (token?.supplyLimit.eq(0)) return false;
    if (!token?.totalSupply || !token?.totalBorrow) return false;
    const reserves = BN.formatUnits(
      token?.totalSupply?.minus(token?.totalBorrow),
      token?.decimals
    );
    return reserves.gt(token?.supplyLimit.div(token.prices.min));
  };

  return (
    <Root>
      {lendStore.initialized
        ? lendStore.poolsStats.map((s) => {
            const data = [
              {
                title: "Total supply",
                value: `${BN.formatUnits(s.totalSupply, s.decimals).toFormat(
                  2
                )} ${s.symbol}`,
                dollarValue:
                  "$ " +
                  BN.formatUnits(s.totalSupply, s.decimals)
                    .times(s.prices.min)
                    .toFormat(2)
              },
              {
                title: "Supply APY",
                value: (
                  <SupplyApy>
                    <div>
                      <Tooltip
                        config={{ placement: "top-start" }}
                        content={
                          <TooltipText textAlign="left">
                            Non-borrowed tokens are automatically staked within
                            native protocol to generate additional interest
                          </TooltipText>
                        }
                      >
                        {s.isAutostakeAvl && (
                          <img
                            src={theme.images.icons.autostaking}
                            alt="autostaking"
                            className="autostaking-icon"
                          />
                        )}
                      </Tooltip>
                      {s.supplyAPY.toFormat(2) + " %"}
                    </div>
                  </SupplyApy>
                )
              },
              {
                title: "Total borrow",
                value: `${BN.formatUnits(s.totalBorrow, s.decimals).toFormat(
                  2
                )} ${s.symbol}`,
                dollarValue:
                  "$ " +
                  BN.formatUnits(s.totalBorrow, s.decimals)
                    .times(s.prices.min)
                    .toFormat(2)
              },
              {
                title: "Borrow APY",
                value: `${s.borrowAPY.toFormat(2)} %`
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
                          openModal(e, lendStore.poolId, "supply", s.assetId)
                        }
                      >
                        Supply
                      </Button>
                    </Tooltip>
                  ) : (
                    <Button
                      kind="secondary"
                      size="medium"
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
                    kind="secondary"
                    size="medium"
                    fixed
                    onClick={(e) =>
                      openModal(e, lendStore.poolId, "borrow", s.assetId)
                    }
                  >
                    Borrow
                  </Button>
                </Row>
              </Asset>
            );
          })
        : Array.from({
            length: 4
          }).map((_, index) => (
            <Skeleton height={356} key={`${index}skeleton-row`} />
          ))}
    </Root>
  );
};
export default observer(MobileAssetsTable);
