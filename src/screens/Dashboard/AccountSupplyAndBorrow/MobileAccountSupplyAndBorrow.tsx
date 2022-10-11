import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@src/components/Flex";
import SquareTokenIcon from "@components/SquareTokenIcon";
import Button from "@components/Button";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import { TOKENS_BY_SYMBOL } from "@src/constants";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  @media (min-width: 768px) {
    //gap: 24px;
  }
`;
const Wrapper = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;
// const Card = styled.div();
const Asset = styled.div`
  padding: 16px;
  width: 100%;
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
  //todo change for supply and borrow
  return (
    <Root>
      <Column crossAxisSize="max">
        <Text weight={500} type="secondary">
          My supply
        </Text>
        <SizedBox height={8} />
        <Wrapper>
          {[TOKENS_BY_SYMBOL["WAVES"]].map((s) => {
            const data = [
              {
                title: "Supplied",
                value: "supply",
              },
              { title: "Supply APY", value: "supply" },
              {
                title: "Daily income",
                value: "supply",
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
                      1
                    </Text>
                  </Column>
                </Row>
                <SizedBox height={16} />
                <Data crossAxisSize="max">
                  {data.map(({ title, value }, index) => (
                    <Row key={`asset-${index}`} justifyContent="space-between">
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
      <SizedBox height={40} />
      <Column>
        <Text weight={500} type="secondary">
          My borrow
        </Text>
        <SizedBox height={8} />
        <Wrapper>
          {[TOKENS_BY_SYMBOL["WAVES"]].map((s) => {
            const data = [
              {
                title: "Borrow APR",
                value: "borrow",
              },
              { title: "To be repaid", value: "borrow" },
            ];
            return (
              <Asset key={`token-${s.assetId}`}>
                <Row>
                  <SquareTokenIcon size="small" src={s.logo} alt="token" />
                  <SizedBox width={16} />
                  <Column>
                    <Text>{s.symbol}</Text>
                    <Text size="small" type="secondary">
                      1
                    </Text>
                  </Column>
                </Row>
                <SizedBox height={16} />
                <Data crossAxisSize="max">
                  {data.map(({ title, value }, index) => (
                    <Row key={`asset-${index}`} justifyContent="space-between">
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
    </Root>
  );
};
export default observer(MobileAccountSupplyAndBorrow);
