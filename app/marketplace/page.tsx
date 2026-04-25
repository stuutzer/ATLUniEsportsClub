"use client";

import { useState, useMemo } from "react";
import { mockProducts, type Tier, type CryptoToken } from "@/lib/mockData";
import { ProductCard } from "@/components/product-card";
import { TierBadge } from "@/components/tier-badge";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { buyItemButton} from "@/components/buy-item-button"

const CATEGORIES = ["All", "Peripherals", "Displays", "Audio", "Storage", "Computing", "Accessories", "Smart Home", "Creative", "Cooling"];
const TIERS: Tier[] = ["S", "A", "B"];
const CRYPTOS: CryptoToken[] = ["ETH", "AVAX", "USDC"];

export default function MarketplacePage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTiers, setSelectedTiers] = useState<Tier[]>([]);
  const [selectedCryptos, setSelectedCryptos] = useState<CryptoToken[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const filtered = useMemo(() => {
    return mockProducts
      .filter((p) => {
        if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !p.category.toLowerCase().includes(query.toLowerCase())) return false;
        if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
        if (selectedTiers.length > 0 && !selectedTiers.includes(p.tier)) return false;
        if (selectedCryptos.length > 0 && !selectedCryptos.some((c) => p.acceptedCrypto.includes(c))) return false;
        if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
        return true;
      })
      .sort((a, b) => {
        const tierOrder: Record<Tier, number> = { S: 0, A: 1, B: 2 };
        return tierOrder[a.tier] - tierOrder[b.tier];
      });
  }, [query, selectedCategory, selectedTiers, selectedCryptos, priceRange]);

  function toggleTier(tier: Tier) {
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  }

  function toggleCrypto(crypto: CryptoToken) {
    setSelectedCryptos((prev) =>
      prev.includes(crypto) ? prev.filter((c) => c !== crypto) : [...prev, crypto]
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      {/* Top bar — page title + search */}
      <div className="flex-shrink-0 px-8 pt-8 pb-6 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold text-white">Marketplace</h1>
            <p className="text-white/30 text-sm mt-0.5">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              {query && <span> for &ldquo;<span className="text-white/60">{query}</span>&rdquo;</span>}
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, categories, merchants…"
            className={cn(
              "w-full pl-11 pr-5 py-3 rounded-xl text-sm",
              "bg-[#161616] border border-white/[0.07] text-white placeholder:text-white/25",
              "focus:outline-none focus:border-purple-500/40 focus:bg-[#181818]",
              "transition-all duration-150"
            )}
          />
        </div>
      </div>

      {/* Body — filters + grid, both scroll together */}
      <div className="flex flex-1 overflow-y-auto min-h-0">

        {/* Filter panel */}
        <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 px-5 pt-6 pb-8 border-r border-white/[0.06] space-y-7">

          {/* Category */}
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2.5">Category</p>
            <div className="space-y-0.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors",
                    selectedCategory === cat
                      ? "bg-purple-600/15 text-purple-300"
                      : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* AI Tier */}
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2.5">AI Tier</p>
            <div className="flex flex-wrap gap-1.5">
              {TIERS.map((tier) => (
                <button key={tier} onClick={() => toggleTier(tier)}>
                  <TierBadge
                    tier={tier}
                    size="sm"
                    className={cn(
                      "cursor-pointer transition-opacity",
                      selectedTiers.length > 0 && !selectedTiers.includes(tier) && "opacity-25"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Accepted Crypto */}
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2.5">Payment</p>
            <div className="space-y-1.5">
              {CRYPTOS.map((crypto) => (
                <label key={crypto} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => toggleCrypto(crypto)}
                    className={cn(
                      "w-4 h-4 rounded flex items-center justify-center border transition-colors cursor-pointer",
                      selectedCryptos.includes(crypto)
                        ? "bg-purple-600 border-purple-600"
                        : "border-white/15 group-hover:border-white/30"
                    )}
                  >
                    {selectedCryptos.includes(crypto) && (
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm transition-colors",
                      selectedCryptos.includes(crypto) ? "text-white" : "text-white/40 group-hover:text-white/70"
                    )}
                  >
                    {crypto}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2.5">Max Price</p>
            <input
              type="range"
              min={0}
              max={1000}
              step={10}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full accent-purple-500 mb-2"
            />
            <div className="flex justify-between text-xs text-white/30">
              <span>$0</span>
              <span className="text-purple-400 font-medium">${priceRange[1]}</span>
            </div>
          </div>

        </aside>

        {/* Product grid */}
        <div className="flex-1 px-6 pt-6 pb-8">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-24">
              <p className="text-white/20 text-base mb-1">No products found</p>
              <p className="text-white/15 text-sm">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {/* TODO: populate grid with ranked results */}
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
