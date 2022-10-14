import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import { observer } from "mobx-react-lite";
import Button from "@components/Button";
import { Column, Row } from "@components/Flex";
import SquareTokenIcon from "@components/SquareTokenIcon";

interface IProps {
  title: string;
  poolName?: string;
  poolLogo?: string;
  apy?: string;
  onChangePool?: () => void;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  .cardTitle {
    white-space: nowrap;
    width: fit-content;
    font-size: 14px;
    line-height: 20px;
    @media (min-width: calc(560px + 32px)) {
      font-size: 16px;
      line-height: 24px;
    }
  }

  .cardSubTitle {
    white-space: nowrap;
    width: fit-content;
    font-size: 12px;
    line-height: 16px;
    @media (min-width: calc(560px + 32px)) {
      font-size: 14px;
      line-height: 20px;
    }

    b {
      color: #363870;
      font-weight: normal;
    }
  }
`;
const DepositToPool: React.FC<IProps> = ({
  title,
  poolName,
  poolLogo,
  apy,
  onChangePool
}) => {
  return (
    <Root>
      <Text weight={500} type="secondary">
        {title}
      </Text>
      <SizedBox height={8} />
      <Card
        paddingMobile="16px"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Row style={{ alignItems: "center" }}>
          <SquareTokenIcon src={poolLogo} alt="logo" />
          <SizedBox width={8} />
          <Column style={{ height: "100%" }}>
            <Text className="cardTitle" weight={500}>
              {poolName}
            </Text>
            <Text className="cardSubTitle" type="secondary">
              {apy ? (
                <span>
                  APY <b>{apy}</b>
                </span>
              ) : (
                "-"
              )}
            </Text>
          </Column>
        </Row>
        <Button
          kind="secondary"
          size="medium"
          onClick={() => {
            onChangePool && onChangePool();
          }}
          style={{ whiteSpace: "nowrap" }}
        >
          Change pool
        </Button>
      </Card>
    </Root>
  );
};
export default observer(DepositToPool);
