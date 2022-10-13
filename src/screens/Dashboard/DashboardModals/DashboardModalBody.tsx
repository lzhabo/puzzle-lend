import styled from '@emotion/styled';
import React from 'react';
import { Column } from '@src/components/Flex';
import { observer } from 'mobx-react-lite';

type UrlParamsTypes = {
  tokenId?: string;
  operationName?: string;
  modalPoolId?: string;
};

interface IProps {
  urlParams: UrlParamsTypes;
  operationName: string;
}

const Root = styled(Column)`
  width: 100%;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.white};

  & > * {
    width: 100%;
  }
`;

const WalletModalBody: React.FC<IProps> = () => {
  return (
    <Root>
      <>Test</>
    </Root>
  );
};
export default observer(WalletModalBody);
