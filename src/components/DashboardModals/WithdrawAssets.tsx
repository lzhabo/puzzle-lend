/* eslint-disable react/require-default-props */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { useStores } from '@src/stores';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Column, Row } from '@components/Flex';
import SizedBox from "@components/SizedBox";
import Text from '@components/Text';
import Button from '@components/Button';
import MaxButton from '@components/MaxButton';
import BigNumberInput from '@components/BigNumberInput';
import AmountInput from '@components/AmountInput';
import SquareTokenIcon from '@components/SquareTokenIcon';
import tokenLogos from "@src/constants/tokenLogos";
import { IToken } from "@src/constants";
import BN from "@src/utils/BN";
import _ from 'lodash';

import { ReactComponent as Swap } from '@src/common/assets/icons/swap.svg';
import { ReactComponent as Back } from '@src/common/assets/icons/arrowBackWithTail.svg';

interface IProps {
  assetId: string;
  decimals: number;
  amount: BN;
  assetSymbol?: string;
  assetName?: string;
  totalSupply: BN;
  totalBorrow: BN;
  userBalance: BN;
  setupSupplyAPY?: BN;
  selfSupply: BN;
  selfBorrow: BN;
  rate: BN;
  userHealth: number;
  minPrice: BN;
  setupLtv: BN;
  setupLts: BN;
  setAmount?: (amount: BN) => void;
  onMaxClick?: (amount?: BN) => void;
  onClose?: () => void;
  onSubmit?: (amount: BN, assetId: string, contractAddress: string) => void;
  usdnEquivalent?: string;
  error?: boolean;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 300px;
  padding: 24px 20px 16px 20px;
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
  background: ${({ focused, error }) => (focused ? '#ffffff' : '#F1F2FE')};
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px;
  height: 56px;
  border-radius: 12px;
  width: 100%;
  position: relative;
  cursor: ${({ readOnly }) => (readOnly ? 'not-allowed' : 'unset')};

  box-sizing: border-box;

  input {
    cursor: ${({ readOnly }) => (readOnly ? 'not-allowed' : 'unset')};
  }

  border: 1px solid
    ${({ focused, readOnly, error }) => (error ? '#ED827E' : focused && !readOnly ? '#7075E9' : '#f1f2fe')};

  :hover {
    border-color: ${({ readOnly, focused, error }) =>
      error ? '#ED827E' : !readOnly && !focused ? '#C6C9F4' : focused ?? '#7075E9'};
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

const WithdrawAssets: React.FC<IProps> = (props) => {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
  const [amount, setAmount] = useState<BN>(props.amount);
  const [getDynamicAccountHealth, setAccountHealth] = useState<number>(100);
  const [isNative, setConvertToNative] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const { lendStore, accountStore } = useStores();

  const formatVal = (valArg: BN | number, decimal: number) => {
    return BN.formatUnits(valArg, decimal);
  };

  const getUserBalance = () => {
    if (!isNative)
      return formatVal(props.userBalance, props.decimals)
        .times(props.rate)
        .plus(formatVal(amount, props.decimals))
        .toFixed(4);

    return props.userBalance
      ? (+formatVal(props.userBalance, props.decimals).plus(formatVal(amount, props.decimals))).toFixed(4)
      : 0;
  };

  // todo: BNNNN
  const countAccountHealth = (currentWithdraw: any) => {
    let currentWithdrawAmount = currentWithdraw.toDecimalPlaces(0);
    const tokens = lendStore.poolsStats;
    let borrowCapacity = BN.ZERO;
    let borrowCapacityUsed = BN.ZERO;

    if (!isNative) currentWithdrawAmount = currentWithdrawAmount.div(props.rate);

    // tokens.forEach((item: IToken) => {
    //   const tokenData: any = lendStore.poolDataTokensWithStats[item.assetId];
    //   if (+tokenData.selfSupply > 0) {
    //     let localborrowCapacity = formatVal(tokenData.selfSupply, tokenData.decimals)
    //       .toDecimalPlaces(2)
    //       .times(tokenData.minPrice)
    //       .times(+tokenData.setupLtv / 100);

    //     if (tokenData.assetId === props.assetId) {
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
    if (props.selfSupply.isEqualTo(0)) {
      const newSupply = formatVal(currentWithdraw, props.decimals)
        .times(props.minPrice)
        .times(+props.setupLtv / 100);
      borrowCapacityUsed = borrowCapacityUsed.minus(newSupply);
    }

    const accountHealth: number = +BN.formatUnits(1, 0).minus(borrowCapacityUsed.div(borrowCapacity)).times(100);

    if (+borrowCapacity < 0 || accountHealth < 0) {
      setAccountHealth(0);
      return 0;
    }

    setAccountHealth(accountHealth);
    return accountHealth;
  };

  useEffect(() => {
    props.amount && setAmount(props.amount);
  }, [props.amount]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounce = useCallback(
    _.debounce((value: BN) => {
      props.setAmount && props.setAmount(value);
    }, 500),
    []
  );

  const getReserves = () => {
    return (+formatVal(props.totalSupply, props.decimals).minus(formatVal(props.totalBorrow, props.decimals))).toFixed(
      4
    );
  };

  const handleChangeAmount = (v: BN) => {
    let isError = false;
    let { selfSupply } = props;

    if (!isNative) selfSupply = selfSupply.times(props.rate);
    console.log(+v.toDecimalPlaces(0, 2), +selfSupply.toDecimalPlaces(0, 2), 'v-self');

    // will be fixed in new app, problem of BigNumber input
    const formattedVal = v.minus(100);

    if (formattedVal && selfSupply && selfSupply.toDecimalPlaces(0, 2).lt(formattedVal)) {
      setError(`Amount of withdraw bigger than you'r supply`);
      isError = true;
    }

    if (countAccountHealth(v) < 1) {
      setError(`Account health less than 1%, risk of liquidation`);
      isError = true;
    }

    if (!isError) setError('');
    setAmount(v);
    debounce(v);
  };

  const maxWithdraw = (val: BN) => {
    let isError = false;
    let formattedVal: BN = val;

    if (!isNative) formattedVal = val.times(props.rate);

    if (countAccountHealth(val) < 1) {
      setError(`Account health less than 1%, risk of liquidation`);
      isError = true;
    }

    if (!isError) setError('');

    return formattedVal.toDecimalPlaces(0);
  };

  const setInputAmountMeasure = (isNativeToken: boolean) => {
    let fixedValue = amount;

    if (isNativeToken && !isNative) fixedValue = fixedValue.div(props.rate).toDecimalPlaces(0);

    setAmount(fixedValue);
    debounce(fixedValue);
    setConvertToNative(isNativeToken);
  };

  const submitForm = () => {
    let amountVal = props.amount;

    if (!isNative) amountVal = amountVal.div(props.rate);

    // will be fixed in new app, problem of BigNumber input
    props.onSubmit!(amountVal.toDecimalPlaces(0, 2), props.assetId, 'lendStore.activePoolContract');
  };

  return (
    <Root>
      <Row>
        <Row
          alignItems="center"
          onClick={() => navigate(`/dashboard/token/${props.assetId}`)}
          style={{ cursor: 'pointer' }}>
          {props.assetSymbol && <SquareTokenIcon size="small" src={tokenLogos[props.assetSymbol]} />}
          <SizedBox width={8} />
          <Column>
            <Text size="medium">{props.assetSymbol}</Text>
            <Text size="small" type="secondary">
              {props.assetName ? props.assetName : ''}
            </Text>
          </Column>
        </Row>
        <Column alignItems="flex-end">
          <Text size="medium" textAlign="right">
            {+getUserBalance() || 0}
            <>&nbsp;</>
            {isNative ? props.assetSymbol : '$'}
          </Text>
          <Text nowrap size="medium" type="secondary">
            Wallet Balance
          </Text>
        </Column>
      </Row>
      <SizedBox height={16} />
      <InputContainer focused={focused} readOnly={!props.setAmount} error={props.error}>
        {!isNative && <DollarSymbol>$</DollarSymbol>}
        {props.onMaxClick && (
          <MaxButton
            onClick={() => {
              setFocused(true);
              props.onMaxClick && props.onMaxClick(maxWithdraw(props.selfSupply));
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
          decimals={props.decimals}
          value={amount}
          onChange={handleChangeAmount}
          placeholder="0.00"
          readOnly={!props.setAmount}
        />
        {isNative ? (
          <TokenToDollar onClick={() => setInputAmountMeasure(false)}>
            <Text size="small" type="secondary">
              ~${+props.rate && +amount ? (+formatVal(amount, props.decimals).times(props.rate)).toFixed(4) : 0}
            </Text>
            <Swap />
          </TokenToDollar>
        ) : (
          <TokenToDollar onClick={() => setInputAmountMeasure(true)}>
            <Text size="small" type="secondary">
              ~{props.assetSymbol}{' '}
              {+props.rate && +amount && (+formatVal(amount.div(props.rate), props.decimals)).toFixed(4)}
            </Text>
            <Swap />
          </TokenToDollar>
        )}
      </InputContainer>
      <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          {props.assetName} liquidity
        </Text>
        <Text size="medium" fitContent>
          {getReserves()} {props.assetSymbol}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Supply APY
        </Text>
        <Text size="medium" fitContent>
          {props.setupSupplyAPY ? (+props.setupSupplyAPY).toFixed(2) : 0}%
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
            props.onMaxClick && props.onMaxClick(maxWithdraw(props.selfSupply));
          }}
          style={{ cursor: 'pointer' }}>
          {(+formatVal(props.selfSupply, props.decimals)).toFixed(4)}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row alignItems="center" justifyContent="space-between">
        <Text size="medium" type="secondary" nowrap>
          Account Health
        </Text>
        <Row alignItems="center" justifyContent="flex-end">
          <Text size="medium" type="success" fitContent>
            {+props.userHealth.toFixed(2) || 0} %
          </Text>
          {getDynamicAccountHealth !== 100 ? (
            <>
              <Back
                style={{
                  minWidth: '16px',
                  maxWidth: '16px',
                  height: '18px',
                  transform: 'rotate(180deg)',
                }}
              />
              <Text type={getDynamicAccountHealth < +props.userHealth ? 'error' : 'success'} size="medium" fitContent>
                <>&nbsp;</>
                {getDynamicAccountHealth && amount ? getDynamicAccountHealth.toFixed(2) : 0}%
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
        {props.totalSupply && props.totalBorrow && +getReserves() === 0 ? (
          <Button fixed disabled size="large">
            Not Enough liquidity to Withdraw
          </Button>
        ) : accountStore && accountStore.address ? (
          <Button
            disabled={+amount === 0 || error !== ''}
            fixed
            onClick={() => submitForm()}
            size="large">
            {error !== '' ? error : 'Withdraw'}
          </Button>
        ) : (
          <Button
            fixed
            onClick={() => {
              accountStore.setLoginModalOpened(true);
              lendStore.setDashboardModalOpened(false, lendStore.dashboardModalStep);
            }}
            size="large">
            Login
          </Button>
        )}
      </Footer>
    </Root>
  );
};
export default observer(WithdrawAssets);
