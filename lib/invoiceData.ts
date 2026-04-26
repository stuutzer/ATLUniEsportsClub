import { DEMO_ENS_NAME } from "@/lib/demoIdentity";

export interface InvoiceItem {
  name: string;
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string;
  status: "PAID" | "PENDING";

  agentName: string;
  agentWallet: string;

  userName: string;
  userENS: string;
  userWallet: string;
  userLocation: string;

  merchantName: string;
  merchantWebsite: string;
  merchantWallet: string;

  items: InvoiceItem[];

  subtotal: string;
  networkFee: string;
  total: string;
  totalUSD: string;
  token: string;
  network: string;
  txHash: string;
  blockNumber: string;
}

type TxnInput = Partial<{
  id: string;
  date: string;
  item: string;
  productName: string;
  amount: string;
  token: string;
  hash: string;
  status: string;
  vendor: string;
  vendorWebsite: string;
  userName: string;
  userENS: string;
  userWallet: string;
  productDescription: string;
  agentName: string;
  lineItems: {
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
}>;

const MOCK_PRICES: Record<string, number> = {
  ETH: 2320,
  AVAX: 9.30,
  USDC: 1,
};

const MERCHANT_DETAILS: Record<string, { name: string; website: string }> = {
  "Newegg":          { name: "Newegg",          website: "newegg.com" },
  "Crypto Emporium": { name: "Crypto Emporium",  website: "cryptoemporium.eu" },
  "ShopinBit":       { name: "ShopinBit",        website: "shopinbit.com" },
  "Countdown":       { name: "Countdown",        website: "countdown.co.nz" },
  "New World":       { name: "New World",        website: "newworld.co.nz" },
  "PB Tech":         { name: "PB Tech",          website: "pbtech.co.nz" },
  "Mercury Energy":  { name: "Mercury Energy",   website: "mercury.co.nz" },
  "PixelForge":      { name: "PixelForge",       website: "pixelforge.io" },
  "SoundSphere":     { name: "SoundSphere",      website: "soundsphere.io" },
  "DataStream Co.":  { name: "DataStream Co.",   website: "datastreamco.io" },
  "GearForge":       { name: "GearForge",        website: "gearforge.io" },
  "NodeNest":        { name: "NodeNest",         website: "nodenest.io" },
  "HomeChain":       { name: "HomeChain",        website: "homechain.io" },
  "VisionTech":      { name: "VisionTech",       website: "visiontech.io" },
  "CreativeChain":   { name: "CreativeChain",    website: "creativechain.io" },
  "HubWorld":        { name: "HubWorld",         website: "hubworld.io" },
  "ThermalDAO":      { name: "ThermalDAO",       website: "thermaldao.io" },
  "Razer":           { name: "Razer",            website: "razer.com" },
  "Logitech G":      { name: "Logitech G",       website: "logitechg.com" },
  "Wooting":         { name: "Wooting",          website: "wooting.io" },
};

const ITEM_MERCHANT_MAP: Record<string, string> = {
  "MSI GeForce RTX 4090 24GB":          "PB Tech",
  "Mercury Energy Bill (Auto-paid)":    "Mercury Energy",
  "Neural Pro Keyboard":                "Newegg",
  "Wooting 80HE":                       "Newegg",
  "Keychron Q1 Max":                    "Crypto Emporium",
  "NuPhy Halo75 V2":                    "ShopinBit",
  "Akko MOD 007B HE":                   "Crypto Emporium",
  "Razer Huntsman V3 Pro TKL":          "Newegg",
  "Logitech G PRO X TKL Lightspeed":    "Crypto Emporium",
  "HoloDisplay 4K Monitor":             "PixelForge",
  "AuraSound ANC Headset":              "SoundSphere",
  "Quantum SSD 2TB":                    "DataStream Co.",
  "CryptoMouse Pro":                    "GearForge",
  "EdgeServer Mini":                    "NodeNest",
  "SmartDesk Controller":               "HomeChain",
  "NeuraLink Webcam 4K":                "VisionTech",
  "BlockPad Drawing Tablet":            "CreativeChain",
  "TokenTracks USB Hub":                "HubWorld",
  "ChainCooler RGB":                    "ThermalDAO",
  "Royal Gala Apples 1kg":              "Countdown",
  "Pams Toilet Tissue 12 Pack":         "New World",
  "Anchor Blue Milk 2L":                "Countdown",
  "Freya's Soy & Linseed Bread":        "New World",
  "Free Range Eggs 12 Pack":            "Countdown",
};

export function generateInvoiceData(txn: TxnInput): InvoiceData {
  const cleanAmount = (txn.amount || "0.240").replace(/[+\-,\s]/g, "");
  const amountNum = parseFloat(cleanAmount) || 0.24;
  const token = txn.token || "AVAX";
  const itemName = txn.productName || txn.item || "Product";
  const invoiceItems: InvoiceItem[] =
    txn.lineItems && txn.lineItems.length > 0
      ? txn.lineItems.map((line) => ({
          name: line.name,
          description:
            txn.productDescription ||
            "Purchased autonomously by Quarter AI Agent",
          quantity: line.quantity,
          unitPrice: `${line.unitPrice.toFixed(2)} ${token}`,
          total: `${(line.unitPrice * line.quantity).toFixed(2)} ${token}`,
        }))
      : [
          {
            name: itemName,
            description:
              txn.productDescription ||
              "Purchased autonomously by Quarter AI Agent",
            quantity: 1,
            unitPrice: `${cleanAmount} ${token}`,
            total: `${cleanAmount} ${token}`,
          },
        ];
  const subtotalNum =
    txn.lineItems && txn.lineItems.length > 0
      ? txn.lineItems.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
      : amountNum;
  const usdVal = (amountNum * (MOCK_PRICES[token] ?? 1)).toFixed(2);
  const resolvedUserENS = txn.userENS || DEMO_ENS_NAME;
  const resolvedUserName =
    txn.userName ||
    resolvedUserENS ||
    (txn.userWallet ? `${txn.userWallet.slice(0, 6)}...${txn.userWallet.slice(-4)}` : "User");

  const vendorKey = txn.vendor || ITEM_MERCHANT_MAP[itemName] || "";
  const merchantInfo = MERCHANT_DETAILS[vendorKey];

  return {
    invoiceNumber: `INV-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    issuedDate: txn.date || "April 25, 2025",
    dueDate: "Paid on Receipt",
    status:
      txn.status === "Completed" || txn.status === "delivered" ? "PAID" : "PENDING",

    agentName: txn.agentName || "quarter.eth",
    agentWallet: "0x1A2b3C4d5E6f7A8b9C0d1E2f3A4b5C6d7E8f9A0b",

    userName: resolvedUserName,
    userENS: resolvedUserENS,
    userWallet:
      txn.userWallet || "0xAbCd1234EfGh5678IjKl9012MnOp3456QrSt7890",
    userLocation: "Auckland, New Zealand",

    merchantName: merchantInfo?.name || txn.vendor || "Quarter Marketplace",
    merchantWebsite: txn.vendorWebsite || merchantInfo?.website || "quarter.eth",
    merchantWallet: "0xDEaD000000000000000042069000bEEF00000000",

    items: invoiceItems,

    subtotal: `${subtotalNum.toFixed(2)} ${token}`,
    networkFee: `0.001 ${token}`,
    total: `${(subtotalNum + 0.001).toFixed(3)} ${token}`,
    totalUSD: `≈ $${usdVal} USD`,
    token,
    network: "Base Sepolia Testnet",
    txHash:
      txn.hash ||
      "0x3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a",
    blockNumber: "12845673",
  };
}

export function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function buildFilename(invoiceData: InvoiceData): string {
  const sanitize = (s: string) =>
    s
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  const name = invoiceData.items[0]?.name || "Invoice";
  return `${sanitize(name)}_${sanitize(invoiceData.issuedDate)}.pdf`;
}
