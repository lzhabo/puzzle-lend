import styled from "@emotion/styled";
import React from "react";
import Text from "@src/components/Text";
import { Column, Row } from "@src/components/Flex";
import SquareTokenIcon from "@components/SquareTokenIcon";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import { useStores } from "@stores";
import BN from "@src/utils/BN";
import { observer } from "mobx-react-lite";

interface IProps {}

const Root = styled.div`
  display: grid;
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
const MobileAssetsTable: React.FC<IProps> = () => {
  const { lendStore } = useStores();
  return (
    <Root>
      {lendStore.poolsStats.map((s) => {
        const data = [
          {
            title: "Total supply",
            value:
              BN.formatUnits(s.totalSupply, s.decimals).toFormat(2) +
              ` ${s.symbol}`,
          },
          { title: "Supply APY", value: s.supplyAPY.toFormat(2) + " %" },
          {
            title: "Total borrow",
            value:
              BN.formatUnits(s.totalBorrow, s.decimals).toFormat(2) +
              ` ${s.symbol}`,
          },
          { title: "Borrow APY", value: s.borrowAPY.toFormat(2) + " %" },
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
              {data.map(({ title, value }) => (
                <Row key={`asset-${value}`} justifyContent="space-between">
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
                Borrow
              </Button>
            </Row>
          </Asset>
        );
      })}
    </Root>
  );
};
export default observer(MobileAssetsTable);
