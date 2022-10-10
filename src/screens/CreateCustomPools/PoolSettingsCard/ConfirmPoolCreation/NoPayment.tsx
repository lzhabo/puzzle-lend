import styled from "@emotion/styled";
import React from "react";
import Button from "@components/Button";
import Text from "@components/Text";
import { Column } from "@components/Flex";
import { useCreateCustomPoolsVM } from "@screens/CreateCustomPools/CreateCustomPoolsVm";
import { observer } from "mobx-react-lite";
import Loading from "@src/components/Loading";
import { useStores } from "@stores";

interface IProps {}

const Root = styled.div`
  display: grid;
  align-items: center;

  @media (min-width: 880px) {
    grid-template-columns: 2fr 1fr;
  }
`;
const NoPayment: React.FC<IProps> = () => {
  const { nftStore } = useStores();
  const vm = useCreateCustomPoolsVM();
  return (
    <Root>
      <Column alignItems="center" style={{ marginBottom: 16 }}>
        <Text weight={500}>You don’t have any NFT</Text>
        <Text type="secondary">Buy a random NFT to create the pool</Text>
      </Column>
      <Button
        fixed
        size="medium"
        onClick={vm.buyRandomArtefact}
        disabled={!vm.canBuyNft || vm.loading}
      >
        {nftStore.totalPuzzleNftsAmount == null || vm.loading ? (
          <Loading big />
        ) : (
          `Buy for ${vm.puzzleNFTPrice} PUZZLE`
        )}
      </Button>
    </Root>
  );
};
export default observer(NoPayment);
