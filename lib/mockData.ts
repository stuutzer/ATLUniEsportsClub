export type Tier = "S" | "A" | "B";
export type CryptoToken = "ETH" | "AVAX" | "USDC";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tier: Tier;
  acceptedCrypto: CryptoToken[];
  merchantName: string;
  imageUrl: string;
  aiReasons: string[];
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

// TODO: Replace with Serper API search results
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Neural Pro Keyboard",
    description:
      "Mechanical keyboard with AI-optimized key mapping and haptic feedback. Perfect for power users and developers who demand precision.",
    price: 249.99,
    category: "Peripherals",
    tier: "S",
    acceptedCrypto: ["ETH", "AVAX", "USDC"],
    merchantName: "TechVault Store",
    imageUrl: "https://computerlounge.co.nz/cdn/shop/files/36f4ee3af51c83819f19ccfda709acc27354cc79_Wooting_60HE__1_grande.jpg?v=1729656519",
    aiReasons: [
      "Lowest total cost when accounting for gas fees on Avalanche",
      "Merchant has 99.2% trust score based on 3,400+ transactions",
      "Price is 18% below market average for equivalent specs",
    ],
  },
  {
    id: "2",
    name: "HoloDisplay 4K Monitor",
    description:
      "27-inch 4K OLED display with 144Hz refresh rate. Engineered for creative professionals and competitive gamers.",
    price: 899.0,
    category: "Displays",
    tier: "S",
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
    tier: "S",
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
    tier: "A",
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
    tier: "A",
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
    tier: "A",
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
    tier: "A",
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
    tier: "A",
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
    tier: "B",
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
    tier: "B",
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
    tier: "B",
    acceptedCrypto: ["ETH"],
    merchantName: "ThermalDAO",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNPDT0Tdq4C2M4OtBgP5aTCaRzfnt9UrEBZA&s",
    aiReasons: [
      "Competitive cooling performance; NFT display is novelty but not essential",
    ],
  },
  {
    id: "12",
    name: "Test Item",
    description:
      "240mm liquid CPU cooler with NFT-animated RGB display on the pump head. Quiet and efficient.",
    price: 0.01,
    category: "Cooling",
    tier: "B",
    acceptedCrypto: ["ETH", "dNZD"],
    merchantName: "ThermalDAO",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNPDT0Tdq4C2M4OtBgP5aTCaRzfnt9UrEBZA&s",
    aiReasons: [
      "Competitive cooling performance; NFT display is novelty but not essential",
    ],
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
    message: "Ranked 12 results S → A → B based on price, fees, and merchant trust.",
    type: "rank",
  },
  {
    id: "log9",
    timestamp: "14:23:14",
    message: "Top pick: Neural Pro Keyboard (S-tier) from TechVault Store.",
    type: "rank",
  },
  {
    id: "log10",
    timestamp: "14:23:15",
    message: "Ready. Awaiting user confirmation to proceed with purchase.",
    type: "info",
  },
];
