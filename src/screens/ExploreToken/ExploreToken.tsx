import React from "react";
import Layout from "@components/Layout";
import ExploreLayout from "./ExploreLayout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import {
  ExploreTokenVMProvider,
  useExploreTokenVM
} from "@screens/ExploreToken/ExploreTokenVm";
import { Link, Navigate, RouteProps, useParams } from "react-router-dom";
import { ROUTES } from "@src/constants";
import { Row } from "@components/Flex";
import { ReactComponent as ArrowBackIcon } from "@src/assets/icons/backArrow.svg";
import ExploreTokenBasicInformation from "@screens/ExploreToken/ExploreTokenBasicInformation";
import styled from "@emotion/styled";
import RoundTokenIcon from "@components/RoundTokenIcon";
import { observer } from "mobx-react-lite";
import SocialMediaAndFav from "@screens/ExploreToken/SocialMediaAndFav";
import { useTheme } from "@emotion/react";
import Spinner from "@components/Spinner";
import { useStores } from "@stores";

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

const ExploreTokenImpl: React.FC<IProps> = observer(() => {
  const { marketsStore } = useStores();
  const vm = useExploreTokenVM();
  const theme = useTheme();

  if (marketsStore.markets.length === 0) return <SpinnerComponent />;
  // else if (!vm.isAssetOk) return <Navigate to={ROUTES.ROOT} />;
  // if (vm.statistics == null) return <Navigate to={ROUTES.ROOT} />;

  return (
    <Layout>
      <ExploreLayout>
        <Link to={`/${vm.market?.contractAddress}`}>
          <Row alignItems="center">
            <ArrowBackIcon />
            <Text weight={500} type="blue500">
              Back to {vm.market?.title}
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
        <SizedBox height={24} />
        <ExploreTokenBasicInformation />
      </ExploreLayout>
    </Layout>
  );
});

const ExploreToken: React.FC<IProps & RouteProps> = observer(() => {
  const { marketsStore } = useStores();
  const { assetId, marketId } = useParams<{
    assetId: string;
    marketId: string;
  }>();
  if (marketId == null) return <Navigate to={ROUTES.NOT_FOUND} />;
  return !marketsStore.initialized ? (
    <Spinner />
  ) : (
    <ExploreTokenVMProvider assetId={assetId ?? ""} marketId={marketId}>
      <ExploreTokenImpl />
    </ExploreTokenVMProvider>
  );
});

export default ExploreToken;
