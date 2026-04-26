"use client";

import { useState } from "react";
import { mockProducts, type Product } from "@/lib/mockData";
import { PriceBreakdown } from "@/components/price-breakdown";
import { PurchaseModal } from "@/components/purchase-modal";
import { notFound, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import { ArrowLeft, CheckCircle, Zap } from "lucide-react";
import Link from "next/link";

const cryptoColors: Record<string, string> = {
  ETH: "bg-blue-500/15 text-blue-300 border border-blue-500/20",
  AVAX: "bg-red-500/15 text-red-300 border border-red-500/20",
  USDC: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20",
};

// TODO: Replace with real wallet balances from wagmi
const mockBalances = {
  ETH: "0.4821",
  AVAX: "48.32",
  USDC: "312.00",
};

const hardcodedKeyboardProducts: Product[] = [
  {
    id: "kb-1",
    name: "Wooting 80HE",
    description:
      "Hall-effect magnetic switches with rapid trigger and premium aluminum build.",
    price: 199.0,
    category: "Peripherals",
    acceptedCrypto: ["USDC", "AVAX", "ETH"],
    merchantName: "Wooting Official",
    imageUrl: "/products/keyboards/wooting-80he.webp",
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
    acceptedCrypto: ["USDC", "ETH"],
    merchantName: "Keychron Store",
    imageUrl: "/products/keyboards/keychron-q1-max.jpg",
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
    acceptedCrypto: ["USDC", "AVAX"],
    merchantName: "NuPhy",
    imageUrl: "/products/keyboards/nuphy-halo75-v2.png",
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
    acceptedCrypto: ["USDC", "ETH"],
    merchantName: "Akko Global",
    imageUrl: "/products/keyboards/akko-mod-007b-he.png",
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
    acceptedCrypto: ["USDC", "AVAX", "ETH"],
    merchantName: "Razer",
    imageUrl: "/products/keyboards/razer-huntsman-v3-pro-tkl.webp",
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
    acceptedCrypto: ["USDC", "ETH"],
    merchantName: "Logitech G",
    imageUrl: "/products/keyboards/logitech-g-pro-x-tkl.png",
    aiReasons: [
      "Clean professional design with proven tournament-grade wireless stack.",
      "Strong battery life and reliable software profiles for travel setups.",
    ],
  },
];

export default function ProductPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const product =
    mockProducts.find((p) => p.id === params.id) ??
    hardcodedKeyboardProducts.find((p) => p.id === params.id);
  if (!product) notFound();

  const { address, isConnected } = useAccount();
  const [showModal, setShowModal] = useState(false);
  const from = searchParams.get("from");
  const backHref = from?.startsWith("/") ? from : "/agent";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showModal && (
        <PurchaseModal product={product} onClose={() => setShowModal(false)} />
      )}
      {/* Back */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Agent
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — product info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="rounded-xl overflow-hidden aspect-video bg-[#141414]">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <span className="text-xs text-white/40 uppercase tracking-widest">
                  {product.category}
                </span>
                <h1 className="text-2xl font-bold text-white mt-1">
                  {product.name}
                </h1>
                <p className="text-white/40 text-sm mt-1">
                  by {product.merchantName}
                </p>
              </div>
            </div>

            <p className="text-white/60 leading-relaxed">
              {product.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {product.acceptedCrypto.map((token) => (
                <span
                  key={token}
                  className={cn(
                    "text-sm font-medium px-3 py-1 rounded-full",
                    cryptoColors[token],
                  )}
                >
                  {token}
                </span>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <PriceBreakdown basePrice={product.price} />

          {/* Wallet status */}
          <div className="rounded-xl bg-[#141414] border border-white/10 p-4">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
              Wallet Balances
            </p>
            {isConnected ? (
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(mockBalances).map(([token, balance]) => (
                  <div
                    key={token}
                    className="text-center p-3 rounded-lg bg-white/3 border border-white/5"
                  >
                    <p className="text-white/40 text-xs mb-1">{token}</p>
                    {/* TODO: Replace with real wallet balances */}
                    <p className="text-white font-semibold text-sm">
                      {balance}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-sm">
                Connect wallet to view balances.
              </p>
            )}
          </div>
        </div>

        {/* Right — AI recommendation + CTA */}
        <div className="space-y-4">
          {/* Price card */}
          <div className="rounded-xl bg-[#141414] border border-white/10 p-5">
            <p className="text-white/40 text-sm mb-1">Base Price</p>
            <p className="text-3xl font-bold text-white">
              ${product.price.toFixed(2)}
            </p>
          </div>

          {/* AI Recommendation panel */}
          <div className="rounded-xl bg-sky-300/[0.06] border border-sky-200/[0.15] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-sky-200" />
              <p className="text-sky-200 font-semibold text-sm">
                AI Recommendation
              </p>
            </div>
            {/* TODO: Replace with Claude API ranking */}
            <ul className="space-y-3">
              {product.aiReasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-sky-200 flex-shrink-0 mt-0.5" />
                  <span className="text-white/70 text-sm leading-relaxed">
                    {reason}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <button
            onClick={() => setShowModal(true)}
            className={cn(
              "w-full py-4 rounded-full font-semibold text-base",
              "border border-white/[0.15] bg-sky-200 text-[#06131d] hover:bg-sky-100",
              "transition-all duration-200 shadow-[0_12px_32px_rgba(0,0,0,0.3)]",
              "flex items-center justify-center gap-2",
            )}
          >
            <Zap className="w-5 h-5" />
            Purchase with Agent
          </button>

          <button
            className={cn(
              "w-full py-3 rounded-full font-medium text-white/70 text-sm",
              "bg-white/5 hover:bg-white/10 border border-white/10",
              "transition-all duration-200",
            )}
          >
            Buy Manually
          </button>

          <p className="text-center text-xs text-white/30">
            Agent will select the cheapest network automatically
          </p>
        </div>
      </div>
    </div>
  );
}
