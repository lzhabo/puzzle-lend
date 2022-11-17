import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useStores } from "@src/stores";
import { useNavigate } from "react-router-dom";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import Button from "@components/Button";
import SquareTokenIcon from "@components/SquareTokenIcon";
import tokenLogos from "@src/constants/tokenLogos";
import { observer } from "mobx-react-lite";
import { Column, Row } from "@components/Flex";
import { TPoolStats } from "@src/stores/LendStore";
import { DashboardUseVM } from "@screens/Dashboard/DashboardModals/DashboardModalVM";
import { ROUTES } from "@src/constants";
import BN from "@src/utils/BN";
import _ from "lodash";

import {
  Footer,
  Root
} from "@src/screens/Dashboard/DashboardModals/components/ModalContent";
import Warning from "@src/screens/Dashboard/DashboardModals/components/Warning";
import ModalTokenInput from "@src/screens/Dashboard/DashboardModals/components/ModalTokenInput";
import BackIcon from "@src/screens/Dashboard/DashboardModals/components/BackIcon";

interface IProps {
  token: TPoolStats;
  poolId: string;
  modalAmount: BN;
  modalSetAmount: (amount: BN) => void;
  onMaxClick: (amount: BN) => void;
  onSubmit: (
    amount: BN,
    assetId: string,
    contractAddress: string
  ) => Promise<boolean>;
  onClose: () => void;
}

const SupplyAssets: React.FC<IProps> = ({
  token,
  modalAmount,
  poolId,
  onClose,
  modalSetAmount,
  onMaxClick,
  onSubmit
}) => {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
  const vm = DashboardUseVM();
  const [amount, setAmount] = useState<BN>(modalAmount);
  const { accountStore, lendStore } = useStores();

  useEffect(() => {
    modalAmount && setAmount(modalAmount);
  }, [modalAmount]);

  const debounce = useMemo(
    () => _.debounce((val: BN) => modalSetAmount(val), 500),
    [modalSetAmount]
  );

  const handleDebounce = useCallback(
    (val: BN) => {
      setAmount(val);
      debounce(val);
    },
    [debounce]
  );

  const handleChangeAmount = (v: BN) => {
    vm.supplyChangeAmount(v);
    handleDebounce(v);
  };

  const getMaxSupply = () => {
    const val = vm.countMaxBtn.toDecimalPlaces(0);
    handleDebounce(val);

    return val;
  };

  const submitForm = async () => {
    const amountVal = vm.modalFormattedVal;
    const isSuccess = await onSubmit(
      amountVal.toSignificant(0),
      token?.assetId,
      poolId
    );

    if (isSuccess) onClose();
  };

  const setInputAmountMeasure = (isCurrentNative: boolean) => {
    handleDebounce(vm.onNativeChange.toDecimalPlaces(0));
    vm.setVMisDollar(isCurrentNative);
  };

  return (
    <Root>
      <Row>
        <Row
          alignItems="center"
          onClick={() =>
            navigate(
              ROUTES.DASHBOARD_TOKEN_DETAILS.replace(
                ":poolId",
                lendStore.pool.address
              ).replace(":assetId", token?.assetId)
            )
          }
          style={{ cursor: "pointer" }}
        >
          {token?.symbol && (
            <SquareTokenIcon size="small" src={tokenLogos[token?.symbol]} />
          )}
          <SizedBox width={8} />
          <Column>
            <Text size="medium">{token?.symbol}</Text>
            <Text size="small" type="secondary">
              {token?.name}
            </Text>
          </Column>
        </Row>
        <Column alignItems="flex-end">
          <Row alignItems="center">
            <Text size="medium" fitContent style={{ cursor: "pointer" }}>
              {vm.countUserBalance ?? 0}
              &nbsp;
              {vm.currentSymbol}
            </Text>
            <BackIcon />
            <Text size="medium" type="secondary" fitContent>
              {amount.gt(0)
                ? BN.formatUnits(
                    vm.staticTokenAmount.minus(amount),
                    token?.decimals
                  ).toFormat(4) ?? 0
                : 0}
            </Text>
          </Row>
          <Text size="medium" type="secondary" nowrap>
            Wallet Balance
          </Text>
        </Column>
      </Row>
      <SizedBox height={16} />
      <ModalTokenInput
        token={token}
        isDollar={vm.isDollar}
        focused={focused}
        amount={amount}
        error={vm.modalBtnErrorText}
        setFocused={() => setFocused(true)}
        onMaxClick={() => onMaxClick(getMaxSupply())}
        handleChangeAmount={handleChangeAmount}
        setInputAmountMeasure={setInputAmountMeasure}
      />
      <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Text
          size="medium"
          type={vm.userDailyIncome.gt(0) ? "success" : "secondary"}
          fitContent
        >
          Daily Income
        </Text>
        <Text
          size="medium"
          type={vm.userDailyIncome.gt(0) ? "success" : "primary"}
          fitContent
        >
          $ {vm.userDailyIncome?.toFormat(6)}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Supply APY
        </Text>
        <Text size="medium" fitContent>
          {token?.supplyAPY.toFormat(2)}%
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Borrowed
        </Text>
        <Text size="medium" fitContent>
          {BN.formatUnits(token?.selfBorrow, token?.decimals).toFormat(2)}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Transaction fee
        </Text>
        <Text size="medium" fitContent>
          0.005 WAVES
        </Text>
      </Row>
      <SizedBox height={24} />
      {vm.modalWarningText && (
        <>
          <Warning
            text={vm.modalWarningText}
            accentText={
              <div
                onClick={() => onMaxClick(getMaxSupply())}
                style={{ cursor: "pointer" }}
              >
                Supply max to limit
              </div>
            }
          />
          <SizedBox height={24} />
        </>
      )}
      <Footer>
        {accountStore && accountStore.address ? (
          <Button
            disabled={amount.eq(0) || vm.modalBtnErrorText !== ""}
            fixed
            onClick={() => submitForm()}
            size="large"
          >
            {vm.modalBtnErrorText !== "" ? vm.modalBtnErrorText : "Supply"}
          </Button>
        ) : (
          <Button
            fixed
            onClick={() => {
              accountStore.setLoginModalOpened(true);
            }}
            size="large"
          >
            Login
          </Button>
        )}
      </Footer>
    </Root>
  );
};
export default observer(SupplyAssets);
