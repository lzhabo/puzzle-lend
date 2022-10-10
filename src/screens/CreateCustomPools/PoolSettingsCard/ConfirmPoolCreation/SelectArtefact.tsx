import styled from "@emotion/styled";
import React, { useState } from "react";
import SquareTokenIcon from "@components/SquareTokenIcon";
import Text from "@components/Text";
import { Column, Row } from "@src/components/Flex";
import SizedBox from "@components/SizedBox";
import { ReactComponent as Arrow } from "@src/assets/icons/arrowDown.svg";
import SelectNftDialog from "@screens/CreateCustomPools/PoolSettingsCard/ConfirmPoolCreation/SelectNftDialog";
import { observer } from "mobx-react-lite";
import { useCreateCustomPoolsVM } from "@screens/CreateCustomPools/CreateCustomPoolsVm";
import Notification from "@components/Notification";
import unknown from "@src/assets/tokens/unknown-logo.svg";
import Skeleton from "react-loading-skeleton";
import { useStores } from "@stores";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
`;

export const SelectArtefactSkeleton = () => (
  <Root>
    <Row justifyContent="center" alignItems="center">
      <Row alignItems="center">
        <Skeleton width={56} height={56} style={{ borderRadius: 12 }} />
        <SizedBox width={8} />
        <Column>
          <Skeleton width={150} height={16} style={{ marginBottom: 8 }} />
          <Skeleton width={150} height={16} />
        </Column>
      </Row>
      <Arrow style={{ cursor: "pointer" }} />
    </Row>
  </Root>
);

const SelectArtefact: React.FC<IProps> = () => {
  const { nftStore } = useStores();
  const [openNftDialog, setOpenNftDialog] = useState(false);
  const vm = useCreateCustomPoolsVM();
  return (
    <Root>
      <Row
        justifyContent="center"
        alignItems="center"
        onClick={() => setOpenNftDialog(true)}
      >
        <Row alignItems="center">
          <SquareTokenIcon src={vm.artefactToSpend?.picture ?? unknown} />
          <SizedBox width={8} />
          {vm.artefactToSpend == null ? (
            <Column>
              <Text weight={500}>Artefact is not selected</Text>
              <Text type="secondary">
                You have {nftStore.nftForPoolCreation?.length ?? 0} artefacts
              </Text>
            </Column>
          ) : (
            <Column>
              <Text weight={500}>{vm.artefactToSpend.name}</Text>
              <Text type="secondary">Pool creation NFT</Text>
            </Column>
          )}
        </Row>
        <Arrow style={{ cursor: "pointer" }} />
      </Row>
      <SelectNftDialog
        visible={openNftDialog}
        onClose={() => setOpenNftDialog(false)}
        title="Select NFT"
        onNftClick={(artefact) => vm.setArtefactToSpend(artefact)}
      />
      {vm.artefactToSpend != null && (
        <div style={{ width: "100%" }}>
          <SizedBox height={16} />
          <Notification
            type="warning"
            text="Pay attention that this NFT will be burned after the creation of the pool."
          />
        </div>
      )}
    </Root>
  );
};
export default observer(SelectArtefact);
