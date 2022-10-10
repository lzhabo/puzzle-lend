import BN from "@src/utils/BN";

export interface IInitData {
  assets: { share: number; assetId: string; locked: boolean }[];
  share: BN;
  locked: boolean;
  logo: string | null;
  title: string;
  domain: string;
  maxStep: number | null;
  step: number | null;
  fileName: string | null;
  fileSize: string | null;
  swapFee: number;
}

export default function loadCreatePoolStateFromStorage() {
  let initData: IInitData | null = null;
  try {
    const storageData = localStorage.getItem("puzzle-custom-pool");
    initData = storageData ? JSON.parse(storageData) : null;
  } catch (_) {}
  return initData;
}
