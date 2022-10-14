import styled from "@emotion/styled";
import React, { useCallback, useEffect, useState } from "react";
import MaxButton from "@components/MaxButton";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";
import Balance from "@src/entities/Balance";
import BN from "@src/utils/BN";
import BigNumberInput from "@components/BigNumberInput";
import AmountInput from "@components/AmountInput";
import _ from "lodash";
import TokenSelect from "@components/TokenInput/TokenSelect";
import TokenSelectModal from "../TokensSelectModal";

interface IProps {
  balances: Balance[];

  assetId: string;
  setAssetId?: (assetId: string) => void;

  decimals: number;

  amount: BN;
  setAmount?: (amount: BN) => void;

  onMaxClick?: () => void;
  usdnEquivalent?: string;

  selectable?: boolean;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;

  & > :first-of-type {
    margin-bottom: 8px;
  }

  @media (min-width: 560px) {
    flex-direction: row;
    & > :first-of-type {
      margin-bottom: 0;
      margin-right: 8px;
    }
  }
`;

const InputContainer = styled.div<{
  focused?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
}>`
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
  position: relative;
  cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};

  box-sizing: border-box;

  input {
    cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};
  }

  border: 1px solid
    ${({ focused, readOnly, theme }) =>
      focused && !readOnly ? theme.colors.blue500 : theme.colors.primary100};

  :hover {
    border-color: ${({ readOnly, focused, theme }) =>
      !readOnly && !focused
        ? theme.colors.primary650
        : focused ?? theme.colors.blue500};
  }
`;
const TokenInput: React.FC<IProps> = (props) => {
  const [focused, setFocused] = useState(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const selectedAssetBalance = props.balances?.find(
    ({ assetId }) => assetId === props.assetId
  );
  const [amount, setAmount] = useState<BN>(props.amount);

  useEffect(() => {
    props.amount && setAmount(props.amount);
  }, [props.amount]);

  const handleChangeAmount = (v: BN) => {
    setAmount(v);
    debounce(v);
  };
  //eslint-disable-next-line react-hooks/exhaustive-deps
  const debounce = useCallback(
    _.debounce((value: BN) => {
      props.setAmount && props.setAmount(value);
    }, 500),
    []
  );

  return (
    <Root>
      <TokenSelect
        token={props.balances.find(({ assetId }) => assetId === props.assetId)}
        onClick={() => setOpenModal(!openModal)}
        balance={selectedAssetBalance?.formatBalance}
        selectable={props.selectable}
      />
      <InputContainer focused={focused} readOnly={!props.setAmount}>
        {props.onMaxClick && (
          <MaxButton
            onClick={() => {
              setFocused(true);
              props.onMaxClick && props.onMaxClick();
            }}
          />
        )}
        <BigNumberInput
          renderInput={(props, ref) => (
            <AmountInput
              {...props}
              onFocus={(e) => {
                props.onFocus && props.onFocus(e);
                !props.readOnly && setFocused(true);
              }}
              onBlur={(e) => {
                props.onBlur && props.onBlur(e);
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
        <Text
          style={{ whiteSpace: "nowrap" }}
          type="secondary"
          size="small"
          fitContent
        >
          {props.usdnEquivalent}
        </Text>
      </InputContainer>
      {props.setAssetId && (
        <TokenSelectModal
          selectedTokenId={props.assetId}
          visible={openModal}
          onSelect={props.setAssetId}
          balances={props.balances}
          onClose={() => setOpenModal(!openModal)}
        />
      )}
    </Root>
  );
};
export default observer(TokenInput);
