import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import SquareTokenIcon from "@components/SquareTokenIcon";
import { Column, Row } from "@components/Flex";
import { useCreateCustomPoolsVM } from "@screens/CreateCustomPools/CreateCustomPoolsVm";
import { observer } from "mobx-react-lite";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const YourPool: React.FC<IProps> = () => {
  const vm = useCreateCustomPoolsVM();
  return (
    <Root>
      <Text style={{ width: "100%" }} weight={500} type="secondary">
        Your Pool
      </Text>
      <SizedBox height={8} />
      <Card style={{ height: 100 }}>
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
      </Card>
    </Root>
  );
};
export default observer(YourPool);
