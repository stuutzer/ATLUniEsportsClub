#!/usr/bin/env node

import {
  comparePrices,
  convertPrice,
  createPurchaseQuote,
  estimateNetworkFee,
  getCatalogSnapshot,
  rankPurchaseOptions,
  searchProducts,
  verifyMerchant,
} from "../lib/shopping-backend.mjs";

const SERVER_INFO = {
  name: "agentcart-shopping-mcp",
  version: "0.1.0",
};

const TOOLS = [
  {
    name: "search_products",
    description: "Search the mocked shopping catalog and return product candidates.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        category: { type: "string" },
        maxResults: { type: "number" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "compare_prices",
    description: "Compare merchant offers for a product.",
    inputSchema: {
      type: "object",
      properties: {
        productId: { type: "string" },
        productName: { type: "string" },
        region: { type: "string" },
        currency: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "convert_price",
    description: "Convert between fiat and crypto amounts using mocked rates.",
    inputSchema: {
      type: "object",
      properties: {
        amount: { type: "number" },
        fromCurrency: { type: "string" },
        toCurrency: { type: "string" },
      },
      required: ["amount", "fromCurrency", "toCurrency"],
      additionalProperties: false,
    },
  },
  {
    name: "estimate_network_fee",
    description: "Estimate gas/network fees for a purchase chain and token.",
    inputSchema: {
      type: "object",
      properties: {
        chain: { type: "string" },
        token: { type: "string" },
      },
      required: ["chain"],
      additionalProperties: false,
    },
  },
  {
    name: "verify_merchant",
    description: "Return trust and credential support metadata for a merchant.",
    inputSchema: {
      type: "object",
      properties: {
        merchantId: { type: "string" },
        merchantName: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "rank_purchase_options",
    description: "Rank compatible offers using mocked pricing, token, and chain preferences.",
    inputSchema: {
      type: "object",
      properties: {
        productQuery: { type: "string" },
        category: { type: "string" },
        region: { type: "string" },
        preferredTokens: {
          type: "array",
          items: { type: "string" },
        },
        preferredChains: {
          type: "array",
          items: { type: "string" },
        },
        maxUsd: { type: "number" },
        maxResults: { type: "number" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "create_purchase_quote",
    description: "Create a final mocked quote for a product, merchant, token, and chain.",
    inputSchema: {
      type: "object",
      properties: {
        productId: { type: "string" },
        merchantId: { type: "string" },
        token: { type: "string" },
        chain: { type: "string" },
        region: { type: "string" },
        credential: { type: "object" },
      },
      required: ["productId"],
      additionalProperties: false,
    },
  },
  {
    name: "get_catalog_snapshot",
    description: "Return the current mocked catalog, merchants, offers, chains, and currencies.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
];

const TOOL_HANDLERS = {
  search_products: searchProducts,
  compare_prices: comparePrices,
  convert_price: convertPrice,
  estimate_network_fee: estimateNetworkFee,
  verify_merchant: verifyMerchant,
  rank_purchase_options: rankPurchaseOptions,
  create_purchase_quote: createPurchaseQuote,
  get_catalog_snapshot: getCatalogSnapshot,
};

let inputBuffer = "";

function sendMessage(message) {
  process.stdout.write(JSON.stringify(message) + "\n");
}

function sendResponse(id, result) {
  sendMessage({
    jsonrpc: "2.0",
    id,
    result,
  });
}

function sendError(id, code, message) {
  sendMessage({
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
    },
  });
}

function toToolResult(result) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
    structuredContent: result,
  };
}

async function handleRequest(message) {
  const { id, method, params } = message;

  try {
    if (method === "initialize") {
      sendResponse(id, {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {},
        },
        serverInfo: SERVER_INFO,
      });
      return;
    }

    if (method === "notifications/initialized") {
      return;
    }

    if (method === "ping") {
      sendResponse(id, {});
      return;
    }

    if (method === "tools/list") {
      sendResponse(id, { tools: TOOLS });
      return;
    }

    if (method === "tools/call") {
      const toolName = params?.name;
      const toolArgs = params?.arguments ?? {};
      const handler = TOOL_HANDLERS[toolName];

      if (!handler) {
        sendResponse(id, {
          content: [{ type: "text", text: `Unknown tool: ${toolName}` }],
          isError: true,
        });
        return;
      }

      try {
        const result = await handler(toolArgs);
        sendResponse(id, toToolResult(result));
      } catch (error) {
        sendResponse(id, {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : "Tool call failed",
            },
          ],
          isError: true,
        });
      }
      return;
    }

    sendError(id, -32601, `Method not found: ${method}`);
  } catch (error) {
    sendError(id, -32000, error instanceof Error ? error.message : "Internal error");
  }
}

function processInput() {
  let newlineIndex;
  while ((newlineIndex = inputBuffer.indexOf("\n")) !== -1) {
    const line = inputBuffer.slice(0, newlineIndex).trim();
    inputBuffer = inputBuffer.slice(newlineIndex + 1);

    if (!line) continue;

    try {
      const message = JSON.parse(line);
      handleRequest(message);
    } catch (error) {
      sendError(null, -32700, error instanceof Error ? error.message : "Parse error");
    }
  }
}

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  inputBuffer += chunk;
  processInput();
});

process.stdin.on("end", () => {
  process.exit(0);
});

process.stdin.resume();
