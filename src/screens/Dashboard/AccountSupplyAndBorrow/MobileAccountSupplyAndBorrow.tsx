import styled from "@emotion/styled";
import React from "react";
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

const Data = styled(Column)`
  & > * {
    margin-bottom: 16px;
  }
`;
const MobileAccountSupplyAndBorrow: React.FC<IProps> = () => {
  const { lendStore } = useStores();
  const navigate = useNavigate();
  return (
    <Root>
      {lendStore.accountSupply.length > 0 && (
        <Column crossAxisSize="max">
          <Text weight={500} type="secondary">
            My supply
          </Text>
          <SizedBox height={8} />
          <Wrapper>
            {lendStore.accountSupply.map((s) => {
              const supplied = BN.formatUnits(s.selfSupply, s.decimals);
              const data = [
                {
                  title: "Supplied",
                  value: `${supplied.toFormat(4)} ${s.symbol}`,
                },
                { title: "Supply APY", value: s.supplyAPY.toFormat(2) + "%" },
                {
                  title: "Daily income",
                  value:
                    `${BN.formatUnits(s.dailyIncome, s.decimals).toFormat(
                      6
                    )} ` + s.symbol,
                },
              ];
              return (
                <Asset key={`token-${s.assetId}`}>
                  <Row>
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
                    {data.map(({ title, value }, index) => (
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
                        key={`asset-${index}`}
                        justifyContent="space-between"
                      >
                        <Text fitContent>{title}</Text>
                        <Text fitContent type="secondary">
                          {value}
                        </Text>
                      </Row>
                    ))}
                  </Data>
                  <SizedBox height={16} />
                  <Row>
                    <Button size="medium" kind="secondary" fixed>
                      Supply
                    </Button>
                    <SizedBox width={8} />
                    <Button size="medium" kind="secondary" fixed>
                      Withdraw
                    </Button>
                  </Row>
                </Asset>
              );
            })}
          </Wrapper>
        </Column>
      )}
      <SizedBox height={40} />
      {lendStore.accountBorrow.length > 0 && (
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
                  value: `${s.borrowAPY.toFormat(2)} %`,
                },
                {
                  title: "To be repaid",
                  value: `${borrowed.toFormat(2)} ${s.symbol}`,
                },
                {
                  title: "Daily loan interest",
                  value:
                    BN.formatUnits(s.dailyLoan, s.decimals).toFormat(6) +
                    ` ${s.symbol}`,
                },
              ];
              return (
                <Asset key={`token-${s.assetId}`}>
                  <Row>
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
                    {data.map(({ title, value }, index) => (
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
                        key={`asset-${index}`}
                        justifyContent="space-between"
                      >
                        <Text fitContent>{title}</Text>
                        <Text fitContent type="secondary">
                          {value}
                        </Text>
                      </Row>
                    ))}
                  </Data>
                  <SizedBox height={16} />
                  <Row>
                    <Button size="medium" kind="secondary" fixed>
                      Supply
                    </Button>
                    <SizedBox width={8} />
                    <Button size="medium" kind="secondary" fixed>
                      Withdraw
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
