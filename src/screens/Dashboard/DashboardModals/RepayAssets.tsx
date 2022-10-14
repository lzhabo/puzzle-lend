import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStores } from "@src/stores";
import { observer } from "mobx-react-lite";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import Button from "@components/Button";
import MaxButton from "@components/MaxButton";
import BigNumberInput from "@components/BigNumberInput";
import AmountInput from "@components/AmountInput";
import { Column, Row } from "@components/Flex";
import { TPoolStats } from "@src/stores/LendStore";
import BN from "@src/utils/BN";
import _ from "lodash";

import SquareTokenIcon from "@components/SquareTokenIcon";
import tokenLogos from "@src/constants/tokenLogos";
import {
  Footer,
  Root
} from "@src/screens/Dashboard/DashboardModals/components/ModalContent";
import DollarSymbol from "@src/screens/Dashboard/DashboardModals/components/DollarSymbol";
import TokenToDollar from "@src/screens/Dashboard/DashboardModals/components/TokenToDollar.";
import ModalInputContainer from "@src/screens/Dashboard/DashboardModals/components/ModalInputContainer";
import { ReactComponent as Back } from "@src/assets/icons/arrowBackWithTail.svg";
import { ReactComponent as Swap } from "@src/assets/icons/swap.svg";

interface IProps {
  token: TPoolStats;
  poolId: string;
  modalAmount: BN;
  userBalance: BN;
  modalSetAmount: (amount: BN) => void;
  onMaxClick: (amount: BN) => void;
  onSubmit?: (amount: BN, assetId: string, contractAddress: string) => void;
}

const BorrowAssets: React.FC<IProps> = ({
  token,
  modalAmount,
  userBalance,
  poolId,
  modalSetAmount,
  onMaxClick,
  onSubmit
}) => {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
  const [amount, setAmount] = useState<BN>(modalAmount);
  const [isNative, setConvertToNative] = useState<boolean>(true);
  const { accountStore } = useStores();
  const [error, setError] = useState<string>("");

  const formatVal = (valArg: BN | number, decimal: number) => {
    return BN.formatUnits(valArg, decimal);
  };

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

  const getUserRepay = () => {
    if (!isNative && +token?.selfBorrow > 0)
      return formatVal(token?.selfBorrow, token?.decimals)
        .times(token?.prices?.min)
        .minus(formatVal(amount, token?.decimals))
        .toFixed(2);

    return formatVal(token?.selfBorrow, token?.decimals)
      .minus(formatVal(amount, token?.decimals))
      .toFixed(2);
  };

  const handleChangeAmount = (v: BN) => {
    let isError = false;
    let walletBalance = userBalance;
    let forRepay = token?.selfBorrow;

    if (!isNative && walletBalance && forRepay) {
      walletBalance = formatVal(walletBalance.times(token?.prices?.min), 0);
      forRepay = formatVal(forRepay.times(token?.prices?.min), 0);
    }

    if (forRepay && forRepay.times(1.05).isLessThanOrEqualTo(v)) {
      setError(`Too big value for repaying`);
      isError = true;
    }

    if (walletBalance && walletBalance.isLessThanOrEqualTo(v)) {
      setError(`Amount of repay bigger than wallet balance`);
      isError = true;
    }

    if (!isError) setError("");
    handleDebounce(v);
  };

  const submitForm = () => {
    let amountVal = modalAmount;

    if (!isNative) amountVal = formatVal(amountVal.div(token?.prices?.min), 0);

    onSubmit!(amountVal.toDecimalPlaces(0, 2), token?.assetId, poolId);
  };

  const getMax = (val: BN) => {
    let formattedVal = val;
    if (!isNative)
      formattedVal = BN.formatUnits(formattedVal.times(token?.prices?.min), 0);

    // fixing problem of lower repaying number
    handleDebounce(formattedVal.toDecimalPlaces(0, 2));
    return formattedVal.toDecimalPlaces(0, 2);
  };

  const setInputAmountMeasure = (isNativeToken: boolean) => {
    let fixedValue = amount;

    if (isNativeToken && !isNative)
      fixedValue = fixedValue.div(token?.prices?.min);

    handleDebounce(fixedValue);
    setConvertToNative(isNativeToken);
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
              {(+formatVal(amount, token?.decimals) || 0).toFixed(4)}
            </Text>
            <Back
              style={{
                minWidth: "16px",
                maxWidth: "16px",
                transform: "rotate(180deg)"
              }}
            />
            <Text
              size="medium"
              fitContent
              onClick={() => {
                setFocused(true);
                onMaxClick && onMaxClick(getMax(token?.selfBorrow));
              }}
              style={{ cursor: "pointer" }}
            >
              {+getUserRepay() || 0}
              <>&nbsp;</>
              {isNative ? token?.symbol : "$"}
            </Text>
          </Row>
          <Text textAlign="right" nowrap size="medium" type="secondary">
            Borrow Balance
          </Text>
        </Column>
      </Row>
      <SizedBox height={16} />
      <ModalInputContainer focused={focused} readOnly={!modalSetAmount}>
        {!isNative && <DollarSymbol>$</DollarSymbol>}
        {onMaxClick && (
          <MaxButton
            onClick={() => {
              setFocused(true);
              onMaxClick && onMaxClick(getMax(token?.selfBorrow));
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
          readOnly={!modalSetAmount}
        />
        {isNative ? (
          <TokenToDollar onClick={() => setInputAmountMeasure(false)}>
            <Text size="small" type="secondary">
              ~$
              {+token?.prices?.min && +amount
                ? (+formatVal(amount, token?.decimals).times(
                    token?.prices?.min
                  )).toFixed(4)
                : 0}
            </Text>
            <Swap />
          </TokenToDollar>
        ) : (
          <TokenToDollar onClick={() => setInputAmountMeasure(true)}>
            <Text size="small" type="secondary">
              ~{token?.symbol}{" "}
              {+token?.prices?.min &&
                +amount &&
                (+formatVal(
                  amount.div(token?.prices?.min),
                  token?.decimals
                )).toFixed(4)}
            </Text>
            <Swap />
          </TokenToDollar>
        )}
      </ModalInputContainer>
      <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Borrow APY
        </Text>
        <Text size="medium" fitContent>
          {token?.borrowAPY.toFormat(2) || 0}%
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Borrowed
        </Text>
        <Text size="medium" fitContent>
          {+token?.selfBorrow
            ? +formatVal(token?.selfBorrow, token?.decimals).toFixed(4)
            : 0}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Wallet Balance
        </Text>
        <Text size="medium" fitContent>
          {+userBalance && +amount
            ? (
                +formatVal(userBalance, token?.decimals) -
                +formatVal(amount, token?.decimals)
              ).toFixed(4)
            : 0}
          <>&nbsp;</>
          {token?.name}
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
      <SizedBox height={16} />
      <Footer>
        {accountStore && accountStore.address ? (
          <Button
            disabled={+amount === 0 || error !== "" || +token?.selfBorrow === 0}
            fixed
            onClick={() => submitForm()}
            size="large"
          >
            {error !== "" ? error : "Repay"}
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
export default observer(BorrowAssets);
