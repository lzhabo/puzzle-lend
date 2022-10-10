import nodeService from "@src/services/nodeService";
import { CONTRACT_ADDRESSES } from "@src/constants";

export default async function checkDomainPaid(domain: string, address: string) {
  const checkDomainPaid = await nodeService.nodeKeysRequest(
    CONTRACT_ADDRESSES.createArtefacts,
    `domain_${domain}_purchasedBy`
  );
  return checkDomainPaid.some(({ value }) => value === address);
}
