import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  poolId: string;
  modalAmount: BN;
  userBalance: BN;
  error: string;
  modalSetAmount: (amount: BN) => void;
  onMaxClick: (amount: BN) => void;
  onSubmit: (amount: BN, assetId: string, contractAddress: string) => void;
}

const SupplyAssets: React.FC<IProps> = ({
  token,
  modalAmount,
  userBalance,
  poolId,
  error,
  modalSetAmount,
  onMaxClick,
  onSubmit
}) => {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
  const vm = DashboardUseVM();
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
    vm.supplyChangeAmount(v);
    handleDebounce(v);
  };

  const getMaxSupply = () => {
    const val = vm.getMaxBtn.toDecimalPlaces(0);
    handleDebounce(val);

    return val;
  };

  const submitForm = () => {
    const amountVal = vm.getFormattedVal;
    onSubmit(amountVal.toSignificant(0), token?.assetId, poolId);
  };

  const setInputAmountMeasure = (isCurrentNative: boolean) => {
    handleDebounce(vm.getOnNativeChange.toDecimalPlaces(0));
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
                onMaxClick && onMaxClick(getMaxSupply());
              }}
              style={{ cursor: "pointer" }}
            >
              {vm.getUserBalance || 0}
              <>&nbsp;</>
              {vm.isDollar ? "$" : token?.symbol}
            </Text>
            <BackIcon />
            <Text size="medium" type="secondary" fitContent>
              {(+vm.formatVal(amount, token?.decimals) || 0).toFixed(4)}
            </Text>
          </Row>
          <Text size="medium" type="secondary" nowrap>
            Wallet Balance
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
              onMaxClick && onMaxClick(getMaxSupply());
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
        {vm.isDollar ? (
          <TokenToDollar onClick={() => setInputAmountMeasure(false)}>
            <Text size="small" type="secondary" fitContent>
              ~{token?.symbol}{" "}
              {token?.prices?.min &&
                amount &&
                vm
                  .formatVal(amount.div(token?.prices?.min), token?.decimals)
                  .toFormat(4)}
            </Text>
            <Swap className="swap" />
          </TokenToDollar>
        ) : (
          <TokenToDollar onClick={() => setInputAmountMeasure(true)}>
            <Text size="small" type="secondary" fitContent>
              ~$
              {token?.prices?.min && amount
                ? vm
                    .formatVal(amount, token?.decimals)
                    .times(token?.prices?.min)
                    .toFormat(4)
                : 0}
            </Text>
            <Swap className="swap" />
          </TokenToDollar>
        )}
      </ModalInputContainer>
      <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Text
          size="medium"
          type={vm.getDailyIncome.gt(0) ? "success" : "secondary"}
          fitContent
        >
          Daily Income
        </Text>
        <Text
          size="medium"
          type={vm.getDailyIncome.gt(0) ? "success" : "primary"}
          fitContent
        >
          $ {token?.interest ? vm.getDailyIncome.toFormat(6) : 0}
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
          {+vm.formatVal(token?.selfBorrow, token?.decimals) || 0}
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
