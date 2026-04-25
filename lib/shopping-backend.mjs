const PRODUCTS = [
  {
    id: "keyboard-001",
    name: "Neural Pro Keyboard",
    description:
      "Mechanical keyboard with AI-optimized key mapping and haptic feedback.",
    category: "Peripherals",
    imageUrl:
      "https://computerlounge.co.nz/cdn/shop/files/36f4ee3af51c83819f19ccfda709acc27354cc79_Wooting_60HE__1_grande.jpg?v=1729656519",
  },
  {
    id: "monitor-001",
    name: "HoloDisplay 4K Monitor",
    description: "27-inch 4K OLED display with 144Hz refresh rate.",
    category: "Displays",
    imageUrl:
      "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/peripherals/monitors/aw-series/aw3225qf/pdp/monitor-alienware-aw3225qf-hero.psd?fmt=jpg&wid=756&hei=525",
  },
  {
    id: "headset-001",
    name: "AuraSound ANC Headset",
    description:
      "Studio-grade wireless headset with active noise cancellation and spatial audio.",
    category: "Audio",
    imageUrl:
      "https://www.magnumsound.nz/cdn/shop/files/sennheiser-hd-800s-audiophile-headphones-1900_grande.png?v=1691636446",
  },
  {
    id: "ssd-001",
    name: "Quantum SSD 2TB",
    description: "NVMe Gen5 SSD built for AI workloads and high-speed storage.",
    category: "Storage",
    imageUrl: "https://www.pbtech.co.nz/imgprod/H/D/HDDSAM993110__7.jpg",
  },
  {
    id: "server-001",
    name: "EdgeServer Mini",
    description: "Compact home server for local AI models and dApps.",
    category: "Computing",
    imageUrl:
      "https://images.prismic.io/frameworkmarketplace/Z7foP57c43Q3gCiV_fwdesktop_family_overview_panel_translucent.jpg?auto=format,compress",
  },
];

const MERCHANTS = [
  {
    id: "techvault",
    name: "TechVault Store",
    trustScore: 99,
    verifiedMerchant: true,
    acceptsCredentialFlow: true,
    refundPolicy: "30-day returns",
    shipsTo: ["NZ", "AU", "US"],
  },
  {
    id: "pixelforge",
    name: "PixelForge",
    trustScore: 96,
    verifiedMerchant: true,
    acceptsCredentialFlow: true,
    refundPolicy: "14-day returns",
    shipsTo: ["NZ", "US"],
  },
  {
    id: "soundsphere",
    name: "SoundSphere",
    trustScore: 94,
    verifiedMerchant: true,
    acceptsCredentialFlow: true,
    refundPolicy: "21-day returns",
    shipsTo: ["NZ", "AU"],
  },
  {
    id: "datastream",
    name: "DataStream Co.",
    trustScore: 91,
    verifiedMerchant: true,
    acceptsCredentialFlow: false,
    refundPolicy: "7-day exchange",
    shipsTo: ["NZ", "AU", "US"],
  },
  {
    id: "nodenest",
    name: "NodeNest",
    trustScore: 93,
    verifiedMerchant: true,
    acceptsCredentialFlow: true,
    refundPolicy: "30-day returns",
    shipsTo: ["NZ", "AU", "US"],
  },
];

const OFFERS = [
  {
    productId: "keyboard-001",
    merchantId: "techvault",
    productUrl: "https://example.com/techvault/neural-pro-keyboard",
    priceUsd: 249.99,
    shippingUsd: 12,
    acceptedTokens: ["ETH", "AVAX", "USDC", "dNZD"],
    supportedChains: ["base", "avalanche", "ethereum"],
    estimatedDeliveryDays: 3,
    inventoryStatus: "in_stock",
  },
  {
    productId: "keyboard-001",
    merchantId: "pixelforge",
    productUrl: "https://example.com/pixelforge/neural-pro-keyboard",
    priceUsd: 259,
    shippingUsd: 6,
    acceptedTokens: ["ETH", "USDC"],
    supportedChains: ["base", "ethereum"],
    estimatedDeliveryDays: 2,
    inventoryStatus: "in_stock",
  },
  {
    productId: "monitor-001",
    merchantId: "pixelforge",
    productUrl: "https://example.com/pixelforge/holo-display-monitor",
    priceUsd: 899,
    shippingUsd: 18,
    acceptedTokens: ["ETH", "USDC", "dNZD"],
    supportedChains: ["base", "ethereum"],
    estimatedDeliveryDays: 4,
    inventoryStatus: "in_stock",
  },
  {
    productId: "monitor-001",
    merchantId: "techvault",
    productUrl: "https://example.com/techvault/holo-display-monitor",
    priceUsd: 919,
    shippingUsd: 10,
    acceptedTokens: ["AVAX", "USDC", "dNZD"],
    supportedChains: ["base", "avalanche"],
    estimatedDeliveryDays: 5,
    inventoryStatus: "in_stock",
  },
  {
    productId: "headset-001",
    merchantId: "soundsphere",
    productUrl: "https://example.com/soundsphere/aura-anc-headset",
    priceUsd: 329.5,
    shippingUsd: 8,
    acceptedTokens: ["AVAX", "USDC", "dNZD"],
    supportedChains: ["base", "avalanche"],
    estimatedDeliveryDays: 3,
    inventoryStatus: "in_stock",
  },
  {
    productId: "headset-001",
    merchantId: "techvault",
    productUrl: "https://example.com/techvault/aura-anc-headset",
    priceUsd: 339,
    shippingUsd: 5,
    acceptedTokens: ["ETH", "AVAX", "USDC"],
    supportedChains: ["base", "avalanche", "ethereum"],
    estimatedDeliveryDays: 2,
    inventoryStatus: "low_stock",
  },
  {
    productId: "ssd-001",
    merchantId: "datastream",
    productUrl: "https://example.com/datastream/quantum-ssd-2tb",
    priceUsd: 189.99,
    shippingUsd: 4,
    acceptedTokens: ["ETH", "USDC"],
    supportedChains: ["base", "ethereum"],
    estimatedDeliveryDays: 2,
    inventoryStatus: "in_stock",
  },
  {
    productId: "ssd-001",
    merchantId: "techvault",
    productUrl: "https://example.com/techvault/quantum-ssd-2tb",
    priceUsd: 195,
    shippingUsd: 0,
    acceptedTokens: ["AVAX", "USDC", "dNZD"],
    supportedChains: ["base", "avalanche"],
    estimatedDeliveryDays: 3,
    inventoryStatus: "in_stock",
  },
  {
    productId: "server-001",
    merchantId: "nodenest",
    productUrl: "https://example.com/nodenest/edge-server-mini",
    priceUsd: 549,
    shippingUsd: 16,
    acceptedTokens: ["ETH", "AVAX", "USDC", "dNZD"],
    supportedChains: ["base", "avalanche", "ethereum"],
    estimatedDeliveryDays: 6,
    inventoryStatus: "in_stock",
  },
  {
    productId: "server-001",
    merchantId: "techvault",
    productUrl: "https://example.com/techvault/edge-server-mini",
    priceUsd: 559,
    shippingUsd: 12,
    acceptedTokens: ["AVAX", "USDC"],
    supportedChains: ["base", "avalanche"],
    estimatedDeliveryDays: 4,
    inventoryStatus: "low_stock",
  },
];

const CHAIN_FEES = {
  base: { gasUsd: 0.12 },
  avalanche: { gasUsd: 0.18 },
  ethereum: { gasUsd: 4.75 },
};

const CURRENCY_TO_USD = {
  USD: 1,
  NZD: 0.6,
  ETH: 3200,
  AVAX: 28,
  USDC: 1,
  dNZD: 0.6,
};

const CURRENCY_ALIASES = {
  usd: "USD",
  nzd: "NZD",
  eth: "ETH",
  avax: "AVAX",
  usdc: "USDC",
  dnzd: "dNZD",
  "dnzd": "dNZD",
};

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

function roundToken(value) {
  return Math.round(value * 1000000) / 1000000;
}

function normalizeCurrency(currency) {
  if (!currency) {
    throw new Error("currency is required");
  }

  const key = String(currency).trim().toLowerCase();
  const normalized = CURRENCY_ALIASES[key];

  if (!normalized) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  return normalized;
}

function normalizeChain(chain) {
  if (!chain) {
    throw new Error("chain is required");
  }

  const key = String(chain).trim().toLowerCase();

  if (!CHAIN_FEES[key]) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  return key;
}

function getProductById(productId) {
  return PRODUCTS.find((product) => product.id === productId) ?? null;
}

function getProductByQuery(productName) {
  if (!productName) {
    return null;
  }

  const normalized = String(productName).trim().toLowerCase();

  return (
    PRODUCTS.find((product) => product.name.toLowerCase() === normalized) ??
    PRODUCTS.find((product) => product.name.toLowerCase().includes(normalized)) ??
    null
  );
}

function getMerchant(merchantId) {
  return MERCHANTS.find((merchant) => merchant.id === merchantId) ?? null;
}

function matchesProduct(product, query, category) {
  const queryMatch = !query
    ? true
    : `${product.name} ${product.description} ${product.category}`
        .toLowerCase()
        .includes(String(query).trim().toLowerCase());
  const categoryMatch = !category
    ? true
    : product.category.toLowerCase() === String(category).trim().toLowerCase();

  return queryMatch && categoryMatch;
}

function toUsd(amount, currency) {
  const normalizedCurrency = normalizeCurrency(currency);
  const rate = CURRENCY_TO_USD[normalizedCurrency];
  return Number(amount) * rate;
}

function fromUsd(amountUsd, currency) {
  const normalizedCurrency = normalizeCurrency(currency);
  const rate = CURRENCY_TO_USD[normalizedCurrency];
  return Number(amountUsd) / rate;
}

function summarizeOffer(offer, currency = "USD") {
  const product = getProductById(offer.productId);
  const merchant = getMerchant(offer.merchantId);
  const totalUsd = offer.priceUsd + offer.shippingUsd;
  const displayCurrency = normalizeCurrency(currency);
  const displayTotal = roundCurrency(fromUsd(totalUsd, displayCurrency));

  return {
    productId: offer.productId,
    productName: product?.name ?? "Unknown product",
    merchantId: merchant?.id ?? offer.merchantId,
    merchantName: merchant?.name ?? "Unknown merchant",
    productUrl: offer.productUrl,
    verifiedMerchant: merchant?.verifiedMerchant ?? false,
    trustScore: merchant?.trustScore ?? 0,
    acceptedTokens: offer.acceptedTokens,
    supportedChains: offer.supportedChains,
    inventoryStatus: offer.inventoryStatus,
    estimatedDeliveryDays: offer.estimatedDeliveryDays,
    priceUsd: roundCurrency(offer.priceUsd),
    shippingUsd: roundCurrency(offer.shippingUsd),
    totalUsd: roundCurrency(totalUsd),
    displayCurrency,
    displayTotal,
  };
}

export function searchProducts({ query = "", category, maxResults = 5 } = {}) {
  const results = PRODUCTS.filter((product) =>
    matchesProduct(product, query, category)
  )
    .map((product) => {
      const offers = OFFERS.filter((offer) => offer.productId === product.id);
      const bestOffer = offers.sort(
        (left, right) =>
          left.priceUsd + left.shippingUsd - (right.priceUsd + right.shippingUsd)
      )[0];

      return {
        ...product,
        bestOffer: bestOffer ? summarizeOffer(bestOffer, "USD") : null,
        offerCount: offers.length,
      };
    })
    .slice(0, Number(maxResults) || 5);

  return {
    query,
    category: category ?? null,
    count: results.length,
    results,
  };
}

export function comparePrices({
  productId,
  productName,
  region = "NZ",
  currency = "USD",
} = {}) {
  const product = productId ? getProductById(productId) : getProductByQuery(productName);

  if (!product) {
    throw new Error("Product not found");
  }

  const offers = OFFERS.filter((offer) => offer.productId === product.id)
    .map((offer) => {
      const merchant = getMerchant(offer.merchantId);
      const shipsToRegion = merchant?.shipsTo.includes(region.toUpperCase()) ?? false;

      return {
        ...summarizeOffer(offer, currency),
        region: region.toUpperCase(),
        shipsToRegion,
      };
    })
    .sort((left, right) => left.totalUsd - right.totalUsd);

  return {
    product,
    currency: normalizeCurrency(currency),
    region: region.toUpperCase(),
    offers,
  };
}

export function convertPrice({ amount, fromCurrency, toCurrency } = {}) {
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) {
    throw new Error("amount must be a valid number");
  }

  const normalizedFrom = normalizeCurrency(fromCurrency);
  const normalizedTo = normalizeCurrency(toCurrency);
  const amountUsd = toUsd(Number(amount), normalizedFrom);
  const convertedAmount = fromUsd(amountUsd, normalizedTo);

  return {
    amount: Number(amount),
    fromCurrency: normalizedFrom,
    toCurrency: normalizedTo,
    usdValue: roundCurrency(amountUsd),
    convertedAmount:
      normalizedTo === "ETH" || normalizedTo === "AVAX"
        ? roundToken(convertedAmount)
        : roundCurrency(convertedAmount),
    rate: roundToken(fromUsd(CURRENCY_TO_USD[normalizedFrom], normalizedTo)),
  };
}

export function estimateNetworkFee({ chain, token = "USDC" } = {}) {
  const normalizedChain = normalizeChain(chain);
  const normalizedToken = normalizeCurrency(token);
  const gasUsd = CHAIN_FEES[normalizedChain].gasUsd;

  return {
    chain: normalizedChain,
    token: normalizedToken,
    gasUsd: roundCurrency(gasUsd),
    gasTokenAmount:
      normalizedToken === "ETH" || normalizedToken === "AVAX"
        ? roundToken(fromUsd(gasUsd, normalizedToken))
        : roundCurrency(fromUsd(gasUsd, normalizedToken)),
  };
}

export function verifyMerchant({ merchantId, merchantName } = {}) {
  const merchant =
    (merchantId && getMerchant(merchantId)) ||
    MERCHANTS.find(
      (item) =>
        item.name.toLowerCase() === String(merchantName ?? "").trim().toLowerCase()
    ) ||
    null;

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  return {
    merchantId: merchant.id,
    merchantName: merchant.name,
    trustScore: merchant.trustScore,
    verifiedMerchant: merchant.verifiedMerchant,
    acceptsCredentialFlow: merchant.acceptsCredentialFlow,
    refundPolicy: merchant.refundPolicy,
    shipsTo: merchant.shipsTo,
  };
}

export function rankPurchaseOptions({
  productQuery,
  category,
  region = "NZ",
  preferredTokens = [],
  preferredChains = [],
  maxUsd,
  maxResults = 3,
} = {}) {
  const productSearch = searchProducts({
    query: productQuery ?? "",
    category,
    maxResults: 20,
  });

  const rankedOffers = productSearch.results
    .flatMap((product) =>
      OFFERS.filter((offer) => offer.productId === product.id).map((offer) => {
        const merchant = getMerchant(offer.merchantId);
        const preferredChain =
          preferredChains.find((chain) =>
            offer.supportedChains.includes(String(chain).toLowerCase())
          ) ?? offer.supportedChains[0];
        const preferredToken =
          preferredTokens.find((token) =>
            offer.acceptedTokens.includes(normalizeCurrency(token))
          ) ?? offer.acceptedTokens[0];
        const gas = estimateNetworkFee({
          chain: preferredChain,
          token: preferredToken,
        });
        const totalUsd = offer.priceUsd + offer.shippingUsd + gas.gasUsd;
        const trustScore = merchant?.trustScore ?? 0;
        const preferenceBonus = preferredTokens.length
          ? preferredTokens.includes(preferredToken)
            ? 1
            : 0
          : 0.5;
        const score = trustScore / 100 + preferenceBonus - totalUsd / 10000;

        return {
          score: roundToken(score),
          productId: offer.productId,
          productName: product.name,
          merchantId: offer.merchantId,
          merchantName: merchant?.name ?? offer.merchantId,
          token: preferredToken,
          chain: preferredChain,
          totalUsd: roundCurrency(totalUsd),
          subtotalUsd: roundCurrency(offer.priceUsd),
          shippingUsd: roundCurrency(offer.shippingUsd),
          gasUsd: roundCurrency(gas.gasUsd),
          trustScore,
          reasoning: [
            `Merchant trust score ${trustScore}/100`,
            `Estimated total ${roundCurrency(totalUsd)} USD`,
            `Best compatible token ${preferredToken} on ${preferredChain}`,
          ],
        };
      })
    )
    .filter((offer) => (maxUsd ? offer.totalUsd <= Number(maxUsd) : true))
    .sort((left, right) => right.score - left.score)
    .slice(0, Number(maxResults) || 3);

  return {
    productQuery: productQuery ?? "",
    region: region.toUpperCase(),
    count: rankedOffers.length,
    options: rankedOffers,
  };
}

export function createPurchaseQuote({
  productId,
  merchantId,
  token = "USDC",
  chain = "base",
  region = "NZ",
  credential,
} = {}) {
  if (!productId) {
    throw new Error("productId is required");
  }

  const normalizedToken = normalizeCurrency(token);
  const normalizedChain = normalizeChain(chain);
  const product = getProductById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  const matchingOffers = OFFERS.filter((offer) => offer.productId === productId).filter(
    (offer) =>
      (!merchantId || offer.merchantId === merchantId) &&
      offer.acceptedTokens.includes(normalizedToken) &&
      offer.supportedChains.includes(normalizedChain)
  );

  if (matchingOffers.length === 0) {
    throw new Error("No matching offer found for the requested token and chain");
  }

  const offer = matchingOffers.sort(
    (left, right) => left.priceUsd + left.shippingUsd - (right.priceUsd + right.shippingUsd)
  )[0];
  const merchant = getMerchant(offer.merchantId);
  const gas = estimateNetworkFee({ chain: normalizedChain, token: normalizedToken });
  const subtotalUsd = roundCurrency(offer.priceUsd);
  const shippingUsd = roundCurrency(offer.shippingUsd);
  const totalUsd = roundCurrency(subtotalUsd + shippingUsd + gas.gasUsd);
  const tokenAmount = fromUsd(totalUsd, normalizedToken);

  return {
    quoteId: `quote-${productId}-${offer.merchantId}-${normalizedToken}-${normalizedChain}`,
    productId: product.id,
    productName: product.name,
    region: region.toUpperCase(),
    merchantId: offer.merchantId,
    merchantName: merchant?.name ?? offer.merchantId,
    merchantTrustScore: merchant?.trustScore ?? 0,
    verifiedMerchant: merchant?.verifiedMerchant ?? false,
    token: normalizedToken,
    chain: normalizedChain,
    subtotalUsd,
    shippingUsd,
    gasUsd: roundCurrency(gas.gasUsd),
    totalUsd,
    tokenAmount:
      normalizedToken === "ETH" || normalizedToken === "AVAX"
        ? roundToken(tokenAmount)
        : roundCurrency(tokenAmount),
    credentialAccepted:
      Boolean(credential) && Boolean(merchant?.acceptsCredentialFlow),
    checkoutUrl: offer.productUrl,
    lineItems: [
      { label: "Product", amountUsd: subtotalUsd },
      { label: "Shipping", amountUsd: shippingUsd },
      { label: "Network fee", amountUsd: roundCurrency(gas.gasUsd) },
    ],
  };
}

export function getCatalogSnapshot() {
  return {
    products: PRODUCTS,
    merchants: MERCHANTS,
    offers: OFFERS,
    chains: Object.keys(CHAIN_FEES),
    currencies: Object.keys(CURRENCY_TO_USD),
  };
}
