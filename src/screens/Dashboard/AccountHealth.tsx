import styled from "@emotion/styled";
import { Column, Row } from "@src/components/Flex";
import React from "react";
import Text from "@components/Text";
import Tooltip from "@components/Tooltip";
import SizedBox from "@components/SizedBox";
import CircularProgressbar from "@components/CircularProgressbar";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import { useTheme } from "@emotion/react";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;

  background: ${({ theme }) => `${theme.colors.white}`};

  border: 1px solid ${({ theme }) => `${theme.colors.primary100}`};
  border-radius: 16px;
  margin-top: 32px;
  @media (min-width: 1300px) {
    min-width: 310px;
    margin-left: 40px;
    flex-direction: column;
  }
`;
const Title = styled(Text)`
  border-bottom: 1px dashed ${({ theme }) => `${theme.colors.primary650}`};
`;
const Health = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  position: relative;
`;
const AccountHealth: React.FC<IProps> = () => {
  const { lendStore, accountStore } = useStores();
  const theme = useTheme();
  if (accountStore.address == null) return <></>;
  const data = [
    {
      title: "Supply balance",
      value: `$ ${lendStore.accountSupplyBalance.toFormat(2)}`,
      description: "USD value of your deposits in total",
    },
    {
      title: "Borrow balance",
      value: `$ ${lendStore.accountBorrowBalance.toFormat(2)}`,
      description: "USD value of your borrows in total",
    },
    {
      title: "NET APY",
      value: `${lendStore.netApy.toFormat(2)} %`,
      border: true,
      description:
        "Your annual net profit(expenses) relative to your deposits(loans) USD value.",
    },
  ];
  console.log(data);
  return (
    <Root>
      <Health>
        <Text weight={500} type="secondary" fitContent>
          Account
        </Text>
        <CircularProgressbar
          style={{
            position: "absolute",
            top: -75,
            right: "calc(50% - 55px)",
          }}
          text="Account Health"
          percent={lendStore.health.toDecimalPlaces(2).toNumber()}
        />
        <Text weight={500} type="secondary" fitContent>
          Health
        </Text>
      </Health>
      <SizedBox height={10} />
      <Column crossAxisSize="max">
        {data.map(({ title, value, description, border }) => (
          <Row
            key={`account-health-${value}`}
            justifyContent="space-between"
            style={{
              marginBottom: 14,
              borderTop: border ? `1px solid ${theme.colors.primary100}` : "",
              paddingTop: border ? `14px` : "",
            }}
          >
            <Tooltip content={<Text>{description}</Text>}>
              <Title fitContent type="secondary">
                {title}
              </Title>
            </Tooltip>
            <Text fitContent>{value}</Text>
          </Row>
        ))}
      </Column>
    </Root>
  );
};
export default observer(AccountHealth);
