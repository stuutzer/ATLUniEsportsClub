import { openai } from "@ai-sdk/openai";
import { generateText, stepCountIs, tool } from "ai";
import { z } from "zod";
import { mockProducts, type CryptoToken } from "@/lib/mockData";
import type { AgentRecommendation } from "@/lib/agent-types";
import {
  comparePrices,
  convertPrice,
  createPurchaseQuote,
  estimateNetworkFee,
  getCatalogSnapshot,
  rankPurchaseOptions,
  searchProducts,
  verifyMerchant,
} from "@/lib/shopping-backend.mjs";

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
    "You are Quarter's shopping agent.",
    "Help users shop online by using the available shopping tools whenever pricing, merchant trust, crypto conversion, or quote data is needed.",
    "Prefer tool-backed answers over guesses.",
    "When recommending products, keep the chat response short: one or two concise sentences only.",
    "Do not dump detailed pricing, shipping, accepted-token, or chain lists in the chat response because those details are rendered in product cards.",
    "Mention the best pick and the main reason in plain language.",
    "If the user asks for a purchase recommendation, compare multiple options before deciding.",
    "If the user asks for a direct quote, produce a concise answer and let the recommendation card carry the quote details.",
    "Do not claim to complete wallet signing or checkout yourself.",
  ].join(" ");
}

const shoppingTools = {
  search_products: tool({
    description: "Search the mocked shopping catalog and return product candidates.",
    inputSchema: z.object({
      query: z.string().optional(),
      category: z.string().optional(),
      maxResults: z.number().optional(),
    }),
    execute: (input) => searchProducts(input),
  }),
  compare_prices: tool({
    description: "Compare merchant offers for a product.",
    inputSchema: z.object({
      productId: z.string().optional(),
      productName: z.string().optional(),
      region: z.string().optional(),
      currency: z.string().optional(),
    }),
    execute: (input) => comparePrices(input),
  }),
  convert_price: tool({
    description: "Convert between fiat and crypto amounts using mocked rates.",
    inputSchema: z.object({
      amount: z.number(),
      fromCurrency: z.string(),
      toCurrency: z.string(),
    }),
    execute: (input) => convertPrice(input),
  }),
  estimate_network_fee: tool({
    description: "Estimate gas/network fees for a purchase chain and token.",
    inputSchema: z.object({
      chain: z.string(),
      token: z.string().optional(),
    }),
    execute: (input) => estimateNetworkFee(input),
  }),
  verify_merchant: tool({
    description: "Return trust and credential support metadata for a merchant.",
    inputSchema: z.object({
      merchantId: z.string().optional(),
      merchantName: z.string().optional(),
    }),
    execute: (input) => verifyMerchant(input),
  }),
  rank_purchase_options: tool({
    description: "Rank compatible offers using mocked pricing, token, and chain preferences.",
    inputSchema: z.object({
      productQuery: z.string().optional(),
      category: z.string().optional(),
      region: z.string().optional(),
      preferredTokens: z.array(z.string()).optional(),
      preferredChains: z.array(z.string()).optional(),
      maxUsd: z.number().optional(),
      maxResults: z.number().optional(),
    }),
    execute: (input) => rankPurchaseOptions(input as any),
  }),
  create_purchase_quote: tool({
    description: "Create a final mocked quote for a product, merchant, token, and chain.",
    inputSchema: z.object({
      productId: z.string(),
      merchantId: z.string().optional(),
      token: z.string().optional(),
      chain: z.string().optional(),
      region: z.string().optional(),
      credential: z.record(z.string(), z.unknown()).optional(),
    }),
    execute: (input) => createPurchaseQuote(input),
  }),
  get_catalog_snapshot: tool({
    description: "Return the current mocked catalog, merchants, offers, chains, and currencies.",
    inputSchema: z.object({}),
    execute: () => getCatalogSnapshot(),
  }),
};

function isCryptoToken(value: string): value is CryptoToken {
  return ["ETH", "AVAX", "USDC"].includes(value);
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

function isGroceryRecommendationRequest(input: string) {
  const normalized = input.toLowerCase();
  return (
    normalized.includes("grocery") ||
    normalized.includes("groceries") ||
    normalized.includes("produce") ||
    normalized.includes("pantry") ||
    normalized.includes("apples") ||
    normalized.includes("toilet paper") ||
    normalized.includes("milk") ||
    normalized.includes("bread") ||
    normalized.includes("eggs")
  );
}

function buildKeyboardRecommendations(): AgentRecommendation[] {
  const keyboardProducts = [
    {
      id: "12",
      name: "Keyboard Test Item",
      description:
        "Low-value keyboard listing for testing Avalanche Fuji test AVAX and MetaMask confirmation flows.",
      price: 0.01,
      category: "Peripherals",
      acceptedCrypto: ["AVAX", "USDC", "ETH"] as CryptoToken[],
      merchantName: "Quarter Test Merchant",
      imageUrl: "/products/keyboards/neural-pro-keyboard.webp",
      aiReasons: [
        "Best pick for testing because checkout uses a tiny Fuji test AVAX payment.",
        "Lets you verify MetaMask confirmation without spending real funds.",
      ],
      shippingUsd: 0,
      totalUsd: 0.01,
      chain: "avalanche",
      token: "AVAX",
      trustScore: 100,
    },
    {
      id: "1",
      name: "Neural Pro Keyboard",
      description:
        "Mechanical keyboard with AI-optimized key mapping and haptic feedback.",
      price: 249.99,
      category: "Peripherals",
      acceptedCrypto: ["ETH", "AVAX", "USDC"] as CryptoToken[],
      merchantName: "Newegg",
      imageUrl: "/products/keyboards/neural-pro-keyboard.webp",
      aiReasons: [
        "Best overall pick because Newegg has the lowest landed cost and supports crypto checkout through a payment processor.",
        "Broad token support keeps checkout flexible across Base, Avalanche, and Ethereum.",
      ],
      shippingUsd: 12,
      totalUsd: 261.99,
      chain: "base",
      token: "USDC",
      trustScore: 99,
    },
    {
      id: "kb-1",
      name: "Wooting 80HE",
      description:
        "Hall-effect magnetic switches with rapid trigger and premium aluminum build.",
      price: 199.0,
      category: "Peripherals",
      acceptedCrypto: ["USDC", "AVAX", "ETH"] as CryptoToken[],
      merchantName: "Newegg",
      imageUrl: "/products/keyboards/wooting-80he.webp",
      aiReasons: [
        "Fastest response profile for competitive gaming and low-latency typing.",
        "Newegg is preferred here because the checkout can be routed through crypto payment rails.",
      ],
      shippingUsd: 6.99,
      totalUsd: 206.79,
      chain: "avalanche",
      token: "USDC",
      trustScore: 94,
    },
    {
      id: "kb-2",
      name: "Keychron Q1 Max",
      description:
        "CNC aluminum 75% keyboard with gasket mount, tri-mode wireless, and hot-swap.",
      price: 219.0,
      category: "Peripherals",
      acceptedCrypto: ["USDC", "ETH"] as CryptoToken[],
      merchantName: "Crypto Emporium",
      imageUrl: "/products/keyboards/keychron-q1-max.jpg",
      aiReasons: [
        "Excellent build quality out of the box with balanced acoustics.",
        "Crypto Emporium is a direct crypto-friendly vendor for electronics orders.",
      ],
      shippingUsd: 6.99,
      totalUsd: 226.79,
      chain: "base",
      token: "USDC",
      trustScore: 93,
    },
    {
      id: "kb-3",
      name: "NuPhy Halo75 V2",
      description:
        "Compact wireless mechanical keyboard tuned for smooth typing and everyday portability.",
      price: 159.0,
      category: "Peripherals",
      acceptedCrypto: ["USDC", "AVAX"] as CryptoToken[],
      merchantName: "ShopinBit",
      imageUrl: "/products/keyboards/nuphy-halo75-v2.png",
      aiReasons: [
        "Strong price-to-performance with premium feel in a smaller footprint.",
        "ShopinBit is selected as the crypto-friendly checkout route for this board.",
      ],
      shippingUsd: 6.99,
      totalUsd: 166.79,
      chain: "avalanche",
      token: "USDC",
      trustScore: 92,
    },
    {
      id: "kb-4",
      name: "Akko MOD 007B HE",
      description:
        "Magnetic-switch enthusiast board with customizable actuation for gaming and coding.",
      price: 169.0,
      category: "Peripherals",
      acceptedCrypto: ["USDC", "ETH"] as CryptoToken[],
      merchantName: "Crypto Emporium",
      imageUrl: "/products/keyboards/akko-mod-007b-he.png",
      aiReasons: [
        "Hall-effect precision without flagship pricing.",
        "Crypto Emporium keeps the checkout path aligned with direct crypto payment.",
      ],
      shippingUsd: 6.99,
      totalUsd: 176.79,
      chain: "base",
      token: "USDC",
      trustScore: 91,
    },
    {
      id: "kb-5",
      name: "Razer Huntsman V3 Pro TKL",
      description:
        "Tournament-focused TKL board with optical analog switches and sturdy frame.",
      price: 229.0,
      category: "Peripherals",
      acceptedCrypto: ["USDC", "AVAX", "ETH"] as CryptoToken[],
      merchantName: "Newegg",
      imageUrl: "/products/keyboards/razer-huntsman-v3-pro-tkl.webp",
      aiReasons: [
        "Competitive-ready switch behavior and dependable polling stability.",
        "Newegg is the preferred vendor because it can support crypto-funded checkout.",
      ],
      shippingUsd: 6.99,
      totalUsd: 236.79,
      chain: "avalanche",
      token: "USDC",
      trustScore: 90,
    },
  ];

  const fallbackProduct = mockProducts[0];

  return keyboardProducts.map((product, index) => ({
    product: {
      ...(fallbackProduct ?? product),
      ...product,
    },
    token: product.token,
    chain: product.chain,
    totalUsd: product.totalUsd,
    subtotalUsd: product.price,
    shippingUsd: product.shippingUsd,
    gasUsd: Number((product.totalUsd - product.price - product.shippingUsd).toFixed(2)),
    trustScore: product.trustScore,
    score: 99 - index,
    reasoning: product.aiReasons,
  }));
}

function buildGroceryRecommendations(): AgentRecommendation[] {
  const groceryProducts = mockProducts.filter(
    (product) => product.category.toLowerCase() === "groceries"
  );

  return groceryProducts.map((product, index) => {
    const shippingUsd = index === 0 ? 4.5 : index === 1 ? 3.5 : 5;
    const gasUsd = 0.18;

    return {
      product,
      token: "USDC",
      chain: "avalanche",
      totalUsd: Number((product.price + shippingUsd + gasUsd).toFixed(2)),
      subtotalUsd: product.price,
      shippingUsd,
      gasUsd,
      trustScore: index === 0 ? 97 : index === 1 ? 95 : 94,
      score: 98 - index,
      reasoning: product.aiReasons,
    };
  });
}

function buildRecommendations(input: string): AgentRecommendation[] {
  if (isKeyboardRecommendationRequest(input)) {
    return buildKeyboardRecommendations();
  }

  if (isGroceryRecommendationRequest(input)) {
    return buildGroceryRecommendations();
  }

  const result = rankPurchaseOptions(
    {
      productQuery: input,
      region: "US",
      preferredTokens: ["USDC", "AVAX", "ETH"],
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

function buildRecommendationSummary(
  recommendations: AgentRecommendation[],
  fallbackOutput: string
) {
  const topRecommendation = recommendations[0];

  if (!topRecommendation) {
    return fallbackOutput;
  }

  const reason =
    topRecommendation.reasoning[0]?.replace(/\.$/, "") ??
    "it has the best mix of cost, trust, and checkout flexibility";

  return `Best pick: ${topRecommendation.product.name} from ${topRecommendation.product.merchantName}. ${reason}. I put the quote, merchant, token, and chain details in the cards below.`;
}

export async function runShoppingAgent(input: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  const model = "gpt-5.4-mini";
  const result = await generateText({
    model: openai(model),
    system: buildAgentInstructions(),
    prompt: input,
    tools: shoppingTools,
    stopWhen: stepCountIs(6),
  });
  const recommendations = buildRecommendations(input);

  return {
    model,
    output: buildRecommendationSummary(recommendations, result.text),
    recommendations,
  };
}
