import { z } from "zod";

export const Hex32Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, "expected bytes32 hex string");

export const AddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "expected EVM address");

export const SourceChainSchema = z.enum(["bitcoin", "ethereum"]);
export const SourceAssetSchema = z.enum(["BTC", "ETH"]);
export const QuoteProviderSchema = z.enum(["swapkit", "squid"]);
export const OffRampProviderSchema = z.enum(["circle", "stripe"]);

export const MerchantPayoutProfileSchema = z.object({
  merchantId: z.string().min(1),
  merchantName: z.string().min(1),
  offRampProvider: OffRampProviderSchema,
  providerAccountId: z.string().min(1),
  bankAccountRef: z.string().min(1),
});

export const CrossChainQuoteInputSchema = z.object({
  orderId: Hex32Schema,
  payer: AddressSchema,
  merchant: AddressSchema,
  merchantPayoutProfile: MerchantPayoutProfileSchema,
  sourceChain: SourceChainSchema,
  sourceAsset: SourceAssetSchema,
  sourceAmount: z.string().min(1),
  provider: QuoteProviderSchema.default("swapkit"),
  slippageBps: z.number().int().min(1).max(1000).default(100),
});

export const MonitorPaymentInputSchema = z.object({
  orderId: Hex32Schema,
  fromBlock: z.bigint().optional(),
  timeoutMs: z.number().int().min(5_000).max(30 * 60_000).default(10 * 60_000),
  pollIntervalMs: z.number().int().min(1_000).max(60_000).default(5_000),
});

export const OffRampInputSchema = z.object({
  orderId: Hex32Schema,
  merchantPayoutProfile: MerchantPayoutProfileSchema,
  amountUsdc: z.string().min(1),
  avalancheTxHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  provider: OffRampProviderSchema,
  idempotencyKey: z.string().min(12).optional(),
});

export type CrossChainQuoteInput = z.infer<typeof CrossChainQuoteInputSchema>;
export type MonitorPaymentInput = z.infer<typeof MonitorPaymentInputSchema>;
export type OffRampInput = z.infer<typeof OffRampInputSchema>;

export interface CrossChainQuote {
  provider: "swapkit" | "squid";
  orderId: string;
  sourceChain: "bitcoin" | "ethereum";
  sourceAsset: "BTC" | "ETH";
  sourceAmount: string;
  destinationChain: "avalanche";
  destinationAsset: "USDC";
  destinationContract: string;
  settlementCalldata: string;
  estimatedUsdcOut?: string;
  expiresAt?: string;
  route: unknown;
  warnings: string[];
}

export interface AvalanchePayment {
  orderId: string;
  payer: string;
  merchant: string;
  amount: string;
  sourceTxId: string;
  avalancheTxHash: string;
  blockNumber: string;
}

export interface OffRampResult {
  provider: "circle" | "stripe";
  orderId: string;
  status: "submitted" | "pending";
  providerReference: string;
  idempotencyKey: string;
  raw: unknown;
}
