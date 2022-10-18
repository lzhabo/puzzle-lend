import styled from "@emotion/styled";
import React from "react";
import { AnalyticsScreenVMProvider } from "@screens/AnalyticsScreen/AnalyticsScreenVM";
import { Link, Navigate, useParams } from "react-router-dom";
import { POOLS, ROUTES } from "@src/constants";
import Layout from "@components/Layout";
import ExploreLayout from "@screens/ExploreToken/ExploreLayout";
import { Column, Row } from "@components/Flex";
import { ReactComponent as ArrowBackIcon } from "@src/assets/icons/backArrow.svg";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import AnalyticsScreenTable from "@screens/AnalyticsScreen/AnalyticsScreenTable";
import AnalyticsScreenBaseInfo from "@screens/AnalyticsScreen/AnalyticsScreenBaseInfo";

interface IProps {}

const Title = styled(Text)`
  @media (min-width: 880px) {
    font-size: 24px;
    line-height: 32px;
  }
`;

const AnalyticsScreenImpl: React.FC<IProps> = observer(() => {
  const { lendStore } = useStores();

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
        <Title weight={500}>Users list</Title>
        {/*<SizedBox height={16} />*/}
        {/*<AnalyticsScreenBaseInfo />*/}
        <SizedBox height={24} />
        <AnalyticsScreenTable />
      </ExploreLayout>
    </Layout>
  );
});

const AnalyticsScreen = () => (
  <AnalyticsScreenVMProvider>
    <AnalyticsScreenImpl />
  </AnalyticsScreenVMProvider>
);

export default AnalyticsScreen;
