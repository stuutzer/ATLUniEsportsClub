"use client";

import { useState, useMemo } from "react";
import { mockProducts, type Tier, type CryptoToken } from "@/lib/mockData";
import { ProductCard } from "@/components/product-card";
import { TierBadge } from "@/components/tier-badge";
import { Zap, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const CATEGORIES = ["All", "Peripherals", "Displays", "Audio", "Storage", "Computing", "Accessories", "Smart Home", "Creative", "Cooling"];
const TIERS: Tier[] = ["S", "A", "B"];
const CRYPTOS: CryptoToken[] = ["ETH", "AVAX", "USDC"];

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTiers, setSelectedTiers] = useState<Tier[]>([]);
  const [selectedCryptos, setSelectedCryptos] = useState<CryptoToken[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return mockProducts
      .filter((p) => {
        if (q && !p.name.toLowerCase().includes(q.toLowerCase()) && !p.category.toLowerCase().includes(q.toLowerCase())) return false;
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
  }, [q, selectedCategory, selectedTiers, selectedCryptos, priceRange]);

  function toggleTier(tier: Tier) {
    setSelectedTiers((prev) => prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]);
  }

  function toggleCrypto(crypto: CryptoToken) {
    setSelectedCryptos((prev) => prev.includes(crypto) ? prev.filter((c) => c !== crypto) : [...prev, crypto]);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      {!q && (
        <div className="text-center mb-12 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/15 border border-purple-500/20 text-purple-400 text-xs font-medium mb-6">
            <Zap className="w-3 h-3" />
            AI-Powered Web3 Shopping
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Your AI Agent.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              Your Wallet.
            </span>
            <br />
            Every Purchase.
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Let your autonomous agent find, rank, and buy the best products — paying in crypto with the lowest fees.
          </p>
        </div>
      )}

      {q && (
        <div className="mb-6">
          <p className="text-white/50 text-sm">
            Showing results for <span className="text-white font-medium">&ldquo;{q}&rdquo;</span> — {filtered.length} products found
          </p>
        </div>
      )}

      <div className="flex gap-6">
        {/* Filter sidebar — desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0 space-y-6">
          <FilterPanel
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedTiers={selectedTiers}
            toggleTier={toggleTier}
            selectedCryptos={selectedCryptos}
            toggleCrypto={toggleCrypto}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />
        </aside>

        {/* Mobile filter toggle */}
        <div className="lg:hidden w-full mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-colors"
          >
            Filters
            <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
          </button>
          {showFilters && (
            <div className="mt-3 p-4 rounded-xl bg-[#141414] border border-white/10">
              <FilterPanel
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedTiers={selectedTiers}
                toggleTier={toggleTier}
                selectedCryptos={selectedCryptos}
                toggleCrypto={toggleCrypto}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
              />
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/30 text-lg">No products match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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

interface FilterPanelProps {
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedTiers: Tier[];
  toggleTier: (t: Tier) => void;
  selectedCryptos: CryptoToken[];
  toggleCrypto: (c: CryptoToken) => void;
  priceRange: [number, number];
  setPriceRange: (r: [number, number]) => void;
}

function FilterPanel({
  selectedCategory,
  setSelectedCategory,
  selectedTiers,
  toggleTier,
  selectedCryptos,
  toggleCrypto,
  priceRange,
  setPriceRange,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Category</p>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors",
                selectedCategory === cat
                  ? "bg-purple-600/20 text-purple-300"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tier */}
      <div>
        <p className="text-xs text-white/40 uppercase tracking-widest mb-3">AI Tier</p>
        <div className="flex flex-wrap gap-2">
          {TIERS.map((tier) => (
            <button key={tier} onClick={() => toggleTier(tier)}>
              <TierBadge
                tier={tier}
                size="sm"
                className={cn(
                  "cursor-pointer transition-opacity",
                  selectedTiers.length > 0 && !selectedTiers.includes(tier) && "opacity-30"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Accepted Crypto */}
      <div>
        <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Accepted Crypto</p>
        <div className="space-y-1">
          {CRYPTOS.map((crypto) => (
            <label key={crypto} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCryptos.includes(crypto)}
                onChange={() => toggleCrypto(crypto)}
                className="accent-purple-500"
              />
              <span
                className={cn(
                  "text-sm transition-colors",
                  selectedCryptos.includes(crypto) ? "text-white" : "text-white/50 group-hover:text-white/70"
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
        <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Price Range</p>
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={1000}
            step={10}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-xs text-white/40">
            <span>$0</span>
            <span className="text-purple-400 font-medium">${priceRange[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <MarketplaceContent />
    </Suspense>
  );
}
