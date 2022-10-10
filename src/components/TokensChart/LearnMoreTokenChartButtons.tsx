import Card from "@components/Card";
import { Column, Row } from "@components/Flex";
import SquareTokenIcon from "@components/SquareTokenIcon";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import link from "@src/assets/icons/link.svg";
import React from "react";
import { useTokenChartVM } from "@components/TokensChart/TokenChartVM";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";

const Link = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer; ;
`;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  & > :first-of-type {
    margin-bottom: 16px;
  }
  @media (min-width: 880px) {
    flex-direction: row;
    & > :first-of-type {
      margin-bottom: 0;
      margin-right: 16px;
    }
  }
`;

const LearnMoreTokenChartButtons = () => {
  const vm = useTokenChartVM();
  const navigate = useNavigate();
  return (
    <Root>
      {[vm.asset0, vm.asset1].map((t) => (
        <Card
          key={t.assetId}
          alignItems="center"
          justifyContent="space-between"
          flexDirection="row"
        >
          <Row alignItems="center">
            <SquareTokenIcon size="small" src={t.logo} />
            <SizedBox width={12} />
            <Column>
              <Text size="medium" weight={500}>
                Learn more about {t.symbol}
              </Text>
              <Text size="small" type="secondary">
                Open in Explore
              </Text>
            </Column>
            <SizedBox width={12} />
          </Row>
          <Link
            src={link}
            alt="link"
            onClick={() => navigate(`/explore/token/${t.assetId}`)}
          />
        </Card>
      ))}
    </Root>
  );
};

export default LearnMoreTokenChartButtons;
