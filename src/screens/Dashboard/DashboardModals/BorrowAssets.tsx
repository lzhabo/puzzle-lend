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
  poolStats: TPoolStats[];
  poolId: string;
  modalAmount: BN;
  userCollateral: BN;
  userHealth: BN;
  modalSetAmount: (amount: BN) => void;
  onMaxClick: (amount: BN) => void;
  onSubmit?: (amount: BN, assetId: string, contractAddress: string) => void;
}

const BorrowAssets: React.FC<IProps> = ({
  token,
  modalAmount,
  poolStats,
  userHealth,
  userCollateral,
  poolId,
  modalSetAmount,
  onMaxClick,
  onSubmit
}) => {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
  const [amount, setAmount] = useState<BN>(modalAmount);
  const [isNative, setConvertToNative] = useState<boolean>(true);
  const [getDynamicAccountHealth, setAccountHealth] = useState<number>(100);
  const [error, setError] = useState<string>("");
  const { accountStore } = useStores();

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

  const getReserves = () => {
    return formatVal(token?.totalSupply, token?.decimals)
      .minus(formatVal(token?.totalBorrow, token?.decimals))
      .toFixed(2);
  };

  const countAccountHealth = (currentBorrow: BN) => {
    if (currentBorrow.eq(0)) {
      setAccountHealth(100);
      return 100;
    }

    let currentBorrowAmount = formatVal(currentBorrow, token?.decimals);
    if (!isNative)
      currentBorrowAmount = currentBorrowAmount.div(token?.prices?.min);

    const bc = poolStats.reduce((acc: BN, stat: TPoolStats) => {
      const deposit = BN.formatUnits(stat.selfSupply, stat.decimals);
      if (deposit.eq(0)) return acc;
      const cf = stat.cf;
      const assetBc = cf.times(1).times(deposit).times(stat.prices.min);
      return acc.plus(assetBc);
    }, BN.ZERO);

    let bcu = poolStats.reduce((acc: BN, stat: TPoolStats) => {
      const borrow = BN.formatUnits(stat.selfBorrow, stat.decimals);
      const lt = stat.lt;
      let assetBcu = borrow.times(stat.prices.max).div(lt);

      // if same asset, adding to it INPUT value
      if (stat.assetId === token?.assetId) {
        assetBcu = formatVal(stat.selfBorrow, stat.decimals)
          .plus(currentBorrowAmount)
          .times(stat.prices.max)
          .div(lt);
      }

      return acc.plus(assetBcu);
    }, BN.ZERO);

    // case when user did'nt borrow anything
    if (bcu.eq(0))
      bcu = currentBorrowAmount
        .times(token?.prices.max)
        .div(token?.lt)
        .plus(bcu);

    const accountHealth: BN = new BN(1).minus(bcu.div(bc)).times(100);

    if (+bcu < 0 || +accountHealth < 0) {
      setAccountHealth(0);
      return 0;
    }

    setAccountHealth(+accountHealth);
    return +accountHealth;
  };

  // counting maximum amount for MAX btn
  const userMaximumToBorrowBN = (userColatteral: BN, rate: BN) => {
    let maximum = BN.ZERO;
    let isError = false;
    console.log(+token?.lt, +userColatteral, +rate, "token?.lt");

    // if !isNative, show maximum in dollars, collateral in dollars by default
    maximum = formatVal(userColatteral, 6);
    maximum = maximum.times(token?.lt);

    // if isNative, show maximum in crypto AMOUNT
    if (isNative) maximum = maximum.div(rate);
    const totalReserves = token?.totalSupply.minus(token?.totalBorrow);

    // cause if market liquidity lower, asset cant provide requested amount of money to user
    if (formatVal(totalReserves, 6).lt(maximum)) {
      setError("Not enough Reserves in Pool");
      isError = true;
      return totalReserves.times(0.8);
    }

    const val = maximum.times(10 ** token.decimals).times(0.8);

    if (countAccountHealth(val) < 1) {
      setError(`Account health less than 1%, risk of liquidation`);
      isError = true;
    }

    if (!isError) setError("");
    // current recommended maximum borrow, no more than 80% of
    return val;
  };

  // counting maximum after USER INPUT
  const userMaximumToBorrow = (userColatteral: BN, rate: BN) => {
    let maximum = formatVal(userColatteral, 6);

    // if isNative, show maximum in crypto AMOUNT
    // else in dollars
    if (isNative) maximum = formatVal(userColatteral, 6).div(rate);

    maximum = maximum.times(+token?.lt);

    const totalReserves = formatVal(token?.totalSupply, token?.decimals).minus(
      formatVal(token?.totalBorrow, token?.decimals)
    );

    // cause if market liquidity lower, asset cant provide requested amount of money to user
    if (totalReserves.lt(maximum)) {
      return +totalReserves.minus(formatVal(amount, token?.decimals));
    }

    return maximum.minus(formatVal(amount, token?.decimals));
  };

  const submitForm = () => {
    let amountVal = modalAmount;

    if (!isNative) amountVal = amountVal.div(token?.prices?.min);

    onSubmit!(formatVal(+amountVal.toFixed(0), 0), token?.assetId, poolId);
  };

  const handleChangeAmount = (v: BN) => {
    const formattedVal = formatVal(v, token?.decimals);
    // if !isNative, show maximum in dollars, collateral in dollars by default
    let maxCollateral = formatVal(userCollateral, 6);
    // reserves in crypto amount by default
    let totalReserves = token?.totalSupply.minus(token?.totalBorrow);
    let isError = false;

    // if isNative, show maximum in crypto AMOUNT
    if (isNative)
      maxCollateral = formatVal(userCollateral, 6).div(token?.prices?.min);
    if (!isNative) totalReserves = totalReserves.times(token?.prices?.min);

    if (maxCollateral.isLessThanOrEqualTo(formattedVal)) {
      setError("Borrow amount less than your Collateral");
      isError = true;
    }

    if (formatVal(totalReserves, 6).isLessThanOrEqualTo(formattedVal)) {
      setError("Not enough Reserves in Pool");
      isError = true;
    }

    if (countAccountHealth(v) < 1) {
      setError(`Account health less than 1%, risk of liquidation`);
      isError = true;
    }

    if (!isError) setError("");
    handleDebounce(v);
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
              {+formatVal(amount, token?.decimals).toFixed(4) || 0}
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
                onMaxClick &&
                  onMaxClick(
                    userMaximumToBorrowBN(userCollateral, token?.prices.max)
                  );
              }}
              style={{ cursor: "pointer" }}
            >
              {+token?.cf && +token?.prices.max
                ? (+userMaximumToBorrow(
                    userCollateral,
                    token?.prices.max
                  )).toFixed(6)
                : 0}
              <>&nbsp;</>
              {isNative ? token?.symbol : "$"}
            </Text>
          </Row>
          <Text textAlign="right" nowrap size="medium" type="secondary">
            Max possible to borrow
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
              onMaxClick &&
                onMaxClick(
                  userMaximumToBorrowBN(userCollateral, token?.prices.max)
                );
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
              {token?.prices?.min && amount
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
              {token?.prices?.min &&
                amount &&
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
          {token?.symbol} liquidity
        </Text>
        <Text size="medium" fitContent>
          {getReserves() || 0} {token?.symbol}
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
            ? (+formatVal(token?.selfBorrow, token?.decimals)).toFixed(4)
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
          {getDynamicAccountHealth !== 100 ? (
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
                  getDynamicAccountHealth < +userHealth ? "error" : "success"
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
      {/* <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Checkbox
          label="You will be liquidated if you can not cover your borrow"
          checked={props.isAgree}
          onChange={(e) => props.onChange(e)}
        />
      </Row> */}
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
