import { Address, parseUnits } from "viem";
import { paymentConfig } from "./config.js";
import { fetchJson } from "./http.js";
import { buildSettlementCalldata } from "./avalanche.js";
import type { CrossChainQuote, CrossChainQuoteInput } from "./types.js";

function normalizeSourceChain(chain: CrossChainQuoteInput["sourceChain"]) {
  return chain === "bitcoin" ? "BTC" : "ETH";
}

function estimatedUsdcAmount(sourceAmount: string, sourceAsset: "BTC" | "ETH") {
  // Frontend must display provider quotes as authoritative. This fallback is
  // only used to build destination calldata before a provider response is known.
  const roughUsdRate = sourceAsset === "BTC" ? 65_000 : 3_200;
  const amount = Number(sourceAmount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid sourceAmount");
  return parseUnits((amount * roughUsdRate).toFixed(6), 6);
}

export async function createCrossChainQuote(input: CrossChainQuoteInput): Promise<CrossChainQuote> {
  if (input.provider === "squid" && input.sourceChain === "bitcoin") {
    throw new Error("Squid routes are EVM-focused in this scaffold; use SwapKit for native BTC.");
  }

  const destinationAmount = estimatedUsdcAmount(input.sourceAmount, input.sourceAsset);
  const settlementCalldata = buildSettlementCalldata({
    orderId: input.orderId as `0x${string}`,
    payer: input.payer as Address,
    merchant: input.merchant as Address,
    amount: destinationAmount,
  });

  const common = {
    orderId: input.orderId,
    sourceChain: input.sourceChain,
    sourceAsset: input.sourceAsset,
    sourceAmount: input.sourceAmount,
    destinationChain: "avalanche" as const,
    destinationAsset: "USDC" as const,
    destinationContract: paymentConfig.escrowAddress,
    settlementCalldata,
    warnings: [
      "Cross-chain execution is asynchronous; wait for PaymentRegistered on Avalanche before off-ramping.",
      "Provider route payload must be validated against orderId, destination contract, token, and calldata before display.",
    ],
  };

  if (input.provider === "swapkit") {
    const route = await fetchJson<unknown>(`${paymentConfig.swapkitBaseUrl}/quote`, {
      method: "POST",
      headers: {
        Authorization: paymentConfig.swapkitApiKey
          ? `Bearer ${paymentConfig.swapkitApiKey}`
          : undefined,
      },
      body: {
        sellAsset: normalizeSourceChain(input.sourceChain),
        buyAsset: "AVAX.USDC",
        sellAmount: input.sourceAmount,
        destinationAddress: paymentConfig.escrowAddress,
        destinationCalldata: settlementCalldata,
        slippageBps: input.slippageBps,
        memo: input.orderId,
      },
      retries: 2,
    });

    return {
      provider: "swapkit",
      ...common,
      estimatedUsdcOut: undefined,
      route,
    };
  }

  const query = new URLSearchParams({
    fromChain: "ethereum",
    toChain: "avalanche",
    fromToken: "native",
    toToken: paymentConfig.usdcAddress,
    fromAmount: input.sourceAmount,
    toAddress: paymentConfig.escrowAddress,
    slippage: String(input.slippageBps / 100),
    quoteOnly: "false",
  });
  const route = await fetchJson<unknown>(`${paymentConfig.squidBaseUrl}/v1/route?${query}`, {
    headers: {
      "x-integrator-id": "quarter-marketplace",
      Authorization: paymentConfig.squidApiKey ? `Bearer ${paymentConfig.squidApiKey}` : undefined,
    },
    retries: 2,
  });

  return {
    provider: "squid",
    ...common,
    estimatedUsdcOut: undefined,
    route,
  };
}
