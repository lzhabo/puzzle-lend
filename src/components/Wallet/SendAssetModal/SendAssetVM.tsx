import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import BN from "@src/utils/BN";
import centerEllipsis from "@src/utils/centerEllipsis";
import { isValidAddress } from "@waves/waves-transactions/dist/validators";
import { EXPLORER_URL } from "@src/constants";

const ctx = React.createContext<SendAssetVM | null>(null);

export const SendAssetVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new SendAssetVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}> {children} </ctx.Provider>;
};

export const useSendAssetVM = () => useVM(ctx);

class SendAssetVM {
  rootStore: RootStore;

  recipientAddress: string = "";
  public setRecipientAddress = (v: string) => (this.recipientAddress = v);

  amount: BN = BN.ZERO;
  public setAmount = (amount: BN) => (this.amount = amount);

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  onMaxClick = () => {
    const { assetToSend } = this.rootStore.accountStore;
    this.setAmount(assetToSend!.balance ?? BN.ZERO);
  };

  get recipientError() {
    return (
      this.recipientAddress.length > 0 &&
      !this.recipientAddress.startsWith("3P")
    );
  }

  get amountError() {
    return this.amount.gt(
      this.rootStore.accountStore.assetToSend?.balance ?? 0
    );
  }

  get recipientErrorText() {
    return "Outside of Waves. Try an address starting with “3P”.";
  }

  get canTransfer() {
    const { assetToSend } = this.rootStore.accountStore;
    return (
      this.amount.lte(assetToSend?.balance ?? 0) &&
      !this.amount.eq(0) &&
      !this.loading &&
      this.recipientAddress.length > 0 &&
      isValidAddress(this.recipientAddress)
    );
  }

  get buttonText() {
    const { assetToSend } = this.rootStore.accountStore;
    if (this.recipientAddress.length === 0) return "Enter address";
    if (this.loading) return "In progress...";
    if (this.amount.gt(assetToSend?.balance ?? 0))
      return `Insufficient ${assetToSend?.symbol} balance`;
    if (this.amount.eq(0)) return "Enter amount";
    return `Send ${BN.formatUnits(this.amount, assetToSend?.decimals)} ${
      assetToSend?.symbol
    }`;
  }

  get assetToSendUsdnEquivalent() {
    const { accountStore, poolsStore } = this.rootStore;
    const { assetToSend } = accountStore;
    if (assetToSend == null) return "";
    const amount = BN.formatUnits(this.amount, assetToSend?.decimals);
    const rate = poolsStore.usdnRate(assetToSend.assetId, 1) ?? BN.ZERO;
    return "$ " + rate?.times(amount)?.toFormat(2);
  }

  sendAssets = async () => {
    if (!this.canTransfer) return;
    const { accountStore, notificationStore } = this.rootStore;
    const { assetToSend } = this.rootStore.accountStore;
    if (assetToSend == null) return;
    const amount = BN.formatUnits(this.amount, assetToSend.decimals).toFormat();

    const data = {
      recipient: this.recipientAddress,
      amount: this.amount.toString(),
      assetId: assetToSend.assetId,
    };
    this._setLoading(true);
    accountStore
      .transfer(data)
      .then((txId) => {
        txId &&
          notificationStore.notify(
            `${amount} ${
              assetToSend.symbol
            } were successfully sent to ${centerEllipsis(
              this.recipientAddress ?? "",
              6
            )}. You can track the transaction on Waves Explorer.`,
            {
              type: "success",
              title: `Success`,
              link: `${EXPLORER_URL}/tx/${txId}`,
              linkTitle: "View on Explorer",
            }
          );
      })
      .catch((e) => {
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Transaction is not completed",
        });
      })
      .then(() => this.rootStore.accountStore.updateAccountAssets(true))
      .finally(() => {
        accountStore.setSendAssetModalOpened(false);
        this._setLoading(false);
      });
  };
}
