import styled from "@emotion/styled";
import React from "react";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react-lite";
import Card from "@components/Card";
import SquareTokenIcon from "@components/SquareTokenIcon";
import tokenLogos from "@src/constants/tokenLogos";
import BN from "@src/utils/BN";
import {
  useAnalyticsScreenVM,
  ITStatisticItem
} from "@screens/AnalyticsScreen/AnalyticsScreenVM";
import Skeleton from "react-loading-skeleton";

interface IProps {}

const Title = styled(Text)`
  font-size: 24px;
  line-height: 32px;
`;

const TotalVal = styled(Card)`
  margin: 32px 0 0 40px;
  max-width: 427px;
  @media (max-width: 1440px) {
    margin: 32px 0 0 0;
    max-width: 100%;
    width: 100%;
  }
`;

const Table = styled.table`
  > div:last-child {
      border-bottom: none !important;
    }
  }
`;

const TableRow = styled(Row)`
  padding: 8px 0 8px 0;
  border-bottom: 1px solid ${({ theme }) => `${theme.colors.primary100}`};
`;

const AnalyticsTotalData: React.FC<IProps> = () => {
  const vm = useAnalyticsScreenVM();

  const totalData = vm.popularOf("supply");

  return (
    <TotalVal>
      <Title>
        Total value
        <SizedBox height={24} />
      </Title>
      {totalData[0] ? (
        <Table>
          {totalData.map((s: ITStatisticItem) => (
            <TableRow alignItems="center" justifyContent="space-between">
              <Row>
                <SquareTokenIcon
                  size="small"
                  src={tokenLogos[s.asset.symbol]}
                  alt="logo"
                />
                <SizedBox width={16} />
                <Column>
                  <Text size="small" fitContent>
                    {s.asset.symbol}
                  </Text>
                  <Text type="secondary" size="small" fitContent>
                    $ {vm.priceForToken(s).toNumber()}
                  </Text>
                </Column>
              </Row>
              <Row justifyContent="flex-end">
                <Column>
                  <Text textAlign="end" size="small">
                    {`${new BN(s.amountTotal)
                      .div(vm.priceForToken(s))
                      .toFixed(2)} ${s.asset.symbol}`}
                  </Text>
                  <Text textAlign="end" type="secondary" size="small">
                    $ {s.amountTotal.toFixed(2)}
                  </Text>
                </Column>
              </Row>
            </TableRow>
          ))}
        </Table>
      ) : (
        <Skeleton height={56} style={{ marginBottom: 8 }} count={4} />
      )}
    </TotalVal>
  );
};

export default observer(AnalyticsTotalData);
