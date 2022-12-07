import styled from "@emotion/styled";
import React from "react";
import tokenLogos from "@src/constants/tokenLogos";
import { TOKENS_BY_ASSET_ID } from "@src/constants";

interface IProps {
  assets: string[];
}

const Root = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
`;
const Img = styled.img`
  position: absolute;
  width: 24px;
  height: 24px;

  border-radius: 50px;
  background-color: ${({ theme }) => theme.colors.primary650};
`;
const AssetsPic: React.FC<IProps> = ({ assets }) => {
  return (
    <Root>
      {assets.map((v, index) => (
        <Img
          src={tokenLogos[TOKENS_BY_ASSET_ID[v].symbol]}
          style={{ right: (index + 1) * 16, zIndex: +index }}
          key={v}
          alt="token-logo"
        />
      ))}
    </Root>
  );
};
export default AssetsPic;
