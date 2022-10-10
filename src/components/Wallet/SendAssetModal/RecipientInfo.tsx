import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Input from "@components/Input";
import LightTokenInput from "@components/TokenInput/LightTokenInput";
import { observer } from "mobx-react-lite";
import { useSendAssetVM } from "@components/Wallet/SendAssetModal/SendAssetVM";
import { useStores } from "@stores";
import { Column, Row } from "@components/Flex";
import Button from "@components/Button";

interface IProps {}

const RecipientInfo: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const { assetToSend } = accountStore;
  const vm = useSendAssetVM();
  return (
    <Column
      justifyContent="space-between"
      mainAxisSize="stretch"
      crossAxisSize="max"
    >
      <Column crossAxisSize="max" mainAxisSize="stretch">
        <SizedBox height={16} />
        <Text size="medium" type="secondary">
          Recipient’s address
        </Text>
        <SizedBox height={4} />
        <Input
          placeholder="Waves address (3P)…"
          value={vm.recipientAddress}
          onChange={(e) => vm.setRecipientAddress(e.target.value)}
          error={vm.recipientError}
          errorText={vm.recipientErrorText}
        />
        <SizedBox height={16} />
        <LightTokenInput
          assetId={assetToSend!.assetId}
          decimals={assetToSend!.decimals}
          amount={vm.amount}
          setAmount={vm.setAmount}
          onMaxClick={vm.onMaxClick}
          usdnEquivalent={vm.assetToSendUsdnEquivalent}
          error={vm.amountError}
        />
        <SizedBox height={16} />
        <Row justifyContent="space-between">
          <Text type="secondary">Transaction fee</Text>
          <Text textAlign="right">0.001 WAVES</Text>
        </Row>
      </Column>
      <Button fixed disabled={!vm.canTransfer} onClick={vm.sendAssets}>
        {vm.buttonText}
      </Button>
      <SizedBox height={32} />
    </Column>
  );
};
export default observer(RecipientInfo);
