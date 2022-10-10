import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import { Column, Row } from "@components/Flex";
import SquareTokenIcon from "@components/SquareTokenIcon";
import { useCreateCustomPoolsVM } from "@screens/CreateCustomPools/CreateCustomPoolsVm";
import { useTheme } from "@emotion/react";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;
const Tokens = styled.div`
  display: flex;
  max-width: 100%;
  flex-wrap: wrap;

  & > * {
    margin: 4px;
    margin-left: 0px;
  }
`;

const Tag = styled.div`
  background: ${({ theme }) => theme.colors.primary100};
  border-radius: 6px;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colors.primary800};
  padding: 4px 8px;
`;
const ShortCreationPoolInfo: React.FC<IProps> = () => {
  const vm = useCreateCustomPoolsVM();
  const theme = useTheme();
  return (
    <Root>
      <Text type="secondary" weight={500}>
        Your pool information
      </Text>
      <SizedBox height={8} />
      <Card style={{ width: "100%" }}>
        <Row>
          <SquareTokenIcon src={vm.logo ?? ""} />
          <SizedBox width={8} />
          <Column>
            <Text weight={500}>{vm.title}</Text>
            <Text type="secondary">
              Swap fees: {vm.swapFee.div(10).toString()}%
            </Text>
          </Column>
        </Row>
        <SizedBox height={16} />
        <Tokens>
          {vm.poolsAssets.map((token, index) => (
            <Tag key={index + "custom-fee"}>
              <span>{token.asset.symbol}&nbsp;</span>
              <span style={{ color: theme.colors.primary650 }}>
                {token.share.div(10).toFormat()}%
              </span>
            </Tag>
          ))}
        </Tokens>
      </Card>
    </Root>
  );
};
export default observer(ShortCreationPoolInfo);
