import styled from "@emotion/styled";
import { Row } from "@components/Flex";
import React, { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import {
  TotalRewardsVMProvider,
  useTotalRewardsVM
} from "@screens/Dashboard/TotalRewards/TotalRewardsVM";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: ${({ theme }) => `${theme.colors.white}`};
  border: 1px solid ${({ theme }) => `${theme.colors.primary100}`};
  border-radius: 16px;
  margin-top: 24px;
  align-self: flex-start;
  align-items: center;
  flex-direction: column;
  margin: 50px auto 20px auto;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 880px) {
    width: 50%;
  }

  @media (min-width: 1440px) {
    width: calc(100% - 32px);
    max-width: 312px;
    margin-left: 40px;
    margin-top: 24px;
  }
`;

const Icon = styled.div`
  width: 40px;
  min-width: 40px;
  height: 40px;
  border: 1px solid ${({ theme }) => `${theme.colors.primary100}`};
  border-radius: 8px;
  margin: 8px 0 8px 0;
  box-sizing: border-box;
`;

const BasicData = styled.div`
  margin-top: 8px;
  display: flex;
  color: ${({ theme }) => theme.colors.primary800};
  justify-content: space-between;
  //width: 100%;
`;
const Title = styled.div``;
const Amount = styled.div``;
const SecondaryData = styled.div`
  margin-bottom: 8px;
  display: flex;
  color: ${({ theme }) => theme.colors.primary650};
  justify-content: space-between;
`;
const Name = styled.div``;
const Total = styled.div``;
const Wrapper = styled.div`
  display: block;
  width: 100%;
  margin-left: 8px;
  font-size: 14px;
  line-height: 20px;
`;

const TotalRewardsImpl: React.FC = () => {
  const { lendStore, accountStore } = useStores();
  const vm = useTotalRewardsVM();
  // const theme = useTheme();
  const data = [
    {
      title: "Waves Token",
      name: "Waves",
      value: "100",
      totalValue: "10000"
    },
    {
      title: "Bitcoin",
      name: "btc",
      value: "100",
      totalValue: "10000"
    },
    {
      title: "Ethereum",
      name: "Eth",
      value: "10",
      totalValue: "100"
    },
    {
      title: "Neutrino USD",
      name: "usdn",
      value: "1000",
      totalValue: "10000"
    }
  ];

  const [dataAcc, setDataAcc] = useState<any>([]);
  useMemo(() => {
    const accountSupply = lendStore.accountSupply;
    setDataAcc(accountSupply);
  }, [lendStore.pool.address]);
  return (
    <>
      {console.log("accountSupply", dataAcc)}
      {accountStore.address && (
        <Root>
          {data.map(({ title, name, value, totalValue }) => (
            <Row alignItems="center" justifyContent="space-between">
              <Icon />
              <Wrapper>
                <BasicData>
                  <Title>{title}</Title>
                  <Amount>{value}</Amount>
                </BasicData>
                <SecondaryData>
                  <Name>{name.toUpperCase()}</Name>
                  <Total>{totalValue}</Total>
                </SecondaryData>
              </Wrapper>
            </Row>
          ))}
        </Root>
      )}
    </>
  );
};

const TotalRewards: React.FC = () => {
  return (
    <TotalRewardsVMProvider>
      <TotalRewardsImpl />
    </TotalRewardsVMProvider>
  );
};

export default observer(TotalRewards);
