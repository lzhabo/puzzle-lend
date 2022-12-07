import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStores } from "@src/stores";
import { observer } from "mobx-react-lite";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import Button from "@components/Button";
import { Column, Row } from "@components/Flex";
import { TMarketStats } from "@src/entities/Market";
import BN from "@src/utils/BN";
import _ from "lodash";
import SquareTokenIcon from "@components/SquareTokenIcon";
import tokenLogos from "@src/constants/tokenLogos";
import { useMarketModalVM } from "@screens/Market/MarketModals/MarketModalVM";
import BackIcon from "@screens/Market/MarketModals/components/BackIcon";
import ModalTokenInput from "@screens/Market/MarketModals/components/ModalTokenInput";
import { Footer, Root } from "./components/ModalContent";

interface IProps {
  token: TMarketStats;
  marketId: string;
  modalAmount: BN;
  onClose: () => void;
  modalSetAmount: (amount: BN) => void;
  onMaxClick: (amount: BN) => void;
  onSubmit: (
    amount: BN,
    assetId: string,
    contractAddress: string
  ) => Promise<boolean>;
}

const BorrowAssets: React.FC<IProps> = ({
  token,
  modalAmount,
  marketId,
  modalSetAmount,
  onMaxClick,
  onSubmit,
  onClose
}) => {
  const navigate = useNavigate();
  const vm = useMarketModalVM();
  const [focused, setFocused] = useState(false);
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
    vm.repayChangeAmount(v);
    handleDebounce(v);
  };

  const getMax = () => {
    const val = vm.countMaxBtn;
    // handleDebounce(val);
    handleDebounce(BN.ZERO);

    return val;
  };

  const submitForm = async () => {
    const amountVal = vm.modalFormattedVal;
    const isSuccess = await onSubmit(
      amountVal.toDecimalPlaces(0, 2),
      token?.assetId,
      marketId
    );

    if (isSuccess) onClose();
  };

  const setInputAmountMeasure = (isCurrentNative: boolean) => {
    handleDebounce(vm.onNativeChange);
    vm.setVMisDollar(isCurrentNative);
  };

  return (
    <Root>
      <Row>
        {/*fixme*/}
        <Row
          alignItems="center"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          {token?.symbol && (
            <SquareTokenIcon size="small" src={tokenLogos[token?.symbol]} />
          )}
          <SizedBox width={8} />
          <Column>
            <Text size="medium">{token?.symbol}</Text>
            <Text size="small" type="secondary">
              {token?.name}
            </Text>
          </Column>
        </Row>
        <Column alignItems="flex-end">
          <Row alignItems="center">
            <Text size="medium" fitContent style={{ cursor: "pointer" }}>
              {vm.countUserBalance ?? 0}
              &nbsp;
              {vm.currentSymbol}
            </Text>
            <BackIcon />
            <Text size="medium" type="secondary" fitContent>
              {amount.gt(0)
                ? BN.formatUnits(
                    vm.staticTokenAmount.minus(amount),
                    token?.decimals
                  ).toFormat(4) ?? 0
                : 0}
            </Text>
          </Row>
          <Text textAlign="right" nowrap size="medium" type="secondary">
            Wallet Balance
          </Text>
        </Column>
      </Row>
      <SizedBox height={16} />
      <ModalTokenInput
        token={token}
        isDollar={vm.isDollar}
        focused={focused}
        amount={amount}
        error={vm.modalBtnErrorText}
        setFocused={() => setFocused(true)}
        // onMaxClick={() => onMaxClick(getMax())}
        onMaxClick={() => console.log("onMaxClick")}
        handleChangeAmount={handleChangeAmount}
        setInputAmountMeasure={setInputAmountMeasure}
      />
      <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Borrow APY
        </Text>
        <Text size="medium" fitContent>
          {token?.borrowAPY.toFormat(2) ?? 0}%
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Borrowed
        </Text>
        <Text size="medium" fitContent>
          {token?.selfBorrow
            ? BN.formatUnits(token?.selfBorrow, token?.decimals).toFormat(4)
            : 0}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Wallet Balance
        </Text>
        <Text size="medium" fitContent>
          {BN.formatUnits(
            vm.tokenBalance.minus(amount),
            token?.decimals
          ).toFormat(2)}
          &nbsp;
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
            disabled={
              amount.eq(0) ||
              vm.modalBtnErrorText !== "" ||
              token?.selfBorrow.eq(0)
            }
            fixed
            onClick={() => submitForm()}
            size="large"
          >
            {vm.modalBtnErrorText !== "" ? vm.modalBtnErrorText : "Repay"}
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
