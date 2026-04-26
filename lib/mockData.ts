export type CryptoToken = "ETH" | "AVAX" | "USDC" | "dNZD";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  acceptedCrypto: CryptoToken[];
  merchantName: string;
  imageUrl: string;
  aiReasons: string[];
  requiresFiatExchange?: boolean;
}

export interface PurchaseHistory {
  id: string;
  date: string;
  item: string;
  amountPaid: number;
  tokenUsed: CryptoToken;
  status: "Completed" | "Pending" | "Failed";
}

export interface AgentLog {
  id: string;
  timestamp: string;
  message: string;
  type: "search" | "compare" | "rank" | "info";
}

export type TransactionStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered";

export interface TransactionStep {
  label: string;
  time?: string;
  done: boolean;
}

export interface Transaction {
  id: string;
  productName: string;
  vendor: string;
  amount: string;
  token: string;
  status: TransactionStatus;
  steps: TransactionStep[];
}

// TODO: Replace with Serper API search results
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Neural Pro Keyboard",
    description:
      "Mechanical keyboard with AI-optimized key mapping and haptic feedback. Perfect for power users and developers who demand precision.",
    price: 249.99,
    category: "Peripherals",
    acceptedCrypto: ["ETH", "AVAX", "USDC"],
    merchantName: "Newegg",
    imageUrl: "/products/keyboards/neural-pro-keyboard.webp",
    aiReasons: [
      "Newegg is the best checkout path because it supports crypto payments through a crypto payment processor.",
      "Lowest total cost when accounting for gas fees on Avalanche.",
      "Price is 18% below market average for equivalent specs.",
    ],
  },
  {
    id: "2",
    name: "HoloDisplay 4K Monitor",
    description:
      "27-inch 4K OLED display with 144Hz refresh rate. Engineered for creative professionals and competitive gamers.",
    price: 899.0,
    category: "Displays",
    acceptedCrypto: ["ETH", "USDC"],
    merchantName: "PixelForge",
    imageUrl: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/peripherals/monitors/aw-series/aw3225qf/pdp/monitor-alienware-aw3225qf-hero.psd?fmt=jpg&wid=756&hei=525",
    aiReasons: [
      "Best-in-class display specs for the price point",
      "Merchant consistently ships within 24 hours",
      "USDC payment eliminates ETH volatility risk",
    ],
  },
  {
    id: "3",
    name: "AuraSound ANC Headset",
    description:
      "Studio-grade wireless headset with active noise cancellation and spatial audio. 40-hour battery life.",
    price: 329.5,
    category: "Audio",
    acceptedCrypto: ["AVAX", "USDC"],
    merchantName: "SoundSphere",
    imageUrl: "https://www.magnumsound.nz/cdn/shop/files/sennheiser-hd-800s-audiophile-headphones-1900_grande.png?v=1691636446",
    aiReasons: [
      "AVAX gas fees are 94% lower than Ethereum for this transaction",
      "Highest user satisfaction rating in the audio category",
      "Exclusive Web3 merchant discount applied automatically",
    ],
  },
  {
    id: "4",
    name: "Quantum SSD 2TB",
    description:
      "NVMe Gen5 SSD with 12,000 MB/s read speeds. Built for AI workloads and high-frequency data processing.",
    price: 189.99,
    category: "Storage",
    acceptedCrypto: ["ETH", "AVAX", "USDC"],
    merchantName: "DataStream Co.",
    imageUrl: "https://www.pbtech.co.nz/imgprod/H/D/HDDSAM993110__7.jpg",
    aiReasons: [
      "Excellent performance-to-price ratio for NVMe Gen5",
      "Merchant verified on-chain with 2-year escrow history",
    ],
  },
  {
    id: "5",
    name: "CryptoMouse Pro",
    description:
      "High-precision gaming mouse with 32,000 DPI sensor and onboard AI gesture recognition. Connects to Web3 wallets natively.",
    price: 119.0,
    category: "Peripherals",
    acceptedCrypto: ["ETH", "USDC"],
    merchantName: "GearForge",
    imageUrl: "https://resource.logitechg.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/pro-x2-superstrike-pdp/2026/pro-x2-superstrike-top-angle-lifestyle-gallery-2.png",
    aiReasons: [
      "Unique Web3-native feature set not found in competing products",
      "Price competitive with traditional retail despite crypto-only payment",
    ],
  },
  {
    id: "6",
    name: "EdgeServer Mini",
    description:
      "Compact home server with 16-core ARM processor. Run AI models and dApps locally with zero cloud dependency.",
    price: 549.0,
    category: "Computing",
    acceptedCrypto: ["ETH", "AVAX"],
    merchantName: "NodeNest",
    imageUrl: "https://images.prismic.io/frameworkmarketplace/Z7foP57c43Q3gCiV_fwdesktop_family_overview_panel_translucent.jpg?auto=format,compress",
    aiReasons: [
      "Best option for on-premises AI inference at this price",
      "AVAX payment recommended to minimize total cost",
    ],
  },
  {
    id: "7",
    name: "SmartDesk Controller",
    description:
      "IoT hub for smart desk setups. Integrates with 200+ devices and supports blockchain-verified automation scripts.",
    price: 79.99,
    category: "Smart Home",
    acceptedCrypto: ["USDC"],
    merchantName: "HomeChain",
    imageUrl: "https://images.svc.ui.com/?u=https%3A%2F%2Fui.com%2Fmicrosite%2Fstatic%2Fefg-img-NfeWmma7.jpg&q=75&w=1152",
    aiReasons: [
      "USDC-only merchant offers 5% loyalty discount on repeat purchases",
      "Broad device compatibility reduces future upgrade costs",
    ],
  },
  {
    id: "8",
    name: "NeuraLink Webcam 4K",
    description:
      "4K webcam with built-in AI background removal and face tracking. No software installation required.",
    price: 149.0,
    category: "Peripherals",
    acceptedCrypto: ["ETH", "AVAX", "USDC"],
    merchantName: "VisionTech",
    imageUrl: "https://resource.logitech.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/products/logitech/webcams/c270-hd-webcam/gallery/c270-hd-webcam-1-0224.png",
    aiReasons: [
      "Hardware AI processing eliminates privacy concerns of cloud-based alternatives",
      "All three tokens accepted for maximum payment flexibility",
    ],
  },
  {
    id: "9",
    name: "BlockPad Drawing Tablet",
    description:
      "Digital drawing tablet with blockchain-based artwork provenance tracking. 8192 pressure levels, tilt support.",
    price: 219.0,
    category: "Creative",
    acceptedCrypto: ["ETH", "USDC"],
    merchantName: "CreativeChain",
    imageUrl: "https://cdn-media.wacom.com/-/media/images/products/pen-tablets/wacom-intuos/media-gallery/wacom-intuos-g7.jpg?h=640&iar=0&w=960&rev=b1aa3facbf3d4e2dae7215ea65c8b264&hash=21A48C38D7C6AB00E88407D5033F771D",
    aiReasons: [
      "Niche product with solid specs for the target use case",
    ],
  },
  {
    id: "10",
    name: "TokenTracks USB Hub",
    description:
      "7-port USB-C hub with hardware wallet passthrough and real-time transaction verification LED indicators.",
    price: 59.99,
    category: "Accessories",
    acceptedCrypto: ["AVAX", "USDC"],
    merchantName: "HubWorld",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDhraB6vM5hqXKCkCFFOsm1CQIASxLtaZBxA&s",
    aiReasons: [
      "Functional and affordable for Web3 desktop setups",
    ],
  },
  {
    id: "11",
    name: "ChainCooler RGB",
    description:
      "240mm liquid CPU cooler with NFT-animated RGB display on the pump head. Quiet and efficient.",
    price: 139.0,
    category: "Cooling",
    acceptedCrypto: ["ETH"],
    merchantName: "ThermalDAO",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNPDT0Tdq4C2M4OtBgP5aTCaRzfnt9UrEBZA&s",
    aiReasons: [
      "Competitive cooling performance; NFT display is novelty but not essential",
    ],
  },
  {
    id: "12",
    name: "Keyboard Test Item",
    description:
      "Low-value keyboard listing for testing Base Sepolia dNZD deduction and MetaMask confirmation flows.",
    price: 0.01,
    category: "Peripherals",
    acceptedCrypto: ["dNZD", "USDC", "ETH"],
    merchantName: "Quarter Test Merchant",
    imageUrl: "/products/keyboards/neural-pro-keyboard.webp",
    aiReasons: [
      "Purpose-built for safe purchase testing with a tiny dNZD amount.",
    ],
  },
  {
    id: "grocery-1",
    name: "Royal Gala Apples 1kg",
    description:
      "Fresh New Zealand Royal Gala apples for a normal weekly fruit restock.",
    price: 4.99,
    category: "Groceries",
    acceptedCrypto: ["USDC"],
    merchantName: "Countdown",
    imageUrl:
      "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=900&q=80",
    aiReasons: [
      "Good everyday fruit option from a New Zealand supermarket.",
      "Requires a crypto-to-fiat exchange because Countdown does not accept crypto directly.",
    ],
    requiresFiatExchange: true,
  },
  {
    id: "grocery-2",
    name: "Pams Toilet Tissue 12 Pack",
    description:
      "Household toilet paper pack suitable for a weekly essentials order.",
    price: 8.49,
    category: "Groceries",
    acceptedCrypto: ["USDC"],
    merchantName: "New World",
    imageUrl:
      "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&w=900&q=80",
    aiReasons: [
      "Practical household essential from a New Zealand grocery retailer.",
      "Quarter needs to exchange crypto to fiat before checkout with New World.",
    ],
    requiresFiatExchange: true,
  },
  {
    id: "grocery-3",
    name: "Anchor Blue Milk 2L",
    description:
      "Two-litre bottle of standard blue milk for fridge restocking.",
    price: 3.99,
    category: "Groceries",
    acceptedCrypto: ["USDC"],
    merchantName: "Countdown",
    imageUrl:
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=900&q=80",
    aiReasons: [
      "Common fresh grocery staple available through Countdown.",
      "Checkout uses fiat rails, so the payment flow includes an exchange step.",
    ],
    requiresFiatExchange: true,
  },
  {
    id: "grocery-4",
    name: "Freya's Soy & Linseed Bread",
    description:
      "Sliced soy and linseed bread for sandwiches, toast, and pantry basics.",
    price: 4.79,
    category: "Groceries",
    acceptedCrypto: ["USDC"],
    merchantName: "New World",
    imageUrl:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
    aiReasons: [
      "Useful staple for a realistic New Zealand grocery basket.",
      "New World checkout requires a fiat exchange step before fulfilment.",
    ],
    requiresFiatExchange: true,
  },
  {
    id: "grocery-5",
    name: "Free Range Eggs 12 Pack",
    description:
      "Dozen free range eggs for breakfast, baking, and weekly meal prep.",
    price: 9.29,
    category: "Groceries",
    acceptedCrypto: ["USDC"],
    merchantName: "Countdown",
    imageUrl:
      "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=900&q=80",
    aiReasons: [
      "High-utility fridge item for a normal household grocery order.",
      "Countdown receives fiat after Quarter exchanges the crypto settlement.",
    ],
    requiresFiatExchange: true,
  },
];

// TODO: Replace with real wallet purchase history
export const mockPurchaseHistory: PurchaseHistory[] = [
  {
    id: "tx1",
    date: "2025-04-18",
    item: "Neural Pro Keyboard",
    amountPaid: 249.99,
    tokenUsed: "AVAX",
    status: "Completed",
  },
  {
    id: "tx2",
    date: "2025-04-10",
    item: "AuraSound ANC Headset",
    amountPaid: 329.5,
    tokenUsed: "USDC",
    status: "Completed",
  },
  {
    id: "tx3",
    date: "2025-03-29",
    item: "Quantum SSD 2TB",
    amountPaid: 189.99,
    tokenUsed: "ETH",
    status: "Completed",
  },
  {
    id: "tx4",
    date: "2025-03-15",
    item: "TokenTracks USB Hub",
    amountPaid: 59.99,
    tokenUsed: "AVAX",
    status: "Completed",
  },
  {
    id: "tx5",
    date: "2025-03-02",
    item: "Ledger Vault Case",
    amountPaid: 45.0,
    tokenUsed: "USDC",
    status: "Completed",
  },
];

// TODO: Replace with Claude API ranking output
export const mockAgentLog: AgentLog[] = [
  {
    id: "log1",
    timestamp: "14:23:01",
    message: "Initializing agent session...",
    type: "info",
  },
  {
    id: "log2",
    timestamp: "14:23:02",
    message: "Searching web for best price on 'mechanical keyboard'...",
    type: "search",
  },
  {
    id: "log3",
    timestamp: "14:23:04",
    message: "Found 47 results across 12 merchants.",
    type: "info",
  },
  {
    id: "log4",
    timestamp: "14:23:05",
    message: "Filtering results by accepted crypto: ETH, AVAX, USDC.",
    type: "info",
  },
  {
    id: "log5",
    timestamp: "14:23:07",
    message: "Comparing gas fees across Ethereum and Avalanche C-Chain...",
    type: "compare",
  },
  {
    id: "log6",
    timestamp: "14:23:09",
    message: "Avalanche fees 94% lower than Ethereum for transactions under $500.",
    type: "compare",
  },
  {
    id: "log7",
    timestamp: "14:23:11",
    message: "Verifying merchant trust scores via on-chain history...",
    type: "info",
  },
  {
    id: "log8",
    timestamp: "14:23:13",
    message: "Ranked 12 results based on price, fees, and merchant trust.",
    type: "rank",
  },
  {
    id: "log9",
    timestamp: "14:23:14",
    message: "Top pick: Neural Pro Keyboard from Newegg.",
    type: "rank",
  },
  {
    id: "log10",
    timestamp: "14:23:15",
    message: "Ready. Awaiting user confirmation to proceed with purchase.",
    type: "info",
  },
];
