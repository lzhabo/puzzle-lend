import React, { useState, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
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
import BN from "@src/utils/BN";
import _ from "lodash";

import { ReactComponent as Back } from "@src/assets/icons/arrowBackWithTail.svg";
import { ReactComponent as Swap } from "@src/assets/icons/swap.svg";

interface IProps {
  token: TPoolStats;
  modalAmount: BN;
  userBalance: BN;
  modalSetAmount?: (amount: BN) => void;
  onMaxClick?: (amount?: BN) => void;
  onClose?: () => void;
  onSubmit?: (amount: BN, assetId: string, contractAddress: string) => void;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 300px;
  padding: 24px 0;
`;

const Footer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-top: auto;
`;

const InputContainer = styled.div<{
  focused?: boolean;
  error?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
}>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px;
  height: 56px;
  border-radius: 12px;
  width: 100%;
  position: relative;
  cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};

  box-sizing: border-box;

  input {
    cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};
  }
`;

const TokenToDollar = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  padding: 5px 8px;
  border-radius: 6px;
  cursor: pointer;

  svg {
    margin-left: 5px;
  }

  &:hover {
    background-color: #fff;
  }
`;

const DollarSymbol = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  font-size: 18px;
  left: 67px;
  top: 50%;
  color: #363870;
  transform: translateY(-50%);
`;

const WithdrawAssets: React.FC<IProps> = ({
  token,
  modalAmount,
  userBalance,
  modalSetAmount,
  onMaxClick,
  onClose,
  onSubmit
}) => {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
  const [amount, setAmount] = useState<BN>(modalAmount);
  const [getDynamicAccountHealth, setAccountHealth] = useState<number>(100);
  const [isNative, setConvertToNative] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const { lendStore, accountStore } = useStores();

  const formatVal = (valArg: BN | number, decimal: number) => {
    return BN.formatUnits(valArg, decimal);
  };

  const getUserBalance = () => {
    if (!isNative)
      return formatVal(userBalance, token?.decimals)
        .times(token?.prices?.min)
        .plus(formatVal(amount, token?.decimals))
        .toFixed(4);

    return userBalance
      ? (+formatVal(userBalance, token?.decimals).plus(
          formatVal(amount, token?.decimals)
        )).toFixed(4)
      : 0;
  };

  // todo: BNNNN
  const countAccountHealth = (currentWithdraw: any) => {
    // let currentWithdrawAmount = currentWithdraw.toDecimalPlaces(0);
    let borrowCapacity = BN.ZERO;
    let borrowCapacityUsed = BN.ZERO;

    // if (!isNative) currentWithdrawAmount = currentWithdrawAmount.div(token?.prices?.min);

    // tokens.forEach((item: IToken) => {
    //   const tokenData: any = lendStore.poolDataTokensWithStats[item.assetId];
    //   if (+tokenData.selfSupply > 0) {
    //     let localborrowCapacity = formatVal(tokenData.selfSupply, tokenData.decimals)
    //       .toDecimalPlaces(2)
    //       .times(tokenData.minPrice)
    //       .times(+tokenData.setupLtv / 100);

    //     if (tokenData.assetId === token.assetId) {
    //       localborrowCapacity = formatVal(tokenData.selfSupply.minus(currentWithdrawAmount), tokenData.decimals)
    //         .toDecimalPlaces(2)
    //         .times(tokenData.minPrice)
    //         .times(+tokenData.setupLtv / 100);
    //     }

    //     borrowCapacity = borrowCapacity.plus(localborrowCapacity);
    //   }

    //   if (+tokenData.selfBorrow > 0) {
    //     borrowCapacityUsed = formatVal(tokenData.selfBorrow, tokenData.decimals)
    //       .times(tokenData.maxPrice)
    //       .div(+tokenData.setupLts / 100)
    //       .plus(borrowCapacityUsed);
    //   }
    // });

    // case when user did'nt borrow anything
    if (token.selfSupply.isEqualTo(0)) {
      const newSupply = formatVal(currentWithdraw, token?.decimals)
        .times(token.prices.min)
        .times(token.lt);
      borrowCapacityUsed = borrowCapacityUsed.minus(newSupply);
    }

    const accountHealth: number = +BN.formatUnits(1, 0)
      .minus(borrowCapacityUsed.div(borrowCapacity))
      .times(100);

    if (+borrowCapacity < 0 || accountHealth < 0) {
      setAccountHealth(0);
      return 0;
    }

    setAccountHealth(accountHealth);
    return accountHealth;
  };

  useEffect(() => {
    modalAmount && setAmount(modalAmount);
  }, [modalAmount]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounce = useCallback(
    _.debounce((value: BN) => {
      modalSetAmount && modalSetAmount(value);
    }, 500),
    []
  );

  const getReserves = () => {
    return (+formatVal(token?.totalSupply, token?.decimals).minus(
      formatVal(token?.totalBorrow, token?.decimals)
    )).toFixed(4);
  };

  const handleChangeAmount = (v: BN) => {
    let isError = false;
    let selfSupply = token?.selfSupply;

    if (!isNative) selfSupply = selfSupply.times(token?.prices?.min);
    console.log(
      +v.toDecimalPlaces(0, 2),
      +selfSupply.toDecimalPlaces(0, 2),
      "v-self"
    );

    // will be fixed in new app, problem of BigNumber input
    const formattedVal = v.minus(100);

    if (
      formattedVal &&
      selfSupply &&
      selfSupply.toDecimalPlaces(0, 2).lt(formattedVal)
    ) {
      setError(`Amount of withdraw bigger than you'r supply`);
      isError = true;
    }

    if (countAccountHealth(v) < 1) {
      setError(`Account health less than 1%, risk of liquidation`);
      isError = true;
    }

    if (!isError) setError("");
    setAmount(v);
    debounce(v);
  };

  const maxWithdraw = (val: BN) => {
    let isError = false;
    let formattedVal: BN = val;

    if (!isNative) formattedVal = val.times(token?.prices?.min);

    if (countAccountHealth(val) < 1) {
      setError(`Account health less than 1%, risk of liquidation`);
      isError = true;
    }

    if (!isError) setError("");

    return formattedVal.toDecimalPlaces(0);
  };

  const setInputAmountMeasure = (isNativeToken: boolean) => {
    let fixedValue = amount;

    if (isNativeToken && !isNative)
      fixedValue = fixedValue.div(token?.prices?.min).toDecimalPlaces(0);

    setAmount(fixedValue);
    debounce(fixedValue);
    setConvertToNative(isNativeToken);
  };

  const submitForm = () => {
    let amountVal = modalAmount;

    if (!isNative) amountVal = amountVal.div(token?.prices?.min);

    // will be fixed in new app, problem of BigNumber input
    onSubmit!(
      amountVal.toDecimalPlaces(0, 2),
      token.assetId,
      "lendStore.activePoolContract"
    );
  };

  return (
    <Root>
      <Row>
        <Row
          alignItems="center"
          onClick={() => navigate(`/dashboard/token/${token.assetId}`)}
          style={{ cursor: "pointer" }}
        >
          {token?.symbol && (
            <SquareTokenIcon size="small" src={tokenLogos[token?.symbol]} />
          )}
          <SizedBox width={8} />
          <Column>
            <Text size="medium">{token?.symbol}</Text>
            <Text size="small" type="secondary">
              {token.name || ""}
            </Text>
          </Column>
        </Row>
        <Column alignItems="flex-end">
          <Text size="medium" textAlign="right">
            {+getUserBalance() || 0}
            <>&nbsp;</>
            {isNative ? token?.symbol : "$"}
          </Text>
          <Text nowrap size="medium" type="secondary">
            Wallet Balance
          </Text>
        </Column>
      </Row>
      <SizedBox height={16} />
      <InputContainer focused={focused} readOnly={!modalAmount}>
        {!isNative && <DollarSymbol>$</DollarSymbol>}
        {onMaxClick && (
          <MaxButton
            onClick={() => {
              setFocused(true);
              onMaxClick && onMaxClick(maxWithdraw(token.selfSupply));
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
      </InputContainer>
      <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          {token.name} liquidity
        </Text>
        <Text size="medium" fitContent>
          {getReserves()} {token?.symbol}
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
            onMaxClick && onMaxClick(maxWithdraw(token.selfSupply));
          }}
          style={{ cursor: "pointer" }}
        >
          {(+formatVal(token.selfSupply, token?.decimals)).toFixed(4)}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row alignItems="center" justifyContent="space-between">
        <Text size="medium" type="secondary" nowrap>
          Account Health
        </Text>
        <Row alignItems="center" justifyContent="flex-end">
          <Text size="medium" type="success" fitContent>
            {+lendStore.health.toDecimalPlaces(2).toFixed(2) || 0} %
          </Text>
          {lendStore.health.toDecimalPlaces(2).lt(100) ? (
            <>
              <Back
                style={{
                  minWidth: "16px",
                  maxWidth: "16px",
                  height: "18px",
                  transform: "rotate(180deg)"
                }}
              />
              <Text
                type={
                  getDynamicAccountHealth < +lendStore.health.toDecimalPlaces(2)
                    ? "error"
                    : "success"
                }
                size="medium"
                fitContent
              >
                <>&nbsp;</>
                {getDynamicAccountHealth && amount
                  ? getDynamicAccountHealth.toFixed(2)
                  : 0}
                %
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
        {token?.totalSupply && token?.totalBorrow && +getReserves() === 0 ? (
          <Button fixed disabled size="large">
            Not Enough liquidity to Withdraw
          </Button>
        ) : accountStore && accountStore.address ? (
          <Button
            disabled={+amount === 0 || error !== ""}
            fixed
            onClick={() => submitForm()}
            size="large"
          >
            {error !== "" ? error : "Withdraw"}
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
