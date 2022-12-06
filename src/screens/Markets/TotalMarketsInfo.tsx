import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react-lite";
import Text from "@components/Text";
import Card from "@components/Card";
import totalBorrowed from "@src/assets/icons/totalBorrowed.svg";
import totalSupplied from "@src/assets/icons/totalSupplied.svg";
import { useStores } from "@stores";
import Skeleton from "react-loading-skeleton";
import { Column } from "@src/components/Flex";
import SizedBox from "@components/SizedBox";

interface IProps {}

const Root = styled.div`
  display: grid;
  row-gap: 8px;
  @media (min-width: 880px) {
    grid-template-columns: 1fr 1fr;
    flex-direction: row;
    column-gap: 24px;
  }
`;
const TotalMarketsInfo: React.FC<IProps> = () => {
  const { marketsStore } = useStores();
  const data = [
    {
      title: "Total supplied",
      value: marketsStore.marketsStatistic.totalSupplied,
      icon: totalSupplied
    },
    {
      title: "Total borrowed",
      value: marketsStore.marketsStatistic.totalBorrowed,
      icon: totalBorrowed
    }
  ];
  return (
    <Root>
      {data.map(({ title, value, icon }, index) => (
        <Card
          flexDirection="row"
          justifyContent="space-between"
          key={"total-card-" + index}
        >
          <Column justifyContent="center" alignItems="center">
            <Text size="big" type="secondary">
              {title}
            </Text>
            <SizedBox height={4} />
            {value == null ? (
              <Skeleton height={32} width={150} />
            ) : (
              <Text size="newBig" weight={500}>
                $ {value.toFormat()}
              </Text>
            )}
          </Column>
          <img src={icon} alt="icon" />
        </Card>
      ))}
    </Root>
  );
};

export default observer(TotalMarketsInfo);
