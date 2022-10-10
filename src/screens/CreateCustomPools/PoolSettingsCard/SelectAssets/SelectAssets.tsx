import styled from "@emotion/styled";
import React, { useState } from "react";
import Card from "@components/Card";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Notification from "@components/Notification";
import Button from "@components/Button";
import { ReactComponent as Add } from "@src/assets/icons/add.svg";
import { observer } from "mobx-react-lite";
import { useCreateCustomPoolsVM } from "@screens/CreateCustomPools/CreateCustomPoolsVm";
import TokenCompositionRow from "./TokenCompositionRow";
import TokenSelectModal from "@components/TokensSelectModal/TokenSelectModal";
import BN from "@src/utils/BN";
import Tooltip from "@components/Tooltip";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import { Row } from "@src/components/Flex";
import { useTheme } from "@emotion/react";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;
const Grid = styled.div`
  display: grid;
  row-gap: 26px;
  padding: 0 0 24px 0;
`;
const SelectsAssets: React.FC<IProps> = () => {
  const [addAssetModal, openAssetModal] = useState(false);
  const vm = useCreateCustomPoolsVM();
  const theme = useTheme();
  const assetNotification =
    "Please note that the pool must include a PUZZLE or USDN asset with at least 2% of pool weight and the maximum of 10 different assets.";
  return (
    <Root>
      <Text type="secondary" weight={500}>
        Select Assets
      </Text>
      <SizedBox height={8} />
      <Card style={{ width: "100%" }}>
        <Notification
          style={{ marginBottom: 24 }}
          type={vm.requiredTokensCorrectShare ? "info" : "error"}
          text={assetNotification}
        />
        <Row alignItems="center" justifyContent="start">
          <Text style={{ width: "fit-content" }} weight={500}>
            Base token
          </Text>
          <Tooltip
            containerStyles={{ display: "flex", alignItems: "center" }}
            content={
              <Text>
                Base token is used to provide liquidity with single asset. Also
                most of the LP rewards will be accumulated in this token.
              </Text>
            }
          >
            <InfoIcon style={{ marginLeft: 8 }} />
          </Tooltip>
        </Row>
        <SizedBox height={24} />
        {vm.poolsAssets.slice(0, 1).map(({ asset, share, locked }, index) => {
          const minShare = new BN(5);
          return (
            <TokenCompositionRow
              baseToken
              key={index + "select-asset"}
              locked={locked}
              onLockClick={() => vm.updateLockedState(asset.assetId, !locked)}
              onUpdateAsset={vm.changeAssetInShareInPool}
              balances={vm.tokensToAdd}
              asset={asset}
              share={share}
              setShare={(v) =>
                vm.changeAssetShareInPool(
                  asset.assetId,
                  v.lte(minShare) ? minShare : v
                )
              }
              onDelete={() => vm.removeAssetFromPool(asset.assetId)}
            />
          );
        })}
        <SizedBox
          height={1}
          style={{
            background: theme.colors.primary100,
            width: "calc(100% + 48px)",
            margin: "24px 0 24px -24px",
          }}
        />
        <Text style={{ width: "fit-content" }} weight={500}>
          Pool composition
        </Text>
        <SizedBox height={24} />
        <Grid>
          {vm.poolsAssets.slice(1).map(({ asset, share, locked }, index) => {
            const minShare = new BN(5);
            return (
              <TokenCompositionRow
                key={index + "select-asset"}
                locked={locked}
                onLockClick={() => vm.updateLockedState(asset.assetId, !locked)}
                onUpdateAsset={vm.changeAssetInShareInPool}
                balances={vm.tokensToAdd}
                asset={asset}
                share={share}
                setShare={(v) =>
                  vm.changeAssetShareInPool(
                    asset.assetId,
                    v.lte(minShare) ? minShare : v
                  )
                }
                onDelete={() => vm.removeAssetFromPool(asset.assetId)}
              />
            );
          })}
        </Grid>
        {vm.poolsAssets.length < 10 && (
          <Button
            fixed
            size="medium"
            kind="secondary"
            onClick={() => openAssetModal(true)}
          >
            Add an asset
            <SizedBox width={10} />
            <Add />
          </Button>
        )}
        <TokenSelectModal
          visible={addAssetModal}
          onSelect={vm.addAssetToPool}
          balances={vm.tokensToAdd}
          onClose={() => openAssetModal(!addAssetModal)}
        />
      </Card>
    </Root>
  );
};
export default observer(SelectsAssets);
