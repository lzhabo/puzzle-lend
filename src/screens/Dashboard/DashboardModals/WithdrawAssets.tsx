import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useStores } from "@src/stores";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Column, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import Button from "@components/Button";
import MaxButton from "@components/MaxButton";
import BigNumberInput from "@components/BigNumberInput";
import AmountInput from "@components/AmountInput";
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
import DollarSymbol from "@src/screens/Dashboard/DashboardModals/components/DollarSymbol";
import TokenToDollar from "@src/screens/Dashboard/DashboardModals/components/TokenToDollar.";
import ModalInputContainer from "@src/screens/Dashboard/DashboardModals/components/ModalInputContainer";
import BackIcon from "@src/screens/Dashboard/DashboardModals/components/BackIcon";
import { ReactComponent as Swap } from "@src/assets/icons/swap.svg";

interface IProps {
  token: TPoolStats;
  modalAmount: BN;
  poolId: string;
  userHealth: BN;
  error: string;
  modalSetAmount: (amount: BN) => void;
  onMaxClick: (amount: BN) => void;
  onSubmit: (amount: BN, assetId: string, contractAddress: string) => void;
}

const WithdrawAssets: React.FC<IProps> = ({
  token,
  poolId,
  modalAmount,
  userHealth,
  error,
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
    const val = vm.getMaxBtn.toDecimalPlaces(0);
    handleDebounce(val);

    return val;
  };

  const setInputAmountMeasure = (isCurrentNative: boolean) => {
    handleDebounce(vm.getOnNativeChange.toDecimalPlaces(0));
    vm.setVMisDollar(isCurrentNative);
  };

  const submitForm = () => {
    const amountVal = vm.getFormattedVal;
    onSubmit(amountVal.toDecimalPlaces(0, 2), token?.assetId, poolId);
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
            {vm.getUserBalance}
            <>&nbsp;</>
            {vm.isDollar ? "$" : token?.symbol}
          </Text>
          <Text nowrap size="medium" type="secondary">
            Wallet Balance
          </Text>
        </Column>
      </Row>
      <SizedBox height={16} />
      {/*//fixme  вынести в отлеьный компонент что будет называться  ModalTokenInput*/}
      <ModalInputContainer focused={focused} readOnly={!modalAmount}>
        {!vm.isDollar && <DollarSymbol>$</DollarSymbol>}
        {onMaxClick && (
          <MaxButton
            onClick={() => {
              setFocused(true);
              onMaxClick && onMaxClick(maxWithdraw());
            }}
          />
        )}
        <BigNumberInput
          renderInput={(inputProps, ref) => (
            <AmountInput
              {...inputProps}
              onFocus={(e) => {
                inputProps.onFocus && inputProps.onFocus(e);
                !inputProps.readOnly && setFocused(true);
              }}
              onBlur={(e) => {
                inputProps.onBlur && inputProps.onBlur(e);
                setFocused(false);
              }}
              ref={ref}
            />
          )}
          autofocus={focused}
          decimals={token?.decimals}
          value={amount}
          onChange={handleChangeAmount}
          placeholder="0.00"
          readOnly={!modalAmount}
        />
        {vm.isDollar ? (
          <TokenToDollar onClick={() => setInputAmountMeasure(false)}>
            <Text size="small" type="secondary">
              ~{token?.symbol} {/*fixme тоже самое*/}
              {+token?.prices?.min &&
                +amount &&
                (+vm.formatVal(
                  amount.div(token?.prices?.min),
                  token?.decimals
                )).toFixed(4)}
            </Text>
            <Swap />
          </TokenToDollar>
        ) : (
          <TokenToDollar onClick={() => setInputAmountMeasure(true)}>
            <Text size="small" type="secondary">
              ~$
              {/*  fixme не надо допускать чтобы переменная могла быть не строкой или числом
              имею ввиду нельзя делать +
              если нужно для рассчетов, то у BN есть метод toNumber
              */}
              {+token?.prices?.min && +amount
                ? (+vm
                    .formatVal(amount, token?.decimals)
                    .times(token?.prices?.min)).toFixed(4)
                : 0}
            </Text>
            <Swap />
          </TokenToDollar>
        )}
      </ModalInputContainer>
      <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          {token?.name} liquidity
        </Text>
        <Text size="medium" fitContent>
          {vm.getReserves} {token?.symbol}
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
          {(+vm.formatVal(token?.selfSupply, token?.decimals)).toFixed(4)}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row alignItems="center" justifyContent="space-between">
        <Text size="medium" type="secondary" nowrap>
          Account Health
        </Text>
        <Row alignItems="center" justifyContent="flex-end">
          <Text size="medium" type="success" fitContent>
            {+userHealth.toDecimalPlaces(2).toFixed(2) || 0} %
          </Text>
          {userHealth.toDecimalPlaces(2).lt(100) ? (
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
        {token?.totalSupply && token?.totalBorrow && +vm.getReserves === 0 ? (
          <Button fixed disabled size="large">
            Not Enough liquidity to Withdraw
          </Button>
        ) : accountStore && accountStore.address ? (
          <Button
            disabled={+amount === 0 || vm.modalError !== ""}
            fixed
            onClick={() => submitForm()}
            size="large"
          >
            {vm.modalError !== "" ? vm.modalError : "Withdraw"}
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
