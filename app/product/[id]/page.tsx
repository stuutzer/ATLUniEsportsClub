"use client";

import { mockProducts } from "@/lib/mockData";
import { TierBadge } from "@/components/tier-badge";
import { PriceBreakdown } from "@/components/price-breakdown";
import { notFound } from "next/navigation";
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

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = mockProducts.find((p) => p.id === params.id);
  if (!product) notFound();

  const { address, isConnected } = useAccount();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
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
                <span className="text-xs text-white/40 uppercase tracking-widest">{product.category}</span>
                <h1 className="text-2xl font-bold text-white mt-1">{product.name}</h1>
                <p className="text-white/40 text-sm mt-1">by {product.merchantName}</p>
              </div>
              <TierBadge tier={product.tier} size="lg" />
            </div>

            <p className="text-white/60 leading-relaxed">{product.description}</p>

            <div className="flex flex-wrap gap-2 mt-4">
              {product.acceptedCrypto.map((token) => (
                <span
                  key={token}
                  className={cn("text-sm font-medium px-3 py-1 rounded-full", cryptoColors[token])}
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
            <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Wallet Balances</p>
            {isConnected ? (
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(mockBalances).map(([token, balance]) => (
                  <div key={token} className="text-center p-3 rounded-lg bg-white/3 border border-white/5">
                    <p className="text-white/40 text-xs mb-1">{token}</p>
                    {/* TODO: Replace with real wallet balances */}
                    <p className="text-white font-semibold text-sm">{balance}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-sm">Connect wallet to view balances.</p>
            )}
          </div>
        </div>

        {/* Right — AI recommendation + CTA */}
        <div className="space-y-4">
          {/* Price card */}
          <div className="rounded-xl bg-[#141414] border border-white/10 p-5">
            <p className="text-white/40 text-sm mb-1">Base Price</p>
            <p className="text-3xl font-bold text-white">${product.price.toFixed(2)}</p>
          </div>

          {/* AI Recommendation panel */}
          <div className="rounded-xl bg-purple-600/10 border border-purple-500/20 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-purple-400" />
              <p className="text-purple-300 font-semibold text-sm">AI Recommendation</p>
              <TierBadge tier={product.tier} size="sm" className="ml-auto" />
            </div>
            {/* TODO: Replace with Claude API ranking */}
            <ul className="space-y-3">
              {product.aiReasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/70 text-sm leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          {/* TODO: Trigger agent purchasing flow here */}
          <button
            className={cn(
              "w-full py-4 rounded-full font-semibold text-white text-base",
              "bg-purple-600 hover:bg-purple-700",
              "transition-all duration-200 hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]",
              "flex items-center justify-center gap-2"
            )}
          >
            <Zap className="w-5 h-5" />
            Let Agent Purchase
          </button>

          <button
            className={cn(
              "w-full py-3 rounded-full font-medium text-white/70 text-sm",
              "bg-white/5 hover:bg-white/10 border border-white/10",
              "transition-all duration-200"
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
