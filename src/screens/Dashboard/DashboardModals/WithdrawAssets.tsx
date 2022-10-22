import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useStores } from "@src/stores";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Column, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import Button from "@components/Button";
import SquareTokenIcon from "@components/SquareTokenIcon";
import tokenLogos from "@src/constants/tokenLogos";
import { TPoolStats } from "@src/stores/LendStore";
import { DashboardUseVM } from "@screens/Dashboard/DashboardModals/DashboardModalVM";
import BN from "@src/utils/BN";
import _ from "lodash";

import {
  Footer,
  Root
} from "@src/screens/Dashboard/DashboardModals/components/ModalContent";
import ModalTokenInput from "@src/screens/Dashboard/DashboardModals/components/ModalTokenInput";
import BackIcon from "@src/screens/Dashboard/DashboardModals/components/BackIcon";

interface IProps {
  token: TPoolStats;
  modalAmount: BN;
  poolId: string;
  userHealth: BN;
  onClose: () => void;
  modalSetAmount: (amount: BN) => void;
  onMaxClick: (amount: BN) => void;
  onSubmit: (
    amount: BN,
    assetId: string,
    contractAddress: string
  ) => Promise<boolean>;
}

const WithdrawAssets: React.FC<IProps> = ({
  token,
  poolId,
  modalAmount,
  userHealth,
  onClose,
  modalSetAmount,
  onMaxClick,
  onSubmit
}) => {
  const vm = DashboardUseVM();
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
  const [amount, setAmount] = useState<BN>(modalAmount);
  const { accountStore } = useStores();

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
    vm.withdrawChangeAmount(v);
    handleDebounce(v);
  };

  const maxWithdraw = () => {
    const val = vm.countMaxBtn.toDecimalPlaces(0);
    vm.withdrawChangeAmount(val);
    handleDebounce(val);

    return val;
  };

  const setInputAmountMeasure = (isCurrentNative: boolean) => {
    handleDebounce(vm.onNativeChange.toDecimalPlaces(0));
    vm.setVMisDollar(isCurrentNative);
  };

  const submitForm = async () => {
    const amountVal = vm.modalFormattedVal;
    const isSuccess = await onSubmit(
      amountVal.toDecimalPlaces(0, 2),
      token?.assetId,
      poolId
    );

    if (isSuccess) onClose();
  };

  return (
    <Root>
      <Row>
        <Row
          alignItems="center"
          onClick={() => navigate(`/dashboard/token/${token?.assetId}`)}
          style={{ cursor: "pointer" }}
        >
          {token?.symbol && (
            <SquareTokenIcon size="small" src={tokenLogos[token?.symbol]} />
          )}
          <SizedBox width={8} />
          <Column>
            <Text size="medium">{token?.symbol}</Text>
            <Text size="small" type="secondary">
              {token?.name || ""}
            </Text>
          </Column>
        </Row>
        <Column alignItems="flex-end">
          <Text size="medium" textAlign="right">
            {vm.countUserBalance}
            <>&nbsp;</>
            {vm.isDollar ? "$" : token?.symbol}
          </Text>
          <Text nowrap size="medium" type="secondary">
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
        setFocused={() => setFocused(true)}
        onMaxClick={() => onMaxClick(maxWithdraw())}
        handleChangeAmount={handleChangeAmount}
        setInputAmountMeasure={setInputAmountMeasure}
      />
      <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          {token?.name} liquidity
        </Text>
        <Text size="medium" fitContent>
          {vm.tokenReserves} {token?.symbol}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Supply APY
        </Text>
        <Text size="medium" fitContent>
          {token?.supplyAPY.toFormat(2) || 0}%
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Supplied
        </Text>
        <Text
          size="medium"
          fitContent
          onClick={() => {
            setFocused(true);
            onMaxClick && onMaxClick(maxWithdraw());
          }}
          style={{ cursor: "pointer" }}
        >
          {BN.formatUnits(token?.selfSupply, token?.decimals)
            .toNumber()
            .toFixed(4)}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row alignItems="center" justifyContent="space-between">
        <Text size="medium" type="secondary" nowrap>
          Account Health
        </Text>
        <Row alignItems="center" justifyContent="flex-end">
          <Text size="medium" type="success" fitContent>
            {userHealth.toNumber().toFixed(2) || 0} %
          </Text>
          {vm.accountHealth < 100 ? (
            <>
              <BackIcon />
              <Text
                type={
                  vm.accountHealth < +userHealth.toDecimalPlaces(2)
                    ? "error"
                    : "success"
                }
                size="medium"
                fitContent
              >
                <>&nbsp;</>
                {vm.accountHealth && amount ? vm.accountHealth.toFixed(2) : 0}%
              </Text>
            </>
          ) : null}
        </Row>
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
      <SizedBox height={16} />
      {/* if NO liquidity show ERROR, else withdraw or login */}
      <Footer>
        {token?.totalSupply && token?.totalBorrow && +vm.tokenReserves === 0 ? (
          <Button fixed disabled size="large">
            Not Enough liquidity to Withdraw
          </Button>
        ) : accountStore && accountStore.address ? (
          <Button
            disabled={+amount === 0 || vm.modalErrorText !== ""}
            fixed
            onClick={() => submitForm()}
            size="large"
          >
            {vm.modalErrorText !== "" ? vm.modalErrorText : "Withdraw"}
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
export default observer(WithdrawAssets);