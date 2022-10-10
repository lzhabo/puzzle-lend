import React from "react";
import "./send-asset.css";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";
import RcDialog from "rc-dialog";
import { observer, Observer } from "mobx-react-lite";
import { useStores } from "@stores";
import SquareTokenIcon from "@components/SquareTokenIcon";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import BN from "@src/utils/BN";
import { Column } from "@src/components/Flex";
import { SendAssetVMProvider } from "@components/Wallet/SendAssetModal/SendAssetVM";
import RecipientInfo from "@components/Wallet/SendAssetModal/RecipientInfo";
import SendAssetHeader from "./SendAssetHeader";
import { ReactComponent as CloseIcon } from "@src/assets/icons/darkClose.svg";

interface IProps extends IDialogPropTypes {}

const SendAssetModal: React.FC<IProps> = ({ ...rest }) => {
  const { accountStore } = useStores();
  const { assetToSend } = accountStore;
  const balance = BN.formatUnits(
    assetToSend?.balance ?? 0,
    assetToSend?.decimals
  );
  return (
    <RcDialog
      wrapClassName="send-asset"
      closeIcon={<CloseIcon style={{ cursor: "pointer" }} />}
      title={
        <SendAssetHeader
          tokenName={`Send ${assetToSend?.name}`}
          onClose={rest.onClose}
        />
      }
      destroyOnClose
      {...rest}
    >
      <Observer>
        {() => (
          <SendAssetVMProvider>
            <Column
              justifyContent="center"
              alignItems="center"
              crossAxisSize="max"
              mainAxisSize="stretch"
              style={{ position: "relative" }}
            >
              <SizedBox height={24} />
              <SquareTokenIcon src={assetToSend?.logo} />
              <SizedBox height={8} />
              <Text fitContent weight={500}>{`${balance?.toFormat(2)} ${
                assetToSend?.symbol
              }`}</Text>
              <Text
                fitContent
                type="secondary"
              >{`$ ${assetToSend?.usdnEquivalent?.toFormat(2)}`}</Text>
              <RecipientInfo />
            </Column>
          </SendAssetVMProvider>
        )}
      </Observer>
    </RcDialog>
  );
};
export default observer(SendAssetModal);
