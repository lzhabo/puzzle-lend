const buildBuyTokenRoute = (pathname: string, assetId: string) => ({
  pathname: `/${pathname}`,
  search: new URLSearchParams({
    asset1: assetId
  }).toString()
});
export default buildBuyTokenRoute;
