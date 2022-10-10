import React from "react";
import Dialog from "@components/Dialog";
import { LOGIN_TYPE } from "@stores/AccountStore";
import LoginType from "./LoginType";
import seed from "@src/assets/icons/seed.svg";
import email from "@src/assets/icons/email.svg";
import keeper from "@src/assets/icons/keeper.svg";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";

interface IProps {
  onClose: () => void;
  onLogin: (loginType: LOGIN_TYPE) => void;
  visible: boolean;
}

const loginTypes = [
  {
    title: "Waves Exchange Email",
    icon: email,
    type: LOGIN_TYPE.SIGNER_EMAIL,
  },
  {
    title: "Waves Exchange Seed",
    icon: seed,
    type: LOGIN_TYPE.SIGNER_SEED,
  },
  {
    title: "Keeper Wallet",
    icon: keeper,
    type: LOGIN_TYPE.KEEPER,
  },
];
const LoginModal: React.FC<IProps> = ({ onLogin, ...rest }) => {
  const handleLogin = (loginType: LOGIN_TYPE) => () => {
    rest.onClose();
    onLogin(loginType);
  };
  const { accountStore } = useStores();
  const isKeeperDisabled = !accountStore.isWavesKeeperInstalled;
  return (
    <Dialog style={{ maxWidth: 360 }} title="Connect wallet" {...rest}>
      {loginTypes.map((t) =>
        t.type === LOGIN_TYPE.KEEPER && isKeeperDisabled ? (
          <LoginType {...t} key={t.type} />
        ) : (
          <LoginType {...t} key={t.type} onClick={handleLogin(t.type)} />
        )
      )}
    </Dialog>
  );
};
export default observer(LoginModal);
