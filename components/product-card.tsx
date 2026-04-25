"use client";

import { useState } from "react";
import Link from "next/link";
import { TierBadge } from "@/components/tier-badge";
import { PurchaseModal } from "@/components/purchase-modal";
import type { Product } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import { BuyItemButton } from "@/components/buy-item-button";

const cryptoColors: Record<string, string> = {
  ETH: "bg-blue-500/15 text-blue-300 border border-blue-500/20",
  AVAX: "bg-red-500/15 text-red-300 border border-red-500/20",
  USDC: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20",
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "relative rounded-xl overflow-hidden group",
          "bg-[#141414] border border-white/[0.07]",
          "transition-all duration-300",
          "hover:border-purple-500/25 hover:shadow-[0_0_24px_rgba(124,58,237,0.12)]"
        )}
      >
        {/* Tier badge */}
        <div className="absolute top-3 right-3 z-10">
          <TierBadge tier={product.tier} size="sm" />
        </div>

        {/* Product image — links to detail */}
        <Link href={`/product/${product.id}`} className="block">
          <div className="aspect-[4/3] bg-[#1a1a1a] overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover opacity-75 group-hover:opacity-95 transition-opacity duration-300"
            />
          </div>
        </Link>

        {/* Card body */}
        <div className="p-4">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">
            {product.category}
          </span>

          <Link href={`/product/${product.id}`} className="block mt-1 mb-1">
            <h3 className="text-white/90 font-semibold text-sm leading-snug line-clamp-2 hover:text-purple-300 transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="text-white/30 text-xs mb-3">{product.merchantName}</p>

          {/* Price row */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-bold text-base">
              ${product.price.toFixed(2)}
            </span>
            <div className="flex gap-1">
              {product.acceptedCrypto.map((token) => (
                <span
                  key={token}
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                    cryptoColors[token]
                  )}
                >
                  {token}
                </span>
              ))}
            </div>
          </div>

          {/* Agent purchase button */}
          <button
            onClick={() => setModalOpen(true)}
            className={cn(
              "w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium",
              "bg-purple-600/10 border border-purple-500/20 text-purple-300",
              "hover:bg-purple-600/20 hover:border-purple-500/40 hover:text-purple-200",
              "transition-all duration-150"
            )}
          >
            <Bot className="w-3.5 h-3.5" />
            Let Agent Purchase
          </button>
          <div className="mt-auto">
            <BuyItemButton product={product} />
          </div>
        </div>
      </div>

      {modalOpen && (
        <PurchaseModal product={product} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
