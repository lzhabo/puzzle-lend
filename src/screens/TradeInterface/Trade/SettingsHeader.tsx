import styled from "@emotion/styled";
import React from "react";
import { Row } from "@src/components/Flex";
import chart from "@src/assets/icons/chart.svg";
import nochart from "@src/assets/icons/no-chart.svg";
import settings from "@src/assets/icons/settings.svg";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react-lite";
import Tabs from "@components/Tabs";
import { useSwapVM } from "@screens/TradeInterface/SwapVM";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@src/constants";

interface IProps {
  withSetting?: boolean;
}

const Root = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: relative;
  padding-bottom: 16px;
  margin-bottom: 16px;
  @media (min-width: 880px) {
    margin-bottom: 24px;
  }
`;
const Icon = styled.img`
  cursor: pointer;
`;

const IconsBlock = styled(Row)`
  position: absolute;
  right: 0;
`;
const SettingsHeader: React.FC<IProps> = ({ withSetting }) => {
  const vm = useSwapVM();
  const navigate = useNavigate();
  return (
    <Root>
      <Tabs
        tabs={[{ name: "Swap" }, { name: "Limit" }]}
        activeTab={vm.activeAction}
        setActive={(n) => {
          const urlSearchParams = new URLSearchParams(window.location.search);
          urlSearchParams.set("asset0", vm.assetId0);
          urlSearchParams.set("asset01", vm.assetId1);
          navigate({
            pathname: n === 0 ? ROUTES.TRADE : ROUTES.LIMIT_ORDER,
            search: `?${urlSearchParams.toString()}`,
          });
          vm.setActiveAction(n);
        }}
      />
      <IconsBlock mainAxisSize="fit-content">
        {withSetting != null && (
          <Icon
            src={settings}
            alt="pic"
            onClick={() => vm.setOpenedSettings(!vm.openedSettings)}
          />
        )}
        <SizedBox width={8} />
        <Icon
          src={vm.openedChart ? chart : nochart}
          alt="pic"
          onClick={() => vm.setOpenedChart(!vm.openedChart)}
        />
      </IconsBlock>
    </Root>
  );
};
export default observer(SettingsHeader);
