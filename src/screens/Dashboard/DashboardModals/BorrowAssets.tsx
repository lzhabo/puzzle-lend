import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useStores } from "@src/stores";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import Button from "@components/Button";
import MaxButton from "@components/MaxButton";
import BigNumberInput from "@components/BigNumberInput";
import AmountInput from "@components/AmountInput";
import { Column, Row } from "@components/Flex";
import { TPoolStats } from "@src/stores/LendStore";
import { DashboardUseVM } from "@screens/Dashboard/DashboardModals/DashboardModalVM";
import BN from "@src/utils/BN";
import _ from "lodash";

import SquareTokenIcon from "@components/SquareTokenIcon";
import tokenLogos from "@src/constants/tokenLogos";
import {
  Footer,
  Root
} from "@src/screens/Dashboard/DashboardModals/components/ModalContent";
import BackIcon from "@src/screens/Dashboard/DashboardModals/components/BackIcon";
import DollarSymbol from "@src/screens/Dashboard/DashboardModals/components/DollarSymbol";
import TokenToDollar from "@src/screens/Dashboard/DashboardModals/components/TokenToDollar.";
import ModalInputContainer from "@src/screens/Dashboard/DashboardModals/components/ModalInputContainer";
import { ReactComponent as Swap } from "@src/assets/icons/swap.svg";

interface IProps {
  token: TPoolStats;
  poolId: string;
  modalAmount: BN;
  userHealth: BN;
  error: string;
  modalSetAmount: (amount: BN) => void;
  onMaxClick: (amount: BN) => void;
  onSubmit?: (amount: BN, assetId: string, contractAddress: string) => void;
}

const BorrowAssets: React.FC<IProps> = ({
  token,
  modalAmount,
  userHealth,
  poolId,
  error,
  modalSetAmount,
  onMaxClick,
  onSubmit
}) => {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
  const [amount, setAmount] = useState<BN>(modalAmount);
  const { accountStore } = useStores();
  const vm = DashboardUseVM();

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

  const submitForm = () => {
    let amountVal = modalAmount;

    if (vm.isDollar) amountVal = amountVal.div(token?.prices?.min);

    onSubmit!(amountVal.toSignificant(0), token?.assetId, poolId);
  };

  const handleChangeAmount = (v: BN) => {
    vm.borrowChangeAmount(v);
    handleDebounce(v);
  };

  const setInputAmountMeasure = (isCurrentNative: boolean) => {
    handleDebounce(vm.getOnNativeChange);
    vm.setVMisDollar(isCurrentNative);
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
              {token?.name ? token?.name : ""}
            </Text>
          </Column>
        </Row>
        <Column alignItems="flex-end">
          <Row alignItems="center" justifyContent="flex-end">
            <Text size="medium" type="secondary" fitContent>
              {+vm.formatVal(amount, token?.decimals).toFixed(4) || 0}
            </Text>
            <BackIcon />
            <Text
              size="medium"
              fitContent
              onClick={() => {
                setFocused(true);
                onMaxClick && onMaxClick(vm.userMaximumToBorrowBN());
              }}
              style={{ cursor: "pointer" }}
            >
              {token?.cf && token?.prices.max
                ? vm.userMaximumToBorrow.toFormat(6)
                : 0}
              <>&nbsp;</>
              {vm.isDollar ? "$" : token?.symbol}
            </Text>
          </Row>
          <Text textAlign="right" nowrap size="medium" type="secondary">
            Max possible to borrow
          </Text>
        </Column>
      </Row>
      <SizedBox height={16} />
      <ModalInputContainer focused={focused} readOnly={!modalSetAmount}>
        {vm.isDollar && <DollarSymbol>$</DollarSymbol>}
        {onMaxClick && (
          <MaxButton
            onClick={() => {
              setFocused(true);
              onMaxClick && onMaxClick(vm.userMaximumToBorrowBN());
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
              ~{token?.symbol}{" "}
              {token?.prices?.min &&
                amount &&
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
              {token?.prices?.min && amount
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
          {token?.symbol} liquidity
        </Text>
        <Text size="medium" fitContent>
          {vm.getReserves} {token?.symbol}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Borrow APY
        </Text>
        <Text size="medium" fitContent>
          {+token?.borrowAPY ? (+token?.borrowAPY).toFixed(2) : 0} %
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Borrowed
        </Text>
        <Text size="medium" fitContent>
          {+token?.selfBorrow
            ? (+vm.formatVal(token?.selfBorrow, token?.decimals)).toFixed(4)
            : 0}{" "}
          {token?.symbol}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row alignItems="center" justifyContent="space-between">
        <Text size="medium" type="secondary" nowrap>
          Account Health
        </Text>
        <Row alignItems="center" justifyContent="flex-end">
          <Text size="medium" type="success" fitContent>
            {+userHealth.toFixed(2) || 0} %
          </Text>
          {vm.accountHealth !== 100 ? (
            <>
              <BackIcon />
              <Text
                type={vm.accountHealth < +userHealth ? "error" : "success"}
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
      <SizedBox height={24} />
      {/* if NO liquidity show ERROR, else borrow or login */}
      <Footer>
        {accountStore && !accountStore.address ? (
          <Button
            fixed
            onClick={() => {
              accountStore.setLoginModalOpened(true);
            }}
            size="large"
          >
            Login
          </Button>
        ) : (
          accountStore &&
          accountStore.address && (
            <Button
              disabled={+amount === 0 || error !== ""}
              fixed
              onClick={() => submitForm()}
              size="large"
            >
              {error !== "" ? error : "Borrow"}
            </Button>
          )
        )}
      </Footer>
    </Root>
  );
};
export default observer(BorrowAssets);
