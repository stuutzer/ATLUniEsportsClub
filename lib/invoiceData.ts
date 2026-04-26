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
}>;

const MOCK_PRICES: Record<string, number> = {
  ETH: 3000,
  AVAX: 28,
  USDC: 1,
};

export function generateInvoiceData(txn: TxnInput): InvoiceData {
  const cleanAmount = (txn.amount || "0.240").replace(/[+\-,\s]/g, "");
  const amountNum = parseFloat(cleanAmount) || 0.24;
  const token = txn.token || "AVAX";
  const itemName = txn.productName || txn.item || "Product";
  const usdVal = (amountNum * (MOCK_PRICES[token] ?? 1)).toFixed(2);
  const resolvedUserENS = txn.userENS || DEMO_ENS_NAME;
  const resolvedUserName =
    txn.userName ||
    resolvedUserENS ||
    (txn.userWallet ? `${txn.userWallet.slice(0, 6)}...${txn.userWallet.slice(-4)}` : "User");

  return {
    invoiceNumber: `INV-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    issuedDate: txn.date || "April 25, 2025",
    dueDate: "Paid on Receipt",
    status:
      txn.status === "Completed" || txn.status === "delivered" ? "PAID" : "PENDING",

    agentName: "agentcart.eth",
    agentWallet: "0x1A2b3C4d5E6f7A8b9C0d1E2f3A4b5C6d7E8f9A0b",

    userName: resolvedUserName,
    userENS: resolvedUserENS,
    userWallet:
      txn.userWallet || "0xAbCd1234EfGh5678IjKl9012MnOp3456QrSt7890",
    userLocation: "Auckland, New Zealand",

    merchantName: txn.vendor || "AgentCart Marketplace",
    merchantWebsite: txn.vendorWebsite || "agentcart.eth",
    merchantWallet: "0xDEaD000000000000000042069000bEEF00000000",

    items: [
      {
        name: itemName,
        description:
          txn.productDescription ||
          "Purchased autonomously by AgentCart AI Agent",
        quantity: 1,
        unitPrice: `${cleanAmount} ${token}`,
        total: `${cleanAmount} ${token}`,
      },
    ],

    subtotal: `${cleanAmount} ${token}`,
    networkFee: `0.001 ${token}`,
    total: `${(amountNum + 0.001).toFixed(3)} ${token}`,
    totalUSD: `≈ $${usdVal} USD`,
    token,
    network: "Avalanche C-Chain",
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
