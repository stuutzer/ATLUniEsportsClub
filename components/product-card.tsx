"use client";

import { useState } from "react";
import { Check, ClipboardList, Plus, ShieldCheck, Truck, X } from "lucide-react";
import { BuyItemButton } from "@/components/buy-item-button";
import { PlaceOrderModal } from "@/components/place-order-modal";
import { useCart } from "@/context/CartContext";
import type { AgentRecommendation } from "@/lib/agent-types";
import type { Product } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const tokenStyles: Record<
  string,
  { mark: string; markClass: string; textClass: string }
> = {
  ETH: {
    mark: "E",
    markClass: "bg-blue-400/10 text-blue-200 ring-blue-300/25",
    textClass: "text-blue-100",
  },
  AVAX: {
    mark: "A",
    markClass: "bg-red-400/10 text-red-200 ring-red-300/25",
    textClass: "text-red-100",
  },
  USDC: {
    mark: "$",
    markClass: "bg-emerald-400/10 text-emerald-200 ring-emerald-300/25",
    textClass: "text-emerald-100",
  },
};

interface ProductCardProps {
  product: Product;
  recommendation?: AgentRecommendation;
}

const merchantMarks: Record<string, { initials: string; className: string }> = {
  Newegg: {
    initials: "NE",
    className: "from-cyan-400 to-blue-600 text-white shadow-cyan-950/30",
  },
  "Crypto Emporium": {
    initials: "CE",
    className: "from-emerald-300 to-teal-700 text-white shadow-emerald-950/30",
  },
  ShopinBit: {
    initials: "SB",
    className: "from-amber-300 to-yellow-700 text-black shadow-yellow-950/30",
  },
  Countdown: {
    initials: "CD",
    className: "from-green-300 to-emerald-700 text-white shadow-emerald-950/30",
  },
  "New World": {
    initials: "NW",
    className: "from-red-300 to-rose-700 text-white shadow-rose-950/30",
  },
};

function formatChain(chain: string) {
  const chainLabels: Record<string, string> = {
    base: "Base",
    avalanche: "Avalanche",
    ethereum: "Ethereum",
    "Base Sepolia": "Base Sepolia",
    "Avalanche C-Chain": "Avalanche",
  };

  return chainLabels[chain] ?? chain;
}

function getSupportedChains(product: Product, recommendation?: AgentRecommendation) {
  if (product.name === "Neural Pro Keyboard") {
    return ["base", "avalanche", "ethereum"];
  }

  return recommendation?.chain ? [recommendation.chain] : [];
}

function getMerchantMark(merchantName: string) {
  return (
    merchantMarks[merchantName] ?? {
      initials: merchantName
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      className: "from-white/20 to-white/5 text-white shadow-black/20",
    }
  );
}

function TokenBadge({ token }: { token: string }) {
  const tokenStyle =
    tokenStyles[token] ?? {
      mark: token.slice(0, 2).toUpperCase(),
      markClass: "bg-white/10 text-white/80 ring-white/15",
      textClass: "text-white/70",
    };

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.035] py-1 pl-1 pr-2 text-[10px] font-semibold tracking-wide shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <span
        className={cn(
          "flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[8px] font-black leading-none ring-1",
          tokenStyle.markClass
        )}
      >
        {tokenStyle.mark}
      </span>
      <span className={tokenStyle.textClass}>{token}</span>
    </span>
  );
}

function ChainBadge({ chain }: { chain: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/[0.07] bg-white/[0.035] px-2 py-1 text-[10px] font-medium text-white/60">
      {formatChain(chain)}
    </span>
  );
}

export function ProductCard({ product, recommendation }: ProductCardProps) {
  const { addItem, items: cartItems } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const inCart = cartItems.some((i) => i.product.id === product.id);

  const handleAddToCart = () => {
    addItem(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  const merchantName = recommendation?.product.merchantName ?? product.merchantName;
  const merchantMark = getMerchantMark(merchantName);
  const subtotalUsd = recommendation?.subtotalUsd ?? product.price;
  const shippingUsd =
    product.name === "Neural Pro Keyboard" ? 12 : recommendation?.shippingUsd ?? 0;
  const totalUsd =
    product.name === "Neural Pro Keyboard"
      ? 261.99
      : recommendation?.totalUsd ?? subtotalUsd + shippingUsd;
  const acceptedTokens =
    product.name === "Neural Pro Keyboard"
      ? (["ETH", "AVAX", "USDC"] as const)
      : product.acceptedCrypto;
  const supportedChains = getSupportedChains(product, recommendation);
  const agentNote =
    recommendation?.reasoning[0] ??
    "Balanced pick based on price, merchant trust, and checkout flexibility.";

  return (
    <>
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl group",
        "bg-[#121212] border border-white/[0.08]",
        "transition-all duration-300",
        "hover:border-sky-300/20 hover:shadow-[0_18px_44px_rgba(0,0,0,0.32)]"
      )}
    >
      <button
        type="button"
        onClick={() => setQuickViewOpen(true)}
        className="block cursor-pointer text-left"
      >
        <div className="aspect-[4/3] overflow-hidden bg-[#1a1a1a]">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
          />
        </div>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-[10px] uppercase tracking-widest text-white/30">
          {product.category}
        </span>
        <h3 className="mt-1 mb-3 line-clamp-2 text-sm font-semibold leading-snug text-white/90">
          {product.name}
        </h3>

        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-[11px] font-black shadow-lg",
              merchantMark.className
            )}
          >
            {merchantMark.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white/80">{merchantName}</p>
            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-sky-200/70">
              <ShieldCheck className="h-3 w-3" />
              <span>{recommendation?.trustScore ?? 99}/100 merchant trust</span>
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-white/[0.07] bg-black/20 p-3">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-sky-200/45">
                Landed total
              </p>
              <p className="mt-1 text-lg font-bold text-white">
                ${totalUsd.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1.5 text-right">
              <p className="text-[10px] text-white/35">Item</p>
              <p className="text-xs font-medium text-white/75">
                ${subtotalUsd.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.06] pt-2 text-xs">
            <span className="flex items-center gap-1.5 text-white/40">
              <Truck className="h-3.5 w-3.5" />
              Shipping
            </span>
            <span className="font-medium text-white/70">${shippingUsd.toFixed(2)}</span>
          </div>
        </div>

        <div className="mb-4 space-y-3">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
            <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-white/35">
              Accepted assets
            </p>
            <div className="flex flex-wrap gap-1.5">
              {acceptedTokens.map((token) => (
                <TokenBadge key={token} token={token} />
              ))}
            </div>
          </div>

          {supportedChains.length > 0 && (
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
              <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-white/35">
                Routes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {supportedChains.map((chain) => (
                  <ChainBadge key={chain} chain={chain} />
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-sky-300/[0.09] bg-sky-300/[0.035] px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-sky-200/45">
              Agent note
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/55">
              {agentNote}
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <BuyItemButton product={product} shippingUsd={shippingUsd} />
          <button
            onClick={handleAddToCart}
            className={cn(
              "w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors duration-200",
              justAdded
                ? "border border-emerald-300/25 bg-emerald-300/10 text-emerald-200"
                : inCart
                ? "border border-sky-300/20 bg-sky-300/10 text-sky-200 hover:bg-sky-300/15"
                : "border border-white/[0.10] bg-transparent text-white/65 hover:bg-white/[0.06] hover:text-white"
            )}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added to cart
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                {inCart ? "Add another" : "Add to cart"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>

    {quickViewOpen && (
      <ProductQuickView
        product={product}
        merchantName={merchantName}
        merchantMark={merchantMark}
        totalUsd={totalUsd}
        subtotalUsd={subtotalUsd}
        shippingUsd={shippingUsd}
        acceptedTokens={[...acceptedTokens]}
        supportedChains={supportedChains}
        agentNote={agentNote}
        inCart={inCart}
        justAdded={justAdded}
        onAddToCart={handleAddToCart}
        onPlaceOrder={() => {
          setQuickViewOpen(false);
          setOrderModalOpen(true);
        }}
        onClose={() => setQuickViewOpen(false)}
      />
    )}
    {orderModalOpen && (
      <PlaceOrderModal product={product} onClose={() => setOrderModalOpen(false)} />
    )}
    </>
  );
}

function ProductQuickView({
  product,
  merchantName,
  merchantMark,
  totalUsd,
  subtotalUsd,
  shippingUsd,
  acceptedTokens,
  supportedChains,
  agentNote,
  inCart,
  justAdded,
  onAddToCart,
  onPlaceOrder,
  onClose,
}: {
  product: Product;
  merchantName: string;
  merchantMark: { initials: string; className: string };
  totalUsd: number;
  subtotalUsd: number;
  shippingUsd: number;
  acceptedTokens: string[];
  supportedChains: string[];
  agentNote: string;
  inCart: boolean;
  justAdded: boolean;
  onAddToCart: () => void;
  onPlaceOrder: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close product details"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div className="relative z-10 grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-t-3xl border border-white/[0.08] bg-[#101010] shadow-2xl sm:grid-cols-[1.05fr_0.95fr] sm:rounded-3xl">
        <button
          type="button"
          aria-label="Close product details"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/45 p-2 text-white/50 transition-colors hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative min-h-[280px] bg-[#171717] sm:min-h-[560px]">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white/70 backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              {merchantName}
            </div>
          </div>
        </div>

        <div className="overflow-y-auto p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-black shadow-lg",
                merchantMark.className
              )}
            >
              {merchantMark.initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.16em] text-white/35">
                {product.category}
              </p>
              <p className="truncate text-sm text-white/70">{merchantName}</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold leading-tight text-white">
            {product.name}
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/55">
            {product.description}
          </p>

          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-white/35">
                  Landed total
                </p>
                <p className="mt-1 text-3xl font-bold text-white">
                  ${totalUsd.toFixed(2)}
                </p>
              </div>
              <div className="text-right text-xs text-white/45">
                <p>Item ${subtotalUsd.toFixed(2)}</p>
                <p>
                  <Truck className="mr-1 inline h-3 w-3" />
                  Shipping ${shippingUsd.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.14em] text-white/35">
                Accepted assets
              </p>
              <div className="flex flex-wrap gap-1.5">
                {acceptedTokens.map((token) => (
                  <TokenBadge key={token} token={token} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.14em] text-white/35">
                Routes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {supportedChains.length > 0 ? (
                  supportedChains.map((chain) => (
                    <ChainBadge key={chain} chain={chain} />
                  ))
                ) : (
                  <span className="text-[11px] text-white/35">
                    Agent picks at checkout
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-amber-200/[0.1] bg-amber-200/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-amber-100/45">
              Agent note
            </p>
            <p className="mt-2 text-sm leading-6 text-white/60">{agentNote}</p>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <BuyItemButton product={product} shippingUsd={shippingUsd} />
            <button
              type="button"
              onClick={onAddToCart}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium transition-colors",
                justAdded
                  ? "border border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
                  : inCart
                  ? "border border-sky-300/25 bg-sky-300/10 text-sky-200 hover:bg-sky-300/15"
                  : "border border-white/[0.10] bg-transparent text-white/70 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              {justAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  Added to cart
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {inCart ? "Add another to cart" : "Add to cart"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onPlaceOrder}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium transition-colors",
                "border border-white/[0.10] bg-transparent text-white/70 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <ClipboardList className="h-4 w-4" />
              Place an Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
