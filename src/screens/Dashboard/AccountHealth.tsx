import styled from "@emotion/styled";
import { Column, Row } from "@src/components/Flex";
import React from "react";
import Text from "@components/Text";
import Tooltip from "@components/Tooltip";
import SizedBox from "@components/SizedBox";
import CircularProgressbar from "@components/CircularProgressbar";
import LoginTypesRender from "@components/LoginTypes";
import Card from "@components/Card";
import { LOGIN_TYPE } from "@stores/AccountStore";
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
  align-self: flex-start;
  align-items: center;
  max-width: 312px;
  flex-direction: column;
  margin: 50px auto 0 auto;
  width: calc(100% - 32px);
  box-sizing: border-box;

  @media (min-width: 880px) {
    width: 50%;
  }

  @media (min-width: 1440px) {
    margin-left: 40px;
    margin-top: 22px;
    position: sticky;
    top: 117px;
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
const LoginHeader = styled.div`
  display: block;
  position: relative;

  &:after {
    position: absolute;
    content: "";
    bottom: -16px;
    transform: translateX(-50%);
    left: 50%;
    background-color: #f1f2fe;
    width: 110%;
    height: 1px;
  }
`;
const AccountHealth: React.FC<IProps> = () => {
  const { lendStore, accountStore } = useStores();
  const theme = useTheme();
  const data = [
    {
      title: "Supply balance",
      value: `$ ${lendStore.accountSupplyBalance.toFormat(2)}`,
      description: "USD value of your deposits in total"
    },
    {
      title: "Borrow balance",
      value: `$ ${lendStore.accountBorrowBalance.toFormat(2)}`,
      description: "USD value of your borrows in total"
    },
    {
      title: "NET APY",
      value: `${lendStore.netApy.toFormat(2)} %`,
      border: true,
      description:
        "Your annual net profit (expenses) relative to your deposits (loans) USD value."
    }
  ];
  const handleLogin = (loginType: LOGIN_TYPE) => accountStore.login(loginType);
  const isKeeperDisabled = !accountStore.isWavesKeeperInstalled;
  return (
    <Root>
      {accountStore.address ? (
        <>
          <Health>
            <Text weight={500} type="secondary" fitContent>
              Account
            </Text>
            <CircularProgressbar
              style={{
                position: "absolute",
                top: -75,
                right: "calc(50% - 55px)"
              }}
              text="Account Health"
              percent={lendStore.health.toDecimalPlaces(2).toNumber()}
            />
          </Health>
          <SizedBox height={10} />
          <Column crossAxisSize="max">
            {data.map(({ title, value, description, border }, index) => (
              <Row
                key={`account-health-${value}-${index}`}
                justifyContent="space-between"
                style={{
                  marginBottom: 14,
                  borderTop: border
                    ? `1px solid ${theme.colors.primary100}`
                    : "",
                  paddingTop: border ? `14px` : ""
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
        </>
      ) : (
        <>
          <SizedBox height={8} />
          <LoginHeader>
            <Text weight={500}>Connect wallet</Text>
          </LoginHeader>
          <SizedBox height={32} />
          <LoginTypesRender
            isKeeperDisabled={isKeeperDisabled}
            handleLogin={handleLogin}
          />
        </>
      )}
    </Root>
  );
};
export default observer(AccountHealth);
