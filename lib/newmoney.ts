export const NEWMONEY_BASE_URL =
  process.env.NEWMONEY_BASE_URL || "https://dev-dnzd.newmoney-api.workers.dev";

export const NEWMONEY_DEFAULT_CHAIN = "sepolia";

export interface NewMoneyMintRequest {
  amount: number;
  chain?: string;
}

export interface NewMoneyMintResponse {
  ok: true;
  user_name: string;
  wallet_address: string;
  amount: number;
  remaining_balance: number;
  message: string;
}

export interface NewMoneyMintError {
  ok?: false;
  error?: string;
  details?: string[];
  retryAfter?: number;
}

export function normalizeMintAmount(amount: unknown): number | null {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return null;
  const rounded = Math.round(amount * 100) / 100;
  if (rounded < 0.01 || rounded > 10000) return null;
  return rounded;
}

export async function mintDNZDSettlement({
  amount,
  chain = NEWMONEY_DEFAULT_CHAIN,
}: NewMoneyMintRequest): Promise<NewMoneyMintResponse> {
  const apiKey = process.env.NEWMONEY_API_KEY;
  if (!apiKey) {
    throw new Error("NEWMONEY_API_KEY is not configured");
  }

  const normalizedAmount = normalizeMintAmount(amount);
  if (normalizedAmount === null) {
    throw new Error("Mint amount must be between 0.01 and 10000 with up to 2 decimal places");
  }

  const response = await fetch(NEWMONEY_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      apiKey,
      amount: normalizedAmount,
      chain,
    }),
  });

  const data = (await response.json()) as NewMoneyMintResponse | NewMoneyMintError;

  if (!response.ok || !("ok" in data) || data.ok !== true) {
    const errorMessage =
      "details" in data && data.details?.length
        ? data.details.join(", ")
        : "error" in data && data.error
        ? data.error
        : "NewMoney mint failed";
    throw new Error(errorMessage);
  }

  return data;
}
