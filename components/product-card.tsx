import Link from "next/link";
import { TierBadge } from "@/components/tier-badge";
import type { Product } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const cryptoColors: Record<string, string> = {
  ETH: "bg-blue-500/15 text-blue-300 border border-blue-500/20",
  AVAX: "bg-red-500/15 text-red-300 border border-red-500/20",
  USDC: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20",
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="block group">
      <div
        className={cn(
          "relative rounded-xl overflow-hidden",
          "bg-[#141414] border border-white/10",
          "transition-all duration-300",
          "hover:scale-[1.02] hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]"
        )}
      >
        {/* Tier badge — top-right corner */}
        <div className="absolute top-3 right-3 z-10">
          <TierBadge tier={product.tier} size="sm" />
        </div>

        {/* Product image */}
        <div className="aspect-[4/3] bg-[#1a1a1a] overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          />
        </div>

        {/* Card body */}
        <div className="p-4 space-y-3">
          {/* Category */}
          <span className="text-xs text-white/40 uppercase tracking-widest">
            {product.category}
          </span>

          {/* Product name */}
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-purple-300 transition-colors">
            {product.name}
          </h3>

          {/* Merchant */}
          <p className="text-white/40 text-xs">{product.merchantName}</p>

          {/* Price + crypto */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-white font-bold text-base">
              ${product.price.toFixed(2)}
            </span>
            <div className="flex gap-1">
              {product.acceptedCrypto.map((token) => (
                <span
                  key={token}
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    cryptoColors[token]
                  )}
                >
                  {token}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
