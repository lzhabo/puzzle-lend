import React, { useState, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { useStores } from "@src/stores";
import { useNavigate } from "react-router-dom";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import Button from "@components/Button";
import MaxButton from "@components/MaxButton";
import BigNumberInput from "@components/BigNumberInput";
import AmountInput from "@components/AmountInput";
import SquareTokenIcon from "@components/SquareTokenIcon";
import tokenLogos from "@src/constants/tokenLogos";
import { observer } from "mobx-react-lite";
import { Column, Row } from "@components/Flex";
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
  error?: boolean;
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
  background: ${({ focused, error }) => (focused ? "#ffffff" : "#F1F2FE")};
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

  border: 1px solid
    ${({ focused, readOnly, error }) =>
      error ? "#ED827E" : focused && !readOnly ? "#7075E9" : "#f1f2fe"};

  :hover {
    border-color: ${({ readOnly, focused, error }) =>
      error
        ? "#ED827E"
        : !readOnly && !focused
        ? "#C6C9F4"
        : focused ?? "#7075E9"};
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

const SupplyAssets: React.FC<IProps> = ({
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
  const [isNative, setConvertToNative] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [amount, setAmount] = useState<BN>(modalAmount);
  const { accountStore } = useStores();

  const formatVal = (valArg: BN | number, decimal: number) => {
    return BN.formatUnits(valArg, decimal);
  };

  const getDailyIncome = () => {
    return +token.interest
      ? token.interest.times(formatVal(amount, token.decimals))
      : 0;
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

  const handleChangeAmount = (v: BN) => {
    const formattedVal = formatVal(v, token.decimals);
    let walletBal = formatVal(userBalance, token.decimals);
    let isError = false;

    if (!isNative) walletBal = walletBal.times(token?.prices?.min);

    if (walletBal.lt(formattedVal)) {
      setError("Wallet Balance too low");
      isError = true;
    }

    if (!isError) setError("");
    setAmount(v);
    debounce(v);
  };

  const getUserBalance = () => {
    if (!isNative)
      return (+formatVal(userBalance, token.decimals)
        .times(token?.prices?.min)
        .minus(formatVal(amount, token.decimals))).toFixed(4);

    return +userBalance
      ? (+formatVal(userBalance, token.decimals).minus(
          formatVal(amount, token.decimals)
        )).toFixed(4)
      : 0;
  };

  const getMaxSupply = (val: BN) => {
    if (!isNative) return val.times(token?.prices?.min);

    return val;
  };

  const submitForm = () => {
    let amountVal = modalAmount;

    if (!isNative) amountVal = amountVal.div(token?.prices?.min);

    onSubmit!(
      amountVal.toSignificant(0),
      token?.assetId,
      "lendStore.activePoolContract"
    );
  };

  const setInputAmountMeasure = (isNativeToken: boolean) => {
    let fixedValue = amount;

    if (isNativeToken && !isNative)
      fixedValue = fixedValue.div(token?.prices?.min);

    setAmount(fixedValue);
    debounce(fixedValue);
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
              {token?.name || ""}
            </Text>
          </Column>
        </Row>
        <Column alignItems="flex-end">
          <Row alignItems="center">
            <Text
              size="medium"
              fitContent
              onClick={() => {
                setFocused(true);
                onMaxClick && onMaxClick(getMaxSupply(userBalance));
              }}
              style={{ cursor: "pointer" }}
            >
              {+getUserBalance() || 0}
              <>&nbsp;</>
              {isNative ? token?.symbol : "$"}
            </Text>
            <Back
              style={{
                minWidth: "16px",
                maxWidth: "16px",
                transform: "rotate(180deg)"
              }}
            />
            <Text size="medium" type="secondary" fitContent>
              {(+formatVal(amount, token.decimals) || 0).toFixed(4)}
            </Text>
          </Row>
          <Text size="medium" type="secondary" nowrap>
            Wallet Balance
          </Text>
        </Column>
      </Row>
      <SizedBox height={16} />
      <InputContainer focused={focused} readOnly={!modalSetAmount}>
        {!isNative && <DollarSymbol>$</DollarSymbol>}
        {onMaxClick && (
          <MaxButton
            onClick={() => {
              setFocused(true);
              onMaxClick && onMaxClick(getMaxSupply(userBalance));
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
          decimals={token.decimals}
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
                ? (+formatVal(amount, token.decimals).times(
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
                  token.decimals
                )).toFixed(4)}
            </Text>
            <Swap />
          </TokenToDollar>
        )}
      </InputContainer>
      {/* itemData.self_daily_income = supplyInterest * (itemData.self_supply / 10 ** itemData.precision); */}
      <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Text
          size="medium"
          type={+getDailyIncome() > 0 ? "success" : "secondary"}
          fitContent
        >
          Daily Income
        </Text>
        <Text
          size="medium"
          type={+getDailyIncome() > 0 ? "success" : "primary"}
          fitContent
        >
          $ {+token?.interest ? (+getDailyIncome()).toFixed(6) : 0}
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
          Borrowed
        </Text>
        <Text size="medium" fitContent>
          {+formatVal(token.selfBorrow, token.decimals) || 0}
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
      <Footer>
        {accountStore && accountStore.address ? (
          <Button
            disabled={+amount === 0 || error !== ""}
            fixed
            onClick={() => submitForm()}
            size="large"
          >
            {error !== "" ? error : "Supply"}
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
