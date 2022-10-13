import React, { HTMLAttributes } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStores } from '@stores';
import Skeleton from 'react-loading-skeleton';

type IProps = HTMLAttributes<HTMLDivElement>;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 400px;
`;

const Supply: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  if (accountStore.assetBalances === null)
    return (
      <Root style={{ padding: '0 24px' }}>
        <Skeleton height={56} style={{ marginBottom: 8 }} count={4} />
      </Root>
    );
  //todo
  return <Root>Supply</Root>;
};
export default observer(Supply);
