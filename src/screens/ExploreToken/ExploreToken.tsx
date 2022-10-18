import React from "react";
import Layout from "@components/Layout";
import ExploreLayout from "./ExploreLayout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import {
  ExploreTokenVMProvider,
  useExploreTokenVM
} from "@screens/ExploreToken/ExploreTokenVm";
import { Link, Navigate, useParams } from "react-router-dom";
import { POOLS, ROUTES } from "@src/constants";
import { Column, Row } from "@components/Flex";
import { ReactComponent as ArrowBackIcon } from "@src/assets/icons/backArrow.svg";
import ExploreTokenBasicInformation from "@screens/ExploreToken/ExploreTokenBasicInformation";
import styled from "@emotion/styled";
import RoundTokenIcon from "@components/RoundTokenIcon";
import { observer } from "mobx-react-lite";
import SocialMediaAndFav from "@screens/ExploreToken/SocialMediaAndFav";
import { useTheme } from "@emotion/react";
import { useStores } from "@stores";
import Spinner from "@components/Spinner";
import BN from "@src/utils/BN";

interface IProps {}

const TokenTitle = styled(Text)`
  @media (min-width: 880px) {
    font-size: 24px;
    line-height: 32px;
  }
`;

const SpinnerComponent = () => (
  <Layout style={{ padding: "20%", boxSizing: "border-box" }}>
    <Spinner />
  </Layout>
);

const StatsItem = styled(Column)`
  margin-right: 24px;
  margin-bottom: 8px;
  @media (min-width: 880px) {
    margin-right: 32px;
  }
  &:last-of-type {
    margin-right: 0;
  }
`;

const ExploreTokenImpl: React.FC<IProps> = observer(() => {
  const { lendStore } = useStores();
  const vm = useExploreTokenVM();
  const theme = useTheme();
  if (lendStore.poolsStats.length === 0) return <SpinnerComponent />;
  else if (!vm.isAssetOk) return <Navigate to={ROUTES.ROOT} />;
  if (vm.statistics == null) return <Navigate to={ROUTES.ROOT} />;

  const statistics = [
    {
      title: "Total supply",
      value:
        BN.formatUnits(
          vm.statistics.totalSupply,
          vm.statistics.decimals
        ).toFormat(2) + ` ${vm.statistics.symbol}`
    },
    {
      title: "Total borrow",
      value:
        BN.formatUnits(
          vm.statistics.totalBorrow,
          vm.statistics.decimals
        ).toFormat(2) + ` ${vm.statistics.symbol}`
    },
    {
      title: "Utilization ratio",
      value:
        vm.statistics.totalBorrow
          .div(vm.statistics.totalSupply)
          .times(100)
          .toFixed(2) + " %"
    },
    {
      title: "Reserves",
      value:
        BN.formatUnits(
          vm.statistics.totalSupply.minus(vm.statistics.totalBorrow),
          vm.statistics.decimals
        ).toFormat(2) + ` ${vm.statistics.symbol}`
    },
    { title: "Supply APY", value: vm.statistics.supplyAPY.toFormat(2) + " %" },
    { title: "Borrow APY", value: vm.statistics.borrowAPY.toFormat(2) + " %" }
  ];
  return (
    <Layout>
      <ExploreLayout>
        <Link to={ROUTES.ROOT}>
          <Row alignItems="center">
            <ArrowBackIcon />
            <Text weight={500} type="blue500">
              Back to {lendStore.pool.name}
            </Text>
          </Row>
        </Link>
        <SizedBox height={24} />
        <Row alignItems="center" justifyContent="space-between">
          <Row alignItems="center" mainAxisSize="fit-content">
            <RoundTokenIcon src={vm.asset.logo} alt={vm.asset.symbol} />
            <SizedBox width={8} />
            <TokenTitle weight={500}>
              {vm.asset.name}&nbsp;
              <span style={{ color: theme.colors.primary650 }}>
                {vm.asset.symbol}
              </span>
            </TokenTitle>
          </Row>
          <SocialMediaAndFav />
        </Row>
        <SizedBox height={16} />
        <Row
          alignItems="end"
          mainAxisSize="fit-content"
          style={{ flexWrap: "wrap" }}
        >
          {statistics.map((s, i) => (
            <StatsItem key={i}>
              <Text size="medium" type="secondary">
                {s.title}
              </Text>
              <Text>{s.value}</Text>
            </StatsItem>
          ))}
        </Row>
        <SizedBox height={24} />
        <ExploreTokenBasicInformation />
      </ExploreLayout>
    </Layout>
  );
});

const ExploreToken: React.FC<IProps> = () => {
  const { assetId, poolId } = useParams<{ assetId: string; poolId: string }>();
  if (assetId == null || !POOLS.some((p) => p.address === poolId)) {
    return <Navigate to={ROUTES.ROOT} />;
  }
  return (
    <ExploreTokenVMProvider assetId={assetId} poolId={poolId}>
      <ExploreTokenImpl />
    </ExploreTokenVMProvider>
  );
};

export default ExploreToken;
