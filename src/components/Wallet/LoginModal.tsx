import React from "react";
import Dialog from "@components/Dialog";
import LoginTypesRender from "@components/LoginTypes";
import { LOGIN_TYPE } from "@stores/AccountStore";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";

interface IProps {
  onClose: () => void;
  onLogin: (loginType: LOGIN_TYPE) => void;
  visible: boolean;
}

const LoginModal: React.FC<IProps> = ({ onLogin, ...rest }) => {
  const handleLogin = (loginType: LOGIN_TYPE) => {
    rest.onClose();
    onLogin(loginType);
  };
  const { accountStore } = useStores();
  const isKeeperDisabled = !accountStore.isWavesKeeperInstalled;
  return (
    <Dialog style={{ maxWidth: 360 }} title="Connect wallet" {...rest}>
      <LoginTypesRender
        isKeeperDisabled={isKeeperDisabled}
        handleLogin={handleLogin}
      />
    </Dialog>
  );
};
export default observer(LoginModal);
