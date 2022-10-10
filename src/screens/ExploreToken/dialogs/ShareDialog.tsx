import Dialog from "@components/Dialog";
import { IDialogPropTypes } from "rc-dialog/es/IDialogPropTypes";
import React from "react";
import { observer } from "mobx-react-lite";
import { useExploreTokenVM } from "@screens/ExploreToken/ExploreTokenVm";
import styled from "@emotion/styled";
import Text from "@components/Text";
import Button from "@components/Button";
import { ReactComponent as TwitterIcon } from "@src/assets/icons/twitter.svg";
import { ReactComponent as TelegramIcon } from "@src/assets/icons/telegram.svg";
import { ReactComponent as FacebookIcon } from "@src/assets/icons/facebook.svg";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@src/components/Flex";
import copy from "copy-to-clipboard";
import { ReactComponent as CopyIcon } from "@src/assets/icons/darkCopy.svg";
import Input from "@components/Input";
import { useStores } from "@stores";
interface IProps extends IDialogPropTypes {}

const Bg = styled.div`
  background: #f8f8ff;
  height: 52px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 44px;
`;

const Icon = styled.img`
  width: 56px;
  height: 56px;
  border: 1px solid #f1f2fe;
  border-radius: 12px;
  position: absolute;
  top: 24px;
`;

const Title = styled(Text)`
  font-size: 24px;
  line-height: 32px;
  text-align: center;
  font-weight: 500;
  margin-bottom: 24px;
`;

const ButtonsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 8px;
  padding: 0 24px;
  box-sizing: border-box;
`;

const SocialButton = styled(Button)`
  height: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  padding: 8px 0;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: #7075e9;
`;

const StyledInput = styled(Input)`
  height: 40px;
  width: 100%;
  input {
    color: #363870;
  }
`;

const ShareDialog: React.FC<IProps> = ({ ...rest }) => {
  const vm = useExploreTokenVM();
  const { notificationStore } = useStores();
  const link = `app.puzzleswap.org/explore/token/${vm.asset.assetId}`;
  const text = `Check ${vm.asset.name} token`;
  const shareInfo = [
    {
      title: "Twitter",
      onClick: () =>
        window.open(
          `https://twitter.com/intent/tweet?url=${link}&text=${text}`
        ),
      icon: <TwitterIcon />,
    },
    {
      title: "Telegram",
      onClick: () =>
        window.open(`https://telegram.me/share/?url=${link}&text=${text}`),
      icon: <TelegramIcon />,
    },
    {
      title: "Facebook",
      onClick: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${link}&quote=${text}`
        ),
      icon: <FacebookIcon />,
    },
  ];

  const handleCopyLink = () => {
    copy(window.location.href);
    notificationStore.notify("Link was copied");
  };
  return (
    <Dialog
      bodyStyle={{ padding: 0 }}
      style={{ maxWidth: 360 }}
      title={`Share ${vm.asset?.symbol} with friends`}
      {...rest}
    >
      <Bg>
        <Icon src={vm.asset.logo} alt={vm.asset.symbol} />
      </Bg>
      <Title>
        The price of {vm.asset.symbol}
        <br />
        is $ {vm.statistics?.currentPrice.toFormat(2)}!
      </Title>
      <ButtonsWrapper>
        {shareInfo.map(({ icon, title, onClick }) => (
          <SocialButton key={title} onClick={onClick} kind="secondary">
            {icon}
            <SizedBox height={4} />
            {title}
          </SocialButton>
        ))}
      </ButtonsWrapper>
      <Column style={{ padding: 24, boxSizing: "border-box" }}>
        <Text type="secondary" size="medium">
          Or copy link
        </Text>
        <SizedBox height={4} />

        <Row>
          <StyledInput value={link} />
          <SizedBox width={8} />
          <Button size="medium" kind="secondary" onClick={handleCopyLink}>
            <CopyIcon />
            <SizedBox width={8} />
            Copy
          </Button>
        </Row>
      </Column>
    </Dialog>
  );
};
export default observer(ShareDialog);
