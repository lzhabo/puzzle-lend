import styled from "@emotion/styled";
import { Column, Row } from "@src/components/Flex";
import React from "react";
import Text from "@components/Text";
import Tooltip from "@components/Tooltip";
import SizedBox from "@components/SizedBox";
import CircularProgressbar from "@components/CircularProgressbar";

interface IProps {}

const Root = styled.div`
  align-items: center;
  padding: 16px;

  background: ${({ theme }) => `${theme.colors.white}`};

  border: 1px solid ${({ theme }) => `${theme.colors.primary100}`};
  border-radius: 16px;
`;
const Title = styled(Text)`
  border-bottom: 1px dashed ${({ theme }) => `${theme.colors.primary650}`};
`;
const AccountHealth: React.FC<IProps> = () => {
  const data = [
    {
      title: "Supply balance",
      value: "$18,7K",
      description: "USD value of your deposits in total",
    },
    {
      title: "Borrow balance",
      value: "$3,4K",
      description: "USD value of your borrows in total",
    },
    {
      title: "NET APY",
      value: "48%",
      description:
        "Your annual net profit(expenses) relative to your deposits(loans) USD value.",
    },
  ];
  return (
    <Root>
      <Row>
        <Text weight={500} type="secondary">
          Account
        </Text>
        <CircularProgressbar percent={100} />
      </Row>
      <SizedBox height={10} />
      <Column crossAxisSize="max">
        {data.map(({ title, value, description }) => (
          <Row justifyContent="space-between" style={{ marginBottom: 14 }}>
            <Tooltip content={<Text>{description}</Text>}>
              <Title fitContent type="secondary">
                {title}
              </Title>
            </Tooltip>
            <Text fitContent>{value}</Text>
          </Row>
        ))}
      </Column>
    </Root>
  );
};
export default AccountHealth;
