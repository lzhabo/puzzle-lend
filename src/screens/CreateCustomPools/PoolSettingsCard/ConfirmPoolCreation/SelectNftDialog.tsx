import React from "react";
import Dialog from "@components/Dialog";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";
import styled from "@emotion/styled";
import Scrollbar from "@components/Scrollbar";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import { Column } from "@components/Flex";
import Skeleton from "react-loading-skeleton";
import {
  IPaymentsArtefact,
  useCreateCustomPoolsVM,
} from "@screens/CreateCustomPools/CreateCustomPoolsVm";
import Button from "@components/Button";
import { ReactComponent as Add } from "@src/assets/icons/add.svg";

export interface IProps extends IDialogPropTypes {
  onNftClick: (artefact: IPaymentsArtefact) => void;
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 8px;
  row-gap: 8px;
  max-width: 496px;
`;
const Wrap = styled.div`
  display: flex;
  background: #f1f2fe;
  border-radius: 12px;
  cursor: pointer;
`;
const NFTPic = styled.div<{ image: string }>`
  ${({ image }) =>
    image != null
      ? `background-image: url(${image});`
      : `background: #C6C9F4;`};
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  width: 152px;
  height: 152px;
  position: relative;
`;
const Tag = styled.div`
  padding: 4px 8px;
  background: #363870;
  border-radius: 6px;
  color: #ffffff;
  position: absolute;
  bottom: 4px;
  left: 8px;
`;
const SelectNftDialog: React.FC<IProps> = ({
  onNftClick,
  children,
  ...rest
}) => {
  const { nftStore } = useStores();
  // const { accountNFTs } = nftStore;
  const vm = useCreateCustomPoolsVM();
  const handleBuyMore = async () => {
    rest.onClose && rest.onClose({} as any);
    await vm.buyRandomArtefact();
  };
  return (
    <Dialog {...rest} style={{ maxWidth: 362 }}>
      <Scrollbar>
        <Column crossAxisSize="max" style={{ maxHeight: 360 }}>
          <Grid>
            {nftStore.nftForPoolCreation == null &&
              Array.from({ length: 2 }).map((_, index) => (
                <Skeleton
                  style={{ borderRadius: 8 }}
                  height={152}
                  width={152}
                  key={index + "skeleton-row"}
                />
              ))}
            {nftStore.nftForPoolCreation &&
              nftStore.nftForPoolCreation
                ?.filter(({ old }) => !old)
                .map(({ imageLink, name, assetId }, index) => (
                  <Wrap
                    key={index + "nft"}
                    onClick={() => {
                      onNftClick({
                        name: name ?? "",
                        assetId: assetId ?? "",
                        picture: imageLink,
                      });
                      rest.onClose && rest.onClose({} as any);
                    }}
                  >
                    <NFTPic image={imageLink ?? ""}>
                      <Tag>{name}</Tag>
                    </NFTPic>
                  </Wrap>
                ))}
          </Grid>
          <SizedBox height={16} />
          {nftStore.nftForPoolCreation?.length === 1 && (
            <Button
              fixed
              kind="secondary"
              size="medium"
              onClick={handleBuyMore}
            >
              Buy more
              <SizedBox width={12} />
              <Add />
            </Button>
          )}
        </Column>
      </Scrollbar>
      <SizedBox height={24} />
    </Dialog>
  );
};
export default observer(SelectNftDialog);
