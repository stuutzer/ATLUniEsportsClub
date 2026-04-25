import {
  Address,
  encodeFunctionData,
  formatUnits,
  parseAbi,
  parseEventLogs,
} from "viem";
import { createAvalancheClient, paymentConfig } from "./config.js";
import type { AvalanchePayment, MonitorPaymentInput } from "./types.js";

export const escrowAbi = parseAbi([
  "event PaymentRegistered(bytes32 indexed orderId,address indexed payer,address indexed merchant,uint256 amount,bytes32 sourceTxId)",
  "function payOrder(bytes32 orderId,address payer,address merchant,uint256 amount,bytes32 sourceTxId)",
  "function getPayment(bytes32 orderId) view returns ((address payer,address merchant,uint256 amount,uint64 paidAt,uint8 status,bytes32 sourceTxId))",
]);

export function buildSettlementCalldata(input: {
  orderId: `0x${string}`;
  payer: Address;
  merchant: Address;
  amount: bigint;
  sourceTxId?: `0x${string}`;
}) {
  return encodeFunctionData({
    abi: escrowAbi,
    functionName: "payOrder",
    args: [
      input.orderId,
      input.payer,
      input.merchant,
      input.amount,
      input.sourceTxId ?? "0x0000000000000000000000000000000000000000000000000000000000000000",
    ],
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForAvalanchePayment(
  input: MonitorPaymentInput
): Promise<AvalanchePayment> {
  const client = createAvalancheClient();
  const deadline = Date.now() + input.timeoutMs;
  let fromBlock = input.fromBlock ?? (await client.getBlockNumber());

  while (Date.now() < deadline) {
    const toBlock = await client.getBlockNumber();
    const logs = await client.getLogs({
      address: paymentConfig.escrowAddress,
      fromBlock,
      toBlock,
    });
    const parsed = parseEventLogs({
      abi: escrowAbi,
      logs,
      eventName: "PaymentRegistered",
    });

    const match = parsed.find((event) => event.args.orderId === input.orderId);
    if (match) {
      return {
        orderId: match.args.orderId,
        payer: match.args.payer,
        merchant: match.args.merchant,
        amount: formatUnits(match.args.amount, 6),
        sourceTxId: match.args.sourceTxId,
        avalancheTxHash: match.transactionHash,
        blockNumber: match.blockNumber.toString(),
      };
    }

    fromBlock = toBlock + BigInt(1);
    await sleep(input.pollIntervalMs);
  }

  throw new Error(`Timed out waiting for Avalanche payment for order ${input.orderId}`);
}
