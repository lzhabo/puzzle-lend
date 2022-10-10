import styled from "@emotion/styled";
import React, { useState } from "react";
import { Row } from "@components/Flex";
import IconButtonAdaptive from "@screens/ExploreToken/IconButtonAdaptive";
import { ReactComponent as StarIcon } from "@src/assets/icons/star.svg";
import { ReactComponent as StarredIcon } from "@src/assets/icons/filled-star.svg";
import { ReactComponent as ShareIcon } from "@src/assets/icons/share.svg";
import { useExploreTokenVM } from "@screens/ExploreToken/ExploreTokenVm";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import ShareDialog from "@screens/ExploreToken/dialogs/ShareDialog";

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
  const { assetId } = vm.asset;
  const { tokenStore, notificationStore } = useStores();
  const tokenStatus = tokenStore.watchList.includes(assetId);
  const [visibleModal, setVisibleModal] = useState(false);
  const handleWatchListChange = () => {
    const watchListText =
      'Keep track of your favorite coins by turning on the "Watchlist" filter above the table';
    if (tokenStatus) {
      tokenStore.removeFromWatchList(assetId);
      notificationStore.notify(watchListText, {
        type: "info",
        title: `${TOKENS_BY_ASSET_ID[assetId].symbol} has been removed to the watchlist`,
      });
    } else {
      tokenStore.addToWatchList(assetId);
      notificationStore.notify(watchListText, {
        type: "success",
        title: `${TOKENS_BY_ASSET_ID[assetId].symbol} has been added to the watchlist`,
      });
    }
  };

  return (
    <ButtonWrapper mainAxisSize="fit-content">
      <IconButtonAdaptive
        icon={tokenStatus ? <StarredIcon /> : <StarIcon />}
        onClick={handleWatchListChange}
      >
        {tokenStatus ? " Added to watchlist" : " Add to watchlist"}
      </IconButtonAdaptive>
      <IconButtonAdaptive
        icon={<ShareIcon />}
        onClick={() => setVisibleModal(true)}
      >
        Share
      </IconButtonAdaptive>
      <ShareDialog
        visible={visibleModal}
        onClose={() => setVisibleModal(false)}
      />
    </ButtonWrapper>
  );
};
export default observer(SocialMediaAndFav);
