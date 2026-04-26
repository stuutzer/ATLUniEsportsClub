export interface AgentCredential {
  id: string;
  agentName: string;
  actingFor: string;
  permissions: string[];
  spendingLimit: number;
  allowedCategories: string[];
  issuedAt: string;
  expiresAt: string;
  signature: string;
  signatureType: "eip-712" | "mock";
}

const EIP712_DOMAIN = {
  name: "Quarter",
  version: "1",
  chainId: 43114, // Avalanche C-Chain
} as const;

const EIP712_TYPES = {
  AgentCredential: [
    { name: "id", type: "string" },
    { name: "agent", type: "string" },
    { name: "actingFor", type: "string" },
    { name: "permissions", type: "string" },
    { name: "spendingLimit", type: "uint256" },
    { name: "allowedCategories", type: "string" },
    { name: "issuedAt", type: "uint256" },
    { name: "expiresAt", type: "uint256" },
  ],
} as const;

export interface CredentialTypedData {
  domain: typeof EIP712_DOMAIN;
  types: typeof EIP712_TYPES;
  primaryType: "AgentCredential";
  message: {
    id: string;
    agent: string;
    actingFor: string;
    permissions: string;
    spendingLimit: bigint;
    allowedCategories: string;
    issuedAt: bigint;
    expiresAt: bigint;
  };
}

export interface CredentialDraft {
  id: string;
  agentName: string;
  actingFor: string;
  permissions: string[];
  spendingLimit: number;
  allowedCategories: string[];
  issuedAt: string;
  expiresAt: string;
}

export function buildCredentialDraft(
  walletAddress: string,
  ensName: string | null,
  permissions: string[],
  spendingLimit: number,
  allowedCategories: string[]
): CredentialDraft {
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return {
    id: crypto.randomUUID(),
    agentName: "quarter.eth",
    actingFor: ensName || walletAddress,
    permissions,
    spendingLimit,
    allowedCategories,
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };
}

export function buildTypedData(draft: CredentialDraft): CredentialTypedData {
  return {
    domain: EIP712_DOMAIN,
    types: EIP712_TYPES,
    primaryType: "AgentCredential",
    message: {
      id: draft.id,
      agent: draft.agentName,
      actingFor: draft.actingFor,
      permissions: draft.permissions.join(","),
      spendingLimit: BigInt(Math.round(draft.spendingLimit)),
      allowedCategories: draft.allowedCategories.join(","),
      issuedAt: BigInt(Math.floor(new Date(draft.issuedAt).getTime() / 1000)),
      expiresAt: BigInt(Math.floor(new Date(draft.expiresAt).getTime() / 1000)),
    },
  };
}

function mockSignature(draft: CredentialDraft): string {
  const payload = JSON.stringify({
    agent: draft.agentName,
    for: draft.actingFor,
    permissions: draft.permissions,
    limit: draft.spendingLimit,
    issued: draft.issuedAt,
  });
  const hash = Array.from(payload).reduce(
    (h, char) => ((h << 5) - h + char.charCodeAt(0)) | 0,
    0
  );
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  return "0x" + (hex + draft.id.replace(/-/g, "")).slice(0, 64);
}

export function finalizeCredential(
  draft: CredentialDraft,
  signature: string,
  signatureType: "eip-712" | "mock"
): AgentCredential {
  return { ...draft, signature, signatureType };
}

// Convenience: build draft + mock signature in one call. Used as the offline
// fallback when no wallet is connected or the user rejects the EIP-712 prompt.
export function generateMockCredential(
  walletAddress: string,
  ensName: string | null,
  permissions: string[],
  spendingLimit: number,
  allowedCategories: string[]
): AgentCredential {
  const draft = buildCredentialDraft(walletAddress, ensName, permissions, spendingLimit, allowedCategories);
  return finalizeCredential(draft, mockSignature(draft), "mock");
}

export function saveCredential(credential: AgentCredential): void {
  localStorage.setItem("agentcart_credential", JSON.stringify(credential));
}

export function loadCredential(): AgentCredential | null {
  try {
    const raw = localStorage.getItem("agentcart_credential");
    if (!raw) return null;
    const cred = JSON.parse(raw) as AgentCredential;
    if (new Date(cred.expiresAt) < new Date()) {
      localStorage.removeItem("agentcart_credential");
      return null;
    }
    // Backfill signatureType for credentials issued before the field existed.
    if (!cred.signatureType) cred.signatureType = "mock";
    return cred;
  } catch {
    return null;
  }
}

export function revokeCredential(): void {
  localStorage.removeItem("agentcart_credential");
}
