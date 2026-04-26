import { avalancheFuji } from "wagmi/chains";

export const DEMO_PAYMENT_CHAIN = avalancheFuji;
export const DEMO_PAYMENT_CHAIN_LABEL = "Avalanche Fuji Testnet";
export const DEMO_PAYMENT_TOKEN = "AVAX";
export const DEMO_PAYMENT_AMOUNT_AVAX = "0.0003";
export const DEMO_MERCHANT_ADDRESS = "0x000000000000000000000000000000000000dEaD";

export function demoPaymentErrorMessage(err: unknown): string {
  const name = (err as { name?: string } | null)?.name ?? "";
  const msg = err instanceof Error ? err.message : "";

  if (/UserRejected|User rejected|denied/i.test(`${name} ${msg}`)) {
    return "Transaction cancelled.";
  }

  return err instanceof Error
    ? err.message
    : `${DEMO_PAYMENT_CHAIN_LABEL} payment failed`;
}
