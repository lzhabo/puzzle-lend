import styled from "@emotion/styled";
import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { useBoostApyVm } from "@screens/BoostApy/BoostApyVm";
import Card from "@components/Card";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Input from "@components/Input";
import Divider from "@src/components/Divider";
import TokenInput from "@components/TokenInput";

interface IProps {}

const Root = styled(Card)`
  display: flex;
  flex-direction: column;
`;

const CalcBoostingAmountCard: React.FC<IProps> = () => {
  const vm = useBoostApyVm();
  const handleChangeDays = (e: any) => {
    vm.setDays(+e.target.value);
    checkDays();
  };
  const [domainError, setDomainError] = useState<string | null>(null);
  const checkDays = () => {
    if (vm.days < 1 || vm.days > 365)
      setDomainError("Should be from 1 to 365 days");
    else setDomainError(null);
  };
  return (
    <Root>
      <Text type="secondary">Boosting period</Text>
      <SizedBox height={4} />
      <Input
        type="number"
        value={vm.days?.toString()}
        onChange={handleChangeDays}
        placeholder="Enter the amount…"
        description="Should be from 1 to 365 days"
        suffixCondition={true}
        errorText={domainError ?? ""}
        onBlur={() => checkDays()}
        onFocus={() => setDomainError(null)}
        error={domainError != null}
        suffix={
          <Text type="secondary" fitContent>
            DAYS
          </Text>
        }
      />
      <SizedBox height={24} />
      <Divider />
      <SizedBox height={24} />
      <TokenInput
        selectable={true}
        decimals={vm.token?.decimals ?? 6}
        amount={vm.amount}
        setAmount={vm.setAmount}
        assetId={vm.assetId}
        setAssetId={(v) => vm.setAssetId(v)}
        balances={vm.balances ?? []}
        onMaxClick={vm.amountMaxClickFunc}
        usdnEquivalent={vm.usdnEquivalent}
      />
    </Root>
  );
};
export default observer(CalcBoostingAmountCard);
