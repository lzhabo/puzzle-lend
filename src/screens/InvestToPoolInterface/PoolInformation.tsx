import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react-lite";
import { useInvestToPoolInterfaceVM } from "@screens/InvestToPoolInterface/InvestToPoolInterfaceVM";
import Card from "@src/components/Card";
import Text from "@src/components/Text";
import SizedBox from "@components/SizedBox";
import Skeleton from "react-loading-skeleton";
import BN from "@src/utils/BN";
import { Row } from "@src/components/Flex";

interface IProps {}

const Root = styled.div`
  display: grid;
  flex-direction: column;
  padding-top: 24px;
  column-gap: 8px;
  row-gap: 8px;
  grid-template-columns: repeat(2, 1fr);
  @media (min-width: 880px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const CCard = styled(Card)`
  padding: 12px 16px;
  @media (min-width: 880px) {
    padding: 16px 24px;
  }
`;
const PoolInformation: React.FC<IProps> = () => {
  const vm = useInvestToPoolInterfaceVM();
  const data = vm.pool.statistics;
  const valuesArray = [
    {
      title: "Pool value",
      value: data?.liquidity ? "$ " + new BN(data.liquidity).toFormat(2) : null,
    },
    {
      title: "Volume (7d)",
      value: data?.weeklyVolume
        ? "$ " + new BN(data.weeklyVolume).toFormat(2)
        : null,
    },
    {
      title: "Fees (30D)",
      value: data?.fees ? "$ " + new BN(data.fees).toFormat(2) : null,
    },
    {
      title: "APY",
      value: data?.apy ? new BN(data.apy).toFormat(2) + " %" : null,
      newValue: data?.boostedApy
        ? new BN(data.boostedApy).plus(data.apy).toBigFormat(2) + " %"
        : null,
    },
  ];
  return (
    <Root>
      {valuesArray.map(({ title, value, newValue }, index) => (
        <CCard key={index}>
          <Text type="secondary" size="medium">
            {title}
          </Text>
          <SizedBox height={4} />
          {value != null ? (
            newValue != null ? (
              <Row>
                <Text
                  fitContent
                  style={{ fontSize: "20px", lineHeight: "24px" }}
                  type="error"
                  weight={500}
                >
                  {newValue}
                </Text>
                <SizedBox width={4} />
                <Text
                  fitContent
                  type="secondary"
                  style={{ textDecoration: "line-through" }}
                >
                  {value}
                </Text>
              </Row>
            ) : (
              <Text style={{ fontSize: "20px", lineHeight: "24px" }}>
                {value}
              </Text>
            )
          ) : (
            <Skeleton height={24} />
          )}
        </CCard>
      ))}
    </Root>
  );
};
export default observer(PoolInformation);
