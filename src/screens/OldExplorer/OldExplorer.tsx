import React, { useEffect } from "react";
import Layout from "@components/Layout";
import { TOKENS_BY_SYMBOL } from "@src/constants";
import ExploreTokenPage from "./tokenPage/ExploreTokenPage";
import ExploreProtocolPage from "./protocolPage/ExploreProtocolPage";
import {
  OldExploreVMProvider,
  useOldExploreVM,
} from "@screens/OldExplorer/OldExploreVm";

interface IProps {}

const OldExplorerImpl: React.FC<IProps> = () => {
  const vm = useOldExploreVM();
  const search = new URLSearchParams(window.location.search);
  const assetId = search.get("assetId");
  useEffect(() => {
    vm.setAssetId(assetId ?? TOKENS_BY_SYMBOL.PUZZLE.assetId);
  }, [assetId, vm]);
  return (
    <Layout>
      {assetId != null ? <ExploreTokenPage /> : <ExploreProtocolPage />}
    </Layout>
  );
};

const OldExplorer: React.FC<IProps> = () => (
  <OldExploreVMProvider>
    <OldExplorerImpl />
  </OldExploreVMProvider>
);
export default OldExplorer;
