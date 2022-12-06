import styled from "@emotion/styled";
import React from "react";
import tokenLogos from "@src/constants/tokenLogos";

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
`;
const AssetsPic: React.FC<IProps> = ({ assets }) => {
  console.log(assets);
  return (
    <Root>
      {assets.map((v, index) => (
        <Img
          src={tokenLogos[v]}
          style={{ right: index * 16, zIndex: -index }}
        />
      ))}
    </Root>
  );
};
export default AssetsPic;
