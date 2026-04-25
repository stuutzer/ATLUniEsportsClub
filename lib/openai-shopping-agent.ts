import path from "node:path";
import { Agent, MCPServerStdio, run, setTracingDisabled } from "@openai/agents";
import { mockProducts, type CryptoToken } from "@/lib/mockData";
import type { AgentRecommendation } from "@/lib/agent-types";
import { rankPurchaseOptions } from "@/lib/shopping-backend.mjs";

setTracingDisabled(true);

interface RankedPurchaseOption {
  score: number;
  productId: string;
  productName: string;
  merchantId: string;
  merchantName: string;
  token: string;
  chain: string;
  totalUsd: number;
  subtotalUsd: number;
  shippingUsd: number;
  gasUsd: number;
  trustScore: number;
  reasoning: string[];
}

function buildAgentInstructions() {
  return [
    "You are AgentCart's shopping agent.",
    "Help users shop online by using the available shopping tools whenever current pricing, merchant trust, crypto conversion, or quote data is needed.",
    "Prefer tool-backed answers over guesses.",
    "When recommending an option, explain the decision in plain language and include merchant, total estimated cost, token, and chain when available.",
    "If the user asks for a purchase recommendation, compare multiple options before deciding.",
    "If the user asks for a direct quote, produce a concise answer with the quote details and why that path is reasonable.",
    "Do not claim to complete wallet signing or checkout yourself.",
  ].join(" ");
}

function isCryptoToken(value: string): value is CryptoToken {
  return ["ETH", "AVAX", "USDC", "dNZD"].includes(value);
}

function findMockProduct(productName: string) {
  const normalizedName = productName.trim().toLowerCase();

  return (
    mockProducts.find((product) => product.name.trim().toLowerCase() === normalizedName) ??
    mockProducts.find((product) =>
      product.name.trim().toLowerCase().includes(normalizedName)
    ) ??
    null
  );
}

function isKeyboardRecommendationRequest(input: string) {
  const normalized = input.toLowerCase();
  return (
    normalized.includes("keyboard") ||
    normalized.includes("keyboards") ||
    normalized.includes("mechanical")
  );
}

function buildKeyboardRecommendations(): AgentRecommendation[] {
  const keyboardProducts = [
    {
      id: "kb-1",
      name: "Wooting 80HE",
      description:
        "Hall-effect magnetic switches with rapid trigger and premium aluminum build.",
      price: 199.0,
      category: "Peripherals",
      tier: "S" as const,
      acceptedCrypto: ["USDC", "AVAX", "ETH"] as CryptoToken[],
      merchantName: "Wooting Official",
      imageUrl:
        "https://computerlounge.co.nz/cdn/shop/files/36f4ee3af51c83819f19ccfda709acc27354cc79_Wooting_60HE__1_grande.jpg?v=1729656519",
      aiReasons: [
        "Fastest response profile for competitive gaming and low-latency typing.",
        "Strong firmware support and broad community tuning presets.",
      ],
    },
    {
      id: "kb-2",
      name: "Keychron Q1 Max",
      description:
        "CNC aluminum 75% keyboard with gasket mount, tri-mode wireless, and hot-swap.",
      price: 219.0,
      category: "Peripherals",
      tier: "S" as const,
      acceptedCrypto: ["USDC", "ETH"] as CryptoToken[],
      merchantName: "Keychron Store",
      imageUrl:
        "https://www.keychron.com/cdn/shop/files/Keychron-Q1-Max-QMK-VIA-Wireless-Custom-Mechanical-Keyboard.jpg?v=1693279088",
      aiReasons: [
        "Excellent build quality out of the box with balanced acoustics.",
        "Great long-term value due to easy switch and keycap customization.",
      ],
    },
    {
      id: "kb-3",
      name: "NuPhy Halo75 V2",
      description:
        "Compact wireless mechanical keyboard tuned for smooth typing and everyday portability.",
      price: 159.0,
      category: "Peripherals",
      tier: "A" as const,
      acceptedCrypto: ["USDC", "AVAX"] as CryptoToken[],
      merchantName: "NuPhy",
      imageUrl:
        "https://nuphy.com/cdn/shop/files/NuPhy-Halo75-v2-wireless-mechanical-keyboard-black_1200x.jpg?v=1715934201",
      aiReasons: [
        "Strong price-to-performance with premium feel in a smaller footprint.",
        "Reliable multi-device Bluetooth behavior for mixed workflows.",
      ],
    },
    {
      id: "kb-4",
      name: "Akko MOD 007B HE",
      description:
        "Magnetic-switch enthusiast board with customizable actuation for gaming and coding.",
      price: 169.0,
      category: "Peripherals",
      tier: "A" as const,
      acceptedCrypto: ["USDC", "ETH"] as CryptoToken[],
      merchantName: "Akko Global",
      imageUrl:
        "https://en.akkogear.com/wp-content/uploads/2024/01/MOD007BHE.jpg",
      aiReasons: [
        "Hall-effect precision without flagship pricing.",
        "Useful software controls for per-key actuation and rapid-trigger tuning.",
      ],
    },
    {
      id: "kb-5",
      name: "Razer Huntsman V3 Pro TKL",
      description:
        "Tournament-focused TKL board with optical analog switches and sturdy frame.",
      price: 229.0,
      category: "Peripherals",
      tier: "A" as const,
      acceptedCrypto: ["USDC", "AVAX", "ETH"] as CryptoToken[],
      merchantName: "Razer",
      imageUrl:
        "https://assets3.razerzone.com/5qf51Y4WYPk0UiHEU7mQadGG7N8=/1500x1000/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh53%2Fh4f%2F9594098774046%2F230912-huntsman-v3-pro-tkl-500x500-1.jpg",
      aiReasons: [
        "Competitive-ready switch behavior and dependable polling stability.",
        "Excellent choice when prioritizing esports-style performance.",
      ],
    },
    {
      id: "kb-6",
      name: "Logitech G PRO X TKL Lightspeed",
      description:
        "Wireless TKL esports keyboard with low-latency connection and durable keycaps.",
      price: 199.0,
      category: "Peripherals",
      tier: "A" as const,
      acceptedCrypto: ["USDC", "ETH"] as CryptoToken[],
      merchantName: "Logitech G",
      imageUrl:
        "https://resource.logitechg.com/content/dam/gaming/en/products/pro-x-tkl/pro-x-tkl-gallery-1-black.png",
      aiReasons: [
        "Clean professional design with proven tournament-grade wireless stack.",
        "Strong battery life and reliable software profiles for travel setups.",
      ],
    },
  ];

  const fallbackProduct = mockProducts[0];

  return keyboardProducts.map((product, index) => ({
    product: {
      ...(fallbackProduct ?? product),
      ...product,
    },
    token: product.acceptedCrypto[0] ?? "USDC",
    chain: index % 2 === 0 ? "Avalanche C-Chain" : "Base Sepolia",
    totalUsd: Number((product.price + 6.99 + 0.8).toFixed(2)),
    subtotalUsd: product.price,
    shippingUsd: 6.99,
    gasUsd: 0.8,
    trustScore: 94 - index,
    score: 99 - index,
    reasoning: product.aiReasons,
  }));
}

function buildRecommendations(input: string): AgentRecommendation[] {
  if (isKeyboardRecommendationRequest(input)) {
    return buildKeyboardRecommendations();
  }

  const result = rankPurchaseOptions(
    {
      productQuery: input,
      region: "US",
      preferredTokens: ["USDC", "AVAX", "ETH", "dNZD"],
      preferredChains: ["base", "avalanche", "ethereum"],
      maxResults: 3,
    } as any
  ) as { options?: RankedPurchaseOption[] };

  const seenProducts = new Set<string>();

  return (result.options ?? [])
    .map((option) => {
      const matchedProduct = findMockProduct(option.productName);

      if (!matchedProduct || seenProducts.has(matchedProduct.id)) {
        return null;
      }

      seenProducts.add(matchedProduct.id);

      return {
        product: {
          ...matchedProduct,
          merchantName: option.merchantName,
          price: option.subtotalUsd,
          acceptedCrypto: matchedProduct.acceptedCrypto.filter((token) =>
            isCryptoToken(token)
          ),
          aiReasons:
            option.reasoning.length > 0 ? option.reasoning : matchedProduct.aiReasons,
        },
        token: option.token,
        chain: option.chain,
        totalUsd: option.totalUsd,
        subtotalUsd: option.subtotalUsd,
        shippingUsd: option.shippingUsd,
        gasUsd: option.gasUsd,
        trustScore: option.trustScore,
        score: option.score,
        reasoning: option.reasoning,
      };
    })
    .filter((recommendation): recommendation is AgentRecommendation => Boolean(recommendation));
}

export async function runShoppingAgent(input: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  const mcpServer = new MCPServerStdio({
    name: "AgentCart Shopping MCP",
    command: "node",
    args: [path.join(process.cwd(), "mcp-server/server.mjs")],
    cwd: process.cwd(),
    cacheToolsList: true,
  });

  await mcpServer.connect();

  try {
    const agent = new Agent({
      name: "AgentCart Shopping Agent",
      model: "gpt-5.4-mini",
      instructions: buildAgentInstructions(),
      mcpServers: [mcpServer],
    });

    const result = await run(agent, input);
    const output =
      typeof result.finalOutput === "string"
        ? result.finalOutput
        : JSON.stringify(result.finalOutput, null, 2);

    return {
      model: "gpt-5.4-mini",
      output,
      recommendations: buildRecommendations(input),
    };
  } finally {
    await mcpServer.close();
  }
}
