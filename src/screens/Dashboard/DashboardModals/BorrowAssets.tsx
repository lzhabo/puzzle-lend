import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useStores } from "@src/stores";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import Button from "@components/Button";
import { Column, Row } from "@components/Flex";
import { TPoolStats } from "@src/stores/LendStore";
import { DashboardUseVM } from "@screens/Dashboard/DashboardModals/DashboardModalVM";
import { ROUTES } from "@src/constants";
import BN from "@src/utils/BN";
import _ from "lodash";

import SquareTokenIcon from "@components/SquareTokenIcon";
import tokenLogos from "@src/constants/tokenLogos";
import {
  Footer,
  Root
} from "@src/screens/Dashboard/DashboardModals/components/ModalContent";
import Warning from "@src/screens/Dashboard/DashboardModals/components/Warning";
import BackIcon from "@src/screens/Dashboard/DashboardModals/components/BackIcon";
import ModalTokenInput from "@src/screens/Dashboard/DashboardModals/components/ModalTokenInput";

interface IProps {
  token: TPoolStats;
  poolId: string;
  modalAmount: BN;
  userHealth: BN;
  onClose: () => void;
  modalSetAmount: (amount: BN) => void;
  onMaxClick: (amount: BN) => void;
  //fixme
  onSubmit: (
    amount: BN,
    assetId: string,
    contractAddress: string
  ) => Promise<boolean>;
}

const BorrowAssets: React.FC<IProps> = ({
  token,
  modalAmount,
  userHealth,
  poolId,
  modalSetAmount,
  onMaxClick,
  onSubmit,
  onClose
}) => {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
  const [amount, setAmount] = useState<BN>(modalAmount);
  const { accountStore, lendStore } = useStores();
  const vm = DashboardUseVM();

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

  const submitForm = async () => {
    let amountVal = modalAmount;

    if (vm.isDollar) amountVal = amountVal.div(token?.prices?.min);

    const isSuccess = await onSubmit(
      amountVal.toSignificant(0),
      token?.assetId,
      poolId
    );

    if (isSuccess) onClose();
  };

  const handleChangeAmount = (v: BN) => {
    vm.borrowChangeAmount(v);
    handleDebounce(v);
  };

  const setInputAmountMeasure = (isCurrentNative: boolean) => {
    handleDebounce(vm.onNativeChange);
    vm.setVMisDollar(isCurrentNative);
  };

  return (
    <Root>
      <Row>
        <Row
          alignItems="center"
          onClick={() =>
            navigate(
              ROUTES.DASHBOARD_TOKEN_DETAILS.replace(
                ":poolId",
                lendStore.pool.address
              ).replace(":assetId", token?.assetId)
            )
          }
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
        <Column alignItems="flex-end" justifyContent="flex-end">
          <Row alignItems="center">
            <Text size="medium" fitContent>
              {vm.countUserBalance ?? 0}
              &nbsp;
              {vm.currentSymbol}
            </Text>
            <BackIcon />
            <Text size="medium" type="secondary" fitContent>
              {amount.gt(0)
                ? BN.formatUnits(
                    amount.plus(vm.staticTokenAmount),
                    token?.decimals
                  ).toFormat(4) ?? 0
                : 0}
            </Text>
          </Row>
          <Text size="medium" type="secondary" nowrap textAlign="right">
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
        onMaxClick={() => onMaxClick(vm.userMaximumToBorrowBN())}
        handleChangeAmount={handleChangeAmount}
        setInputAmountMeasure={setInputAmountMeasure}
      />
      <SizedBox height={24} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          {token?.symbol} liquidity
        </Text>
        <Text size="medium" fitContent>
          {vm.poolTotalReservesInToken.toFormat(2)} {token?.symbol}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Borrow APY
        </Text>
        <Text size="medium" fitContent>
          {token?.borrowAPY ? token?.borrowAPY.toFormat(2) : 0} %
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Borrowed
        </Text>
        <Text size="medium" fitContent>
          {token?.selfBorrow
            ? BN.formatUnits(token?.selfBorrow, token?.decimals).toFormat(2)
            : 0}{" "}
          {token?.symbol}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row justifyContent="space-between">
        <Text size="medium" type="secondary" fitContent>
          Max possible to Borrow
        </Text>
        <Text size="medium" fitContent>
          {vm.staticMaximum.toFormat(2) ?? 0}
          <>&nbsp;</>
          {vm.currentSymbol}
        </Text>
      </Row>
      <SizedBox height={14} />
      <Row alignItems="center" justifyContent="space-between">
        <Text size="medium" type="secondary" nowrap>
          Account Health
        </Text>
        <Row alignItems="center" justifyContent="flex-end">
          <Text size="medium" type="success" fitContent>
            {userHealth.toFormat(2) ?? 0} %
          </Text>
          {vm.accountHealth !== 100 ? (
            <>
              <BackIcon />
              <Text
                type={vm.accountHealth < +userHealth ? "error" : "success"}
                size="medium"
                fitContent
              >
                &nbsp;
                {vm.accountHealth && amount ? vm.accountHealth.toFixed(2) : 0}%
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
      <SizedBox height={24} />

      {vm.modalWarningText && (
        <>
          <Warning text={vm.modalWarningText} link={vm.borrowLink} />
          <SizedBox height={24} />
        </>
      )}

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
              disabled={amount.eq(0) || vm.modalBtnErrorText !== ""}
              fixed
              onClick={() => submitForm()}
              size="large"
            >
              {vm.modalBtnErrorText !== "" ? vm.modalBtnErrorText : "Borrow"}
            </Button>
          )
        )}
      </Footer>
    </Root>
  );
};
export default observer(BorrowAssets);
