import styled from '@emotion/styled';
import React from 'react';
import useWindowSize from '@src/hooks/useWindowSize';
import MobileAccountSupplyAndBorrow from './MobileAccountSupplyAndBorrow';
import DesktopAccountSupplyAndBorrow from './DesktopAccountSupplyAndBorrow';

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const AccountSupplyAndBorrow: React.FC<IProps> = () => {
  const { width } = useWindowSize();
  return (
    <Root>
      {width && width >= 768 ? (
        <DesktopAccountSupplyAndBorrow />
      ) : (
        <MobileAccountSupplyAndBorrow />
      )}
    </Root>
  );
};
export default AccountSupplyAndBorrow;
