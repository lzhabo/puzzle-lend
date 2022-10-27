import React, { HTMLAttributes } from "react";
import styled from "@emotion/styled";
import SizedBox from "@components/SizedBox";
import { Column } from "@src/components/Flex";
import Text from "@components/Text";
import { LOGIN_TYPE } from "@stores/AccountStore";
import seed from "@src/assets/icons/seed.svg";
import email from "@src/assets/icons/email.svg";
import keeper from "@src/assets/icons/keeper.svg";
import { Anchor } from "@components/Anchor";

interface IProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  icon: string;
  type: LOGIN_TYPE;
}

const Root = styled.div<{ disable?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 16px 24px;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  box-sizing: border-box;
  border-radius: 12px;
  margin: 4px 0;
  cursor: ${({ disable }) => (disable ? "not-allowed" : "pointer")};
`;
const Icon = styled.img`
  width: 24px;
  height: 24px;
  display: flex;
  flex-direction: column;
`;

const loginTypes = [
  {
    title: "Waves Exchange Email",
    icon: email,
    type: LOGIN_TYPE.SIGNER_EMAIL
  },
  {
    title: "Waves Exchange Seed",
    icon: seed,
    type: LOGIN_TYPE.SIGNER_SEED
  },
  {
    title: "Keeper Wallet",
    icon: keeper,
    type: LOGIN_TYPE.KEEPER
  }
];

const LoginType: React.FC<IProps> = ({ title, icon, type, ...rest }) => {
  return (
    <Root {...rest} disable={rest.onClick == null}>
      <Text size="medium" weight={500}>
        {title}
      </Text>
      <Icon src={icon} alt={type} />
    </Root>
  );
};

const LoginTypesRender: React.FC<{
  isKeeperDisabled: boolean;
  handleLogin: (type: LOGIN_TYPE) => void;
}> = ({ isKeeperDisabled, handleLogin }) => {
  return (
    <Column alignItems="unset" crossAxisSize="max">
      {loginTypes.map((t) =>
        t.type === LOGIN_TYPE.KEEPER && isKeeperDisabled ? (
          <LoginType {...t} key={t.type} />
        ) : (
          <LoginType {...t} key={t.type} onClick={() => handleLogin(t.type)} />
        )
      )}
      <SizedBox height={24} />
      <Text textAlign="center" size="medium">
        New to Waves blockchain?{" "}
        <Anchor
          style={{ color: "#7075E9", paddingTop: 4, display: "block" }}
          href="https://docs.waves.exchange/en/waves-exchange/waves-exchange-online-desktop/online-desktop-account/online-desktop-creation"
        >
          Learn more about wallets
        </Anchor>
      </Text>
      <SizedBox height={24} />
    </Column>
  );
};

export default LoginTypesRender;
