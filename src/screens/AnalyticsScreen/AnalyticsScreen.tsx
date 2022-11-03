import styled from "@emotion/styled";
import React from "react";
import { AnalyticsScreenVMProvider } from "@screens/AnalyticsScreen/AnalyticsScreenVM";
import { Link } from "react-router-dom";
import { ROUTES } from "@src/constants";
import Layout from "@components/Layout";
import ExploreLayout from "@screens/ExploreToken/ExploreLayout";
import { Row } from "@components/Flex";
import { ReactComponent as ArrowBackIcon } from "@src/assets/icons/backArrow.svg";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import AnalyticsTotalData from "@screens/AnalyticsScreen/AnalyticsTotalData";
import AnalyticsScreenTable from "@screens/AnalyticsScreen/AnalyticsScreenTable";
import AnalyticsScreenBaseInfo from "@screens/AnalyticsScreen/AnalyticsScreenBaseInfo";

interface IProps {}

const Title = styled(Text)`
  font-size: 24px;
  line-height: 32px;
`;

const TableContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  @media (max-width: 1440px) {
    flex-direction: column-reverse;
    justify-content: center;
    align-items: center;
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
        <SizedBox height={16} />
        <AnalyticsScreenBaseInfo />
        <SizedBox height={24} />
        <TableContainer>
          <AnalyticsScreenTable />
          <AnalyticsTotalData />
        </TableContainer>
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
