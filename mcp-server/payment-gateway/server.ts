#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { paymentConfig } from "./config.js";
import { createCrossChainQuote } from "./cross-chain.js";
import { waitForAvalanchePayment } from "./avalanche.js";
import { triggerOffRamp } from "./offramp.js";
import {
  CrossChainQuoteInputSchema,
  MonitorPaymentInputSchema,
  OffRampInputSchema,
} from "./types.js";

function jsonToolResult(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2),
      },
    ],
    structuredContent: value as Record<string, unknown>,
  };
}

const server = new McpServer({
  name: "quarter-payment-gateway",
  version: "0.1.0",
});

server.registerResource(
  "payment-gateway-config",
  "quarter://payment-gateway/config",
  {
    title: "Payment Gateway Runtime Configuration",
    description: "Non-secret runtime configuration for the Avalanche payment gateway.",
    mimeType: "application/json",
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(
          {
            avalancheChainId: paymentConfig.avalancheChainId,
            escrowAddress: paymentConfig.escrowAddress,
            usdcAddress: paymentConfig.usdcAddress,
            offRampSettlementWallet: paymentConfig.offRampSettlementWallet,
            quoteProviders: ["swapkit", "squid"],
            offRampProviders: ["circle", "stripe"],
          },
          null,
          2
        ),
      },
    ],
  })
);

server.registerTool(
  "create_cross_chain_quote",
  {
    title: "Create cross-chain payment quote",
    description:
      "Quotes native BTC or native ETH into Avalanche C-Chain USDC settlement calldata for an order.",
    inputSchema: CrossChainQuoteInputSchema,
  },
  async (input) => jsonToolResult(await createCrossChainQuote(input))
);

server.registerTool(
  "monitor_avalanche_payment",
  {
    title: "Monitor Avalanche payment",
    description:
      "Polls Avalanche C-Chain for PaymentRegistered(orderId) with explicit timeout handling.",
    inputSchema: MonitorPaymentInputSchema,
  },
  async (input) => jsonToolResult(await waitForAvalanchePayment(input))
);

server.registerTool(
  "trigger_fiat_offramp",
  {
    title: "Trigger fiat off-ramp",
    description:
      "Submits a Circle or Stripe payout request after Avalanche settlement has been confirmed.",
    inputSchema: OffRampInputSchema,
    annotations: {
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async (input) => jsonToolResult(await triggerOffRamp(input))
);

server.registerPrompt(
  "payment_gateway_operator_runbook",
  {
    title: "Payment gateway operator runbook",
    description: "Operational checklist for safely completing a crypto-to-fiat marketplace order.",
    argsSchema: {
      orderId: z.string(),
    },
  },
  ({ orderId }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: [
            `Run payment orchestration for order ${orderId}.`,
            "1. Create a cross-chain quote.",
            "2. Wait for Avalanche PaymentRegistered confirmation.",
            "3. Trigger fiat off-ramp only after the event is confirmed.",
            "4. Return provider references and any retry instructions.",
          ].join("\n"),
        },
      },
    ],
  })
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Payment MCP server failed");
  process.exit(1);
});
