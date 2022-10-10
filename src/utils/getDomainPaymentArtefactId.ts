import nodeService from "@src/services/nodeService";
import { CONTRACT_ADDRESSES } from "@src/constants";

export default async function getDomainPaymentArtefactId(
  domain: string
): Promise<string | null> {
  const values = await nodeService.nodeKeysRequest(
    CONTRACT_ADDRESSES.createArtefacts,
    `domain_${domain}_createdBy`
  );
  return values.length === 0 ? null : values[0].value.toString();
}
