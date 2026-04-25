"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TierBadge } from "@/components/tier-badge";
import { PurchaseModal } from "@/components/purchase-modal";
import type { Product } from "@/lib/mockData";
import type { AgentRecommendation } from "@/lib/agent-types";
import { cn } from "@/lib/utils";
import { Bot, ShieldCheck, Truck } from "lucide-react";
import { useAgent } from "@/context/AgentContext";
import {
  useSendTransaction,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useChainId,
} from "wagmi";
import { parseEther } from "viem";
import { avalanche } from "wagmi/chains";

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
  dNZD: {
    mark: "NZ",
    markClass: "bg-amber-300/10 text-amber-100 ring-amber-200/25",
    textClass: "text-amber-100",
  },
};

interface ProductCardProps {
  product: Product;
  recommendation?: AgentRecommendation;
}

const merchantMarks: Record<string, { initials: string; className: string }> = {
  "TechVault Store": {
    initials: "TV",
    className: "from-cyan-400 to-blue-600 text-white shadow-cyan-950/30",
  },
  "Wooting Official": {
    initials: "WO",
    className: "from-orange-300 to-red-600 text-white shadow-red-950/30",
  },
  "Keychron Store": {
    initials: "KC",
    className: "from-slate-200 to-slate-600 text-white shadow-slate-950/30",
  },
  NuPhy: {
    initials: "NP",
    className: "from-lime-300 to-emerald-600 text-white shadow-emerald-950/30",
  },
  "Akko Global": {
    initials: "AK",
    className: "from-pink-300 to-fuchsia-600 text-white shadow-fuchsia-950/30",
  },
  Razer: {
    initials: "RZ",
    className: "from-green-300 to-lime-600 text-black shadow-lime-950/30",
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

const DUMMY_MERCHANT_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const FLAT_AVAX_VALUE = parseEther("0.0003");

export function ProductCard({ product, recommendation }: ProductCardProps) {
  const { executeAgentPurchase } = useAgent();
  const [modalOpen, setModalOpen] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransaction, data: hash, isPending: isWalletPending } =
    useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed && hash && !isPurchased) {
      executeAgentPurchase(product.name, product.price, "AVAX", hash);
      setIsPurchased(true);
    }
  }, [isConfirmed, hash, isPurchased, executeAgentPurchase, product.name, product.price]);

  const handleConfirmPayment = async () => {
    setModalOpen(false);

    if (chainId !== avalanche.id) {
      try {
        await switchChainAsync({ chainId: avalanche.id });
      } catch (err) {
        console.error("Failed to switch to Avalanche C-Chain", err);
        return;
      }
    }

    sendTransaction({
      to: DUMMY_MERCHANT_ADDRESS,
      value: FLAT_AVAX_VALUE,
      chainId: avalanche.id,
    });
  };

  let buttonText = "Let Agent Purchase";
  if (isWalletPending) buttonText = "Confirm in Wallet...";
  if (isConfirming) buttonText = "Processing on C-Chain...";
  if (isConfirmed) buttonText = "Purchase Complete!";

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
      ? (["ETH", "AVAX", "USDC", "dNZD"] as const)
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
          "hover:border-amber-200/20 hover:shadow-[0_18px_44px_rgba(0,0,0,0.32)]"
        )}
      >
        {/* Tier badge */}
        <div className="absolute top-3 right-3 z-10">
          <TierBadge tier={product.tier} size="sm" />
        </div>

        {/* Product image — links to detail */}
        <Link href={`/product/${product.id}`} className="block cursor-pointer">
          <div className="aspect-[4/3] bg-[#1a1a1a] overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            />
          </div>
        </Link>

        {/* Card body */}
        <div className="p-4 flex flex-col flex-1">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">
            {product.category}
          </span>
          <h3 className="text-white/90 font-semibold text-sm leading-snug line-clamp-2 mt-1 mb-3">
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
              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-amber-100/70">
                <ShieldCheck className="h-3 w-3" />
                <span>{recommendation?.trustScore ?? 99}/100 merchant trust</span>
              </div>
            </div>
          </div>

          <div className="mb-4 rounded-xl border border-white/[0.07] bg-black/20 p-3">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-amber-100/45">
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

            <div className="rounded-xl border border-amber-200/[0.09] bg-amber-200/[0.035] px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.14em] text-amber-100/45">
                Agent note
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/55">
                {agentNote}
              </p>
            </div>
          </div>

          {/* Agent purchase button */}
          <button
            onClick={() => setModalOpen(true)}
            disabled={isWalletPending || isConfirming || isConfirmed}
            className={cn(
              "mt-auto w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium",
              "bg-purple-500/10 border border-purple-300/15 text-purple-200 cursor-pointer",
              "hover:bg-purple-500/15 hover:border-purple-200/30 hover:text-white",
              "transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <Bot className="w-3.5 h-3.5" />
            {buttonText}
          </button>
        </div>
      </div>

      {modalOpen && (
        <PurchaseModal
          product={product}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirmPayment}
        />
      )}
    </>
  );
}
