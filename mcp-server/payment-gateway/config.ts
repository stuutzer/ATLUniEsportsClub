import { Address, http, createPublicClient } from "viem";
import { avalanche } from "viem/chains";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const paymentConfig = {
  avalancheRpcUrl: optionalEnv("AVALANCHE_RPC_URL", "https://api.avax.network/ext/bc/C/rpc"),
  avalancheChainId: 43114,
  escrowAddress: requiredEnv("AVALANCHE_ESCROW_ADDRESS") as Address,
  usdcAddress: requiredEnv("AVALANCHE_USDC_ADDRESS") as Address,
  offRampSettlementWallet: requiredEnv("OFFRAMP_SETTLEMENT_WALLET") as Address,
  swapkitBaseUrl: optionalEnv("SWAPKIT_API_BASE_URL", "https://api.swapkit.dev"),
  swapkitApiKey: process.env.SWAPKIT_API_KEY,
  squidBaseUrl: optionalEnv("SQUID_API_BASE_URL", "https://apiplus.squidrouter.com"),
  squidApiKey: process.env.SQUID_API_KEY,
  circleBaseUrl: optionalEnv("CIRCLE_API_BASE_URL", "https://api.circle.com"),
  circleApiKey: process.env.CIRCLE_API_KEY,
  circlePayoutPath: optionalEnv("CIRCLE_PAYOUT_PATH", "/v1/businessAccount/payouts"),
  stripeBaseUrl: optionalEnv("STRIPE_API_BASE_URL", "https://api.stripe.com"),
  stripeApiKey: process.env.STRIPE_SECRET_KEY,
  stripePayoutPath: optionalEnv("STRIPE_CRYPTO_PAYOUT_PATH", "/v1/crypto/payouts"),
} as const;

export function createAvalancheClient() {
  return createPublicClient({
    chain: avalanche,
    transport: http(paymentConfig.avalancheRpcUrl),
  });
}
