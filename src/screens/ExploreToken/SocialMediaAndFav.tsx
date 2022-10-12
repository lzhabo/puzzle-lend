import styled from "@emotion/styled";
import React from "react";
import { Row } from "@components/Flex";
import IconButtonAdaptive from "@screens/ExploreToken/IconButtonAdaptive";
import { ReactComponent as SwapIcon } from "@src/assets/icons/swapTransaction.svg";
import { ReactComponent as InfoIcon } from "@src/assets/icons/information.svg";
import { observer } from "mobx-react-lite";
import { Anchor } from "@components/Anchor";
import { useExploreTokenVM } from "@screens/ExploreToken/ExploreTokenVm";

interface IProps {}

const ButtonWrapper = styled(Row)`
  & > :first-of-type {
    margin-right: 16px;
  }

  @media (min-width: 880px) {
    & > :first-of-type {
      margin-right: 8px;
    }
  }
`;

const SocialMediaAndFav: React.FC<IProps> = () => {
  const vm = useExploreTokenVM();
  return (
    <ButtonWrapper mainAxisSize="fit-content">
      <Anchor href={`https://puzzleswap.org/trade?asset1=${vm.asset.assetId}`}>
        <IconButtonAdaptive icon={<SwapIcon />}>
          Trade on Puzzle Swap
        </IconButtonAdaptive>
      </Anchor>
      <Anchor href={`https://puzzleswap.org/explore/token/${vm.asset.assetId}`}>
        <IconButtonAdaptive icon={<InfoIcon />}>More info</IconButtonAdaptive>
      </Anchor>
    </ButtonWrapper>
  );
};
export default observer(SocialMediaAndFav);
