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
  poolStats: TPoolStats[];
  modalAmount: BN;
  userBalance: BN;
  poolId: string;
  modalSetAmount: (amount: BN) => void;
  onMaxClick: (amount: BN) => void;
  onSubmit?: (amount: BN, assetId: string, contractAddress: string) => void;
}

const WithdrawAssets: React.FC<IProps> = ({
  token,
  poolStats,
  poolId,
  modalAmount,
  userBalance,
  modalSetAmount,
  onMaxClick,
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

  const countAccountHealth = (currentWithdraw: any) => {
    let currentWithdrawAmount = currentWithdraw;

    if (!isNative)
      currentWithdrawAmount = currentWithdrawAmount.div(token?.prices?.min);

    const bc = poolStats.reduce((acc: BN, stat: TPoolStats) => {
      const deposit = formatVal(stat.selfSupply, stat.decimals);
      if (deposit.eq(0)) return acc;
      const cf = stat.cf;
      let assetBc = cf.times(1).times(deposit).times(stat.prices.min);

      if (stat.assetId === token?.assetId) {
        assetBc = formatVal(
          stat.selfSupply.minus(currentWithdrawAmount),
          stat.decimals
        )
          .times(stat.prices.min)
          .times(cf);
      }

      return acc.plus(assetBc);
    }, BN.ZERO);

    let bcu = poolStats.reduce((acc: BN, stat: TPoolStats) => {
      const borrow = BN.formatUnits(stat.selfBorrow, stat.decimals);
      const lt = stat.lt;
      let assetBcu = borrow.times(stat.prices.max).div(lt);
      return acc.plus(assetBcu);
    }, BN.ZERO);

    const accountHealth: BN = new BN(1).minus(bcu.div(bc)).times(100);

    if (bc.lt(0) || accountHealth.lt(0)) {
      setAccountHealth(0);
      return 0;
    }

    setAccountHealth(+accountHealth);
    return +accountHealth;
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
    return (+formatVal(token?.totalSupply, token?.decimals).minus(
      formatVal(token?.totalBorrow, token?.decimals)
    )).toFixed(4);
  };

  const handleChangeAmount = (v: BN) => {
    let isError = false;
    let selfSupply = token?.selfSupply;

    if (!isNative) selfSupply = selfSupply.times(token?.prices?.min);

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
    handleDebounce(v);
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

    handleDebounce(fixedValue);
    setConvertToNative(isNativeToken);
  };

  const submitForm = () => {
    let amountVal = modalAmount;

    if (!isNative) amountVal = amountVal.div(token?.prices?.min);

    // will be fixed in new app, problem of BigNumber input
    onSubmit!(amountVal.toDecimalPlaces(0, 2), token?.assetId, poolId);
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
      <ModalInputContainer focused={focused} readOnly={!modalAmount}>
        {!isNative && <DollarSymbol>$</DollarSymbol>}
        {onMaxClick && (
          <MaxButton
            onClick={() => {
              setFocused(true);
              onMaxClick && onMaxClick(maxWithdraw(token?.selfSupply));
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
      </ModalInputContainer>
      <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          {token?.name} liquidity
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
            onMaxClick && onMaxClick(maxWithdraw(token?.selfSupply));
          }}
          style={{ cursor: "pointer" }}
        >
          {(+formatVal(token?.selfSupply, token?.decimals)).toFixed(4)}
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
              <BackIcon />
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
