import React, { HTMLAttributes } from "react";
import { observer } from "mobx-react-lite";
import styled from "@emotion/styled";
import { useStores } from "@stores";
import Skeleton from "react-loading-skeleton";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 400px;
`;

const Borrow: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  if (accountStore.assetBalances === null)
    return (
      <Root style={{ padding: "0 24px" }}>
        <Skeleton height={56} style={{ marginBottom: 8 }} count={4} />
      </Root>
    );
  //todo
  return <Root>borrow</Root>;
};
export default observer(Borrow);
