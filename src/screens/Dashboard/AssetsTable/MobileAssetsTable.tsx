import styled from "@emotion/styled";
import React from "react";
import { useDashboardVM } from "@screens/Dashboard/DashboardVm";
import Text from "@src/components/Text";
import { Column, Row } from "@src/components/Flex";
import SquareTokenIcon from "@components/SquareTokenIcon";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";

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
  const vm = useDashboardVM();
  return (
    <Root>
      {vm.tokens.map((token) => {
        const data = [
          { title: "LTV", value: "5.9M" + token.symbol },
          { title: "Total supply", value: "5.9M" + token.symbol },
          { title: "Supply APY", value: "12.88%" },
          { title: "Total borrow", value: "27.2K" + token.symbol },
          { title: "Borrow APR", value: "181.17%" },
        ];
        return (
          <Asset key={`token-${token.assetId}`}>
            <Row>
              <SquareTokenIcon size="small" src={token.logo} alt="token" />
              <SizedBox width={16} />
              <Column>
                <Text>{token.symbol}</Text>
                <Text size="small" type="secondary">
                  {token.symbol}
                </Text>
              </Column>
            </Row>
            <SizedBox height={16} />
            <Data crossAxisSize="max">
              {data.map(({ title, value }) => (
                <Row justifyContent="space-between">
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
export default MobileAssetsTable;
