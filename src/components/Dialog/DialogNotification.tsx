import React from "react";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";
import Dialog from "@components/Dialog/Dialog";
import { Column } from "../Flex";
import { ReactComponent as SuccessIcon } from "@src/assets/icons/successLarge.svg";
import { ReactComponent as ErrorIcon } from "@src/assets/icons/errorLarge.svg";
import { ReactComponent as WarningIcon } from "@src/assets/icons/warningLarge.svg";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import styled from "@emotion/styled";
import { Link } from "react-router-dom";
import Button from "@components/Button";
import { AccountStore } from "@stores";
import { Anchor } from "@components/Anchor";
import SuccessNft from "@components/Dialog/SuccessNft";
import { EXPLORER_URL } from "@src/constants";

export interface IDialogNotificationProps extends IDialogPropTypes {
  title: string;
  description?: string;
  icon?: JSX.Element;
  type?: "success" | "error" | "warning";
  buttons?: React.FC[];
  buttonsDirection?: "row" | "column";
}

const Root = styled(Column)`
  text-align: center;

  & > .title {
    font-weight: 500;
    font-size: 24px;
    line-height: 32px;
  }
`;

const ButtonsContainer = styled.div<{ direction?: "row" | "column" }>`
  display: flex;
  flex-direction: ${({ direction }) => direction ?? "column"};
  width: 100%;
  margin: -4px;

  & > * {
    margin: 4px;
  }
`;

const DialogNotification: React.FC<IDialogNotificationProps> = ({
  title,
  description,
  icon,
  type = "success",
  buttonsDirection = "column",
  buttons = [],
  ...rest
}) => {
  return (
    <Dialog {...rest}>
      <Root style={{}} alignItems="center" crossAxisSize="max">
        <SizedBox height={16} />
        <>
          {icon != null ? (
            <React.Fragment>{icon}</React.Fragment>
          ) : (
            <React.Fragment>
              {type === "success" && <SuccessIcon />}
              {type === "error" && <ErrorIcon />}
              {type === "warning" && <WarningIcon />}
            </React.Fragment>
          )}
        </>
        <SizedBox height={8} />
        <Text className="title">{title}</Text>
        {description && (
          <Text style={{ marginTop: 8 }} size="medium" type="secondary">
            {description}
          </Text>
        )}
        <SizedBox height={16} />
        {buttons.length > 0 && (
          <ButtonsContainer style={{ flexDirection: buttonsDirection }}>
            {buttons?.map((Component, index) => (
              <Component key="index" />
            ))}
          </ButtonsContainer>
        )}
        <SizedBox height={24} />
      </Root>
    </Dialog>
  );
};

type TBuildSuccessLiquidityDialogParamsProps = {
  accountStore: AccountStore;
  txId: string;
  poolDomain: string;
};

export const buildSuccessLiquidityDialogParams = ({
  accountStore,
  txId,
  poolDomain,
}: TBuildSuccessLiquidityDialogParamsProps): IDialogNotificationProps => {
  const txLink = `${EXPLORER_URL}/tx/${txId}`;
  const poolLink = `/pools/${poolDomain}/invest`;
  const pool = accountStore.rootStore.poolsStore.pools.find(
    ({ domain }) => domain === poolDomain
  );
  return {
    title: "Successfully provided",
    description: `Liquidity successfully provided to the ${pool?.title}. You can track your reward on the pool page.`,
    type: "success",
    buttons: [
      () => (
        <Link to={poolLink} style={{ width: "100%" }}>
          <Button size="medium" fixed>
            Go to the pool page
          </Button>
        </Link>
      ),
      () => (
        <Anchor href={txLink} style={{ width: "100%" }}>
          <Button key="explorer" size="medium" kind="secondary" fixed>
            View on Waves Explorer
          </Button>
        </Anchor>
      ),
    ],
  };
};

type TbuildErrorDialogParamsProps = {
  title: string;
  description: string;
  onTryAgain: () => void;
};

export const buildErrorDialogParams = ({
  title,
  description,
  onTryAgain,
}: TbuildErrorDialogParamsProps): IDialogNotificationProps => {
  return {
    title,
    description,
    type: "error",
    buttons: [
      () => (
        <Button size="medium" fixed onClick={onTryAgain}>
          Try again
        </Button>
      ),
    ],
  };
};
type TBuildWarningLiquidityDialogParamsProps = {
  title: string;
  description: string;
  onContinue: () => void;
  continueText: string;
  onCancel: () => void;
};

export const buildWarningLiquidityDialogParams = ({
  title,
  description,
  onContinue,
  continueText,
  onCancel,
}: TBuildWarningLiquidityDialogParamsProps): IDialogNotificationProps => {
  return {
    title,
    description,
    type: "warning",
    buttonsDirection: "row",
    buttons: [
      () => (
        <Button size="medium" fixed onClick={onCancel} kind="secondary">
          Cancel
        </Button>
      ),
      () => (
        <Button size="medium" fixed onClick={onContinue}>
          {continueText}
        </Button>
      ),
    ],
  };
};

type TBuildParamsProps = {
  title: string;
  description: string;
  buttons?: React.FC[];
  type: "success" | "error" | "warning";
};
export const buildDialogParams = ({
  title,
  description,
  buttons,
  type,
}: TBuildParamsProps): IDialogNotificationProps => {
  return {
    title,
    description,
    type,
    buttonsDirection: "row",
    buttons,
  };
};

//NFTS

type TBuildSuccessNFTSaleDialogParamsProps = {
  picture: string;
  name: string;
  onContinue?: () => void;
};

export const buildSuccessNFTSaleDialogParams = ({
  name,
  picture,
  onContinue,
}: TBuildSuccessNFTSaleDialogParamsProps): IDialogNotificationProps => {
  return {
    title: `You’ve got “${name}” NFT!`,
    description: "You can use it to pay for the creation of the pool",
    icon: <SuccessNft image={picture} />,
    buttons: [
      () => (
        <Button size="medium" fixed onClick={onContinue}>
          Use it to create the pool
        </Button>
      ),
    ],
  };
};

//Boosting

type TBuildSuccessBoostProps = {
  description: string;
  domain: string;
};

export const buildSuccessBoostParams = ({
  description,
  domain,
}: TBuildSuccessBoostProps): IDialogNotificationProps => {
  return {
    title: `Successfully boosted!`,
    description,
    buttons: [
      () => (
        <Anchor href={`/pools/${domain}/invest`} style={{ width: "100%" }}>
          <Button key="explorer" size="medium" kind="secondary" fixed>
            Back to Pool page
          </Button>
        </Anchor>
      ),
    ],
  };
};
//CancelOrder

type TBuildCancelOrderProps = {
  onOrderCancel: () => void;
  onCancel: () => void;
  many?: boolean;
};

export const buildCancelOrderParams = ({
  onOrderCancel,
  onCancel,
  many,
}: TBuildCancelOrderProps): IDialogNotificationProps => {
  return {
    icon: <></>,
    title: many
      ? "Are you sure you want cancel all orders?"
      : "Are you sure you want cancel the order?",
    description: many
      ? "The current orders progress will not be canceled, but further execution will stop"
      : "The current order progress will not be canceled, but further execution will stop",
    buttons: [
      () => (
        <Button
          key="explorer"
          size="medium"
          kind="danger"
          fixed
          onClick={onOrderCancel}
        >
          {many ? "Cancel all orders" : "Cancel the order"}
        </Button>
      ),
      () => (
        <Button
          key="explorer"
          size="medium"
          kind="secondary"
          fixed
          onClick={onCancel}
        >
          Back to trade
        </Button>
      ),
    ],
  };
};
export default DialogNotification;
