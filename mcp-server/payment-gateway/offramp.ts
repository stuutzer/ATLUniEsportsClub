import { randomUUID } from "node:crypto";
import { paymentConfig } from "./config.js";
import { fetchJson } from "./http.js";
import type { OffRampInput, OffRampResult } from "./types.js";

function buildIdempotencyKey(input: OffRampInput) {
  return input.idempotencyKey ?? `offramp-${input.orderId}-${randomUUID()}`;
}

export async function triggerOffRamp(input: OffRampInput): Promise<OffRampResult> {
  const idempotencyKey = buildIdempotencyKey(input);

  if (input.provider === "circle") {
    if (!paymentConfig.circleApiKey) throw new Error("CIRCLE_API_KEY is not configured");
    const raw = await fetchJson<{ id?: string; status?: string }>(
      `${paymentConfig.circleBaseUrl}${paymentConfig.circlePayoutPath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paymentConfig.circleApiKey}`,
          "Idempotency-Key": idempotencyKey,
        },
        body: {
          idempotencyKey,
          amount: { amount: input.amountUsdc, currency: "USD" },
          source: { type: "wallet", address: paymentConfig.offRampSettlementWallet },
          destination: {
            type: "bank_account",
            id: input.merchantPayoutProfile.bankAccountRef,
          },
          metadata: {
            orderId: input.orderId,
            merchantId: input.merchantPayoutProfile.merchantId,
            avalancheTxHash: input.avalancheTxHash,
          },
        },
        retries: 2,
      }
    );

    return {
      provider: "circle",
      orderId: input.orderId,
      status: raw.status === "complete" ? "submitted" : "pending",
      providerReference: raw.id ?? idempotencyKey,
      idempotencyKey,
      raw,
    };
  }

  if (!paymentConfig.stripeApiKey) throw new Error("STRIPE_SECRET_KEY is not configured");
  const raw = await fetchJson<{ id?: string; status?: string }>(
    `${paymentConfig.stripeBaseUrl}${paymentConfig.stripePayoutPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paymentConfig.stripeApiKey}`,
        "Idempotency-Key": idempotencyKey,
      },
      body: {
        amount: input.amountUsdc,
        currency: "usd",
        destination: input.merchantPayoutProfile.providerAccountId,
        bank_account: input.merchantPayoutProfile.bankAccountRef,
        metadata: {
          orderId: input.orderId,
          merchantId: input.merchantPayoutProfile.merchantId,
          avalancheTxHash: input.avalancheTxHash,
        },
      },
      retries: 2,
    }
  );

  return {
    provider: "stripe",
    orderId: input.orderId,
    status: raw.status === "paid" ? "submitted" : "pending",
    providerReference: raw.id ?? idempotencyKey,
    idempotencyKey,
    raw,
  };
}
