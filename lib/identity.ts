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
}

export function generateCredential(
  walletAddress: string,
  ensName: string | null,
  permissions: string[],
  spendingLimit: number,
  allowedCategories: string[]
): AgentCredential {
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const credential: AgentCredential = {
    id: crypto.randomUUID(),
    agentName: "agentcart.eth",
    actingFor: ensName || walletAddress,
    permissions,
    spendingLimit,
    allowedCategories,
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    signature: "",
  };

  const payload = JSON.stringify({
    agent: credential.agentName,
    for: credential.actingFor,
    permissions: credential.permissions,
    limit: credential.spendingLimit,
    issued: credential.issuedAt,
  });

  // TODO: replace with real EIP-712 wallet signature via eth_signTypedData
  const hash = Array.from(payload).reduce(
    (h, char) => ((h << 5) - h + char.charCodeAt(0)) | 0,
    0
  );
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  credential.signature = "0x" + (hex + credential.id.replace(/-/g, "")).slice(0, 64);

  return credential;
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
    return cred;
  } catch {
    return null;
  }
}

export function revokeCredential(): void {
  localStorage.removeItem("agentcart_credential");
}
