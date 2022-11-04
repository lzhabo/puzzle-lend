import React from "react";
import BN from "@src/utils/BN";
import styled from "@emotion/styled";
import BigNumberInput from "@components/BigNumberInput";
import MaxButton from "@components/MaxButton";
import AmountInput from "@components/AmountInput";
import Text from "@components/Text";
import { TPoolStats } from "@src/stores/LendStore";

import DollarSymbol from "@src/screens/Dashboard/DashboardModals/components/DollarSymbol";
import TokenToDollar from "@src/screens/Dashboard/DashboardModals/components/TokenToDollar";
import { ReactComponent as Swap } from "@src/assets/icons/swap.svg";

interface IProps {
  token: TPoolStats;
  isDollar: boolean;
  focused: boolean;
  amount: BN;
  error?: string;
  setFocused: (isFocus: boolean) => void;
  handleChangeAmount: (amount: BN) => void;
  onMaxClick: () => void;
  setInputAmountMeasure: (isDollar: boolean) => void;
}

const ModalInputContainer = styled.div<{
  focused?: boolean;
  error?: string;
  invalid?: boolean;
  readOnly?: boolean;
}>`
  position: relative;
  background: ${({ focused, theme }) =>
    focused ? theme.colors.white : theme.colors.primary100};
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px;
  height: 56px;
  border-radius: 12px;
  width: 100%;
  cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};
  box-sizing: border-box;

  input {
    cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};
  }

  border: 1px solid
    ${({ focused, error, theme }) => {
      if (error) return theme.colors.error500;
      if (focused) return theme.colors.blue500;
      return theme.colors.primary100;
    }};

  :hover {
    border-color: ${({ readOnly, focused, theme }) =>
      !readOnly && !focused
        ? theme.colors.primary650
        : focused ?? theme.colors.blue500};
  }

  .swap {
    stroke: ${({ theme }) => theme.colors.primary800};

    path {
      fill: ${({ theme }) => theme.colors.primary800};
    }
  }
`;

const ModalTokenInput: React.FC<IProps> = ({
  isDollar,
  focused,
  error,
  amount,
  token,
  setFocused,
  onMaxClick,
  handleChangeAmount,
  setInputAmountMeasure
}) => {
  const tokenPriceInDollar = () => {
    return BN.formatUnits(
      amount.div(token?.prices?.min),
      token?.decimals
    ).toFixed(4);
  };

  const tokenPriceNative = () => {
    return BN.formatUnits(
      amount.times(token?.prices?.min),
      token?.decimals
    ).toFixed(4);
  };

  return (
    <>
      <ModalInputContainer error={error} focused={focused} readOnly={!amount}>
        {isDollar && <DollarSymbol />}
        {onMaxClick && (
          <MaxButton
            onClick={() => {
              setFocused(true);
              onMaxClick();
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
          readOnly={!amount}
        />
        {isDollar ? (
          <TokenToDollar onClick={() => setInputAmountMeasure(false)}>
            <Text size="small" type="secondary">
              ~{token?.symbol}
              {tokenPriceInDollar()}
            </Text>
            <Swap />
          </TokenToDollar>
        ) : (
          <TokenToDollar onClick={() => setInputAmountMeasure(true)}>
            <Text size="small" type="secondary">
              ~$
              {tokenPriceNative()}
            </Text>
            <Swap />
          </TokenToDollar>
        )}
      </ModalInputContainer>
      <Text type="error" size="small">
        {error}
      </Text>
    </>
  );
};
export default ModalTokenInput;
