"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TierBadge } from "@/components/tier-badge";
import { PurchaseModal } from "@/components/purchase-modal";
import type { Product } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import { useAgent } from "@/context/AgentContext";
import {
  useSendTransaction,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useChainId,
} from "wagmi";
import { parseEther } from "viem";
import { avalancheFuji } from "wagmi/chains";

const cryptoColors: Record<string, string> = {
  ETH: "bg-blue-500/15 text-blue-300 border border-blue-500/20",
  AVAX: "bg-red-500/15 text-red-300 border border-red-500/20",
  USDC: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20",
};

interface ProductCardProps {
  product: Product;
}

const DUMMY_MERCHANT_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const FLAT_AVAX_VALUE = parseEther("0.0003");

export function ProductCard({ product }: ProductCardProps) {
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

    if (chainId !== avalancheFuji.id) {
      try {
        await switchChainAsync({ chainId: avalancheFuji.id });
      } catch (err) {
        console.error("Failed to switch to Fuji", err);
        return;
      }
    }

    sendTransaction({
      to: DUMMY_MERCHANT_ADDRESS,
      value: FLAT_AVAX_VALUE,
      chainId: avalancheFuji.id,
    });
  };

  let buttonText = "Let Agent Purchase";
  if (isWalletPending) buttonText = "Confirm in Wallet...";
  if (isConfirming) buttonText = "Processing on Fuji...";
  if (isConfirmed) buttonText = "Purchase Complete!";

  return (
    <>
<div className={cn(
  "relative rounded-xl overflow-hidden group flex flex-col h-full",
  "bg-[#141414] border border-white/[0.07]",
  "transition-all duration-300",
  "hover:border-purple-500/25 hover:shadow-[0_0_24px_rgba(124,58,237,0.12)]"
)}>
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
    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
  />
</div>
        </Link>

        {/* Card body */}
  <div className="p-4 flex flex-col flex-1">
    <span className="text-[10px] text-white/30 uppercase tracking-widest">
      {product.category}
    </span>
    <h3 className="text-white/90 font-semibold text-sm leading-snug line-clamp-2 mt-1 mb-1">
      {product.name}
    </h3>
    <p className="text-white/30 text-xs mb-3">{product.merchantName}</p>

    <div className="flex items-center justify-between mb-3">
      <span className="text-white font-bold text-base">${product.price.toFixed(2)}</span>
      <div className="flex gap-1">
        {product.acceptedCrypto.map((token) => (
          <span key={token} className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", cryptoColors[token])}>
            {token}
          </span>
        ))}
      </div>
    </div>

          {/* Agent purchase button */}
    <button
      onClick={() => setModalOpen(true)}
      disabled={isWalletPending || isConfirming || isConfirmed}
      className={cn(
        "mt-auto w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium",
        "bg-purple-600/10 border border-purple-500/20 text-purple-300",
        "hover:bg-purple-600/20 hover:border-purple-500/40 hover:text-purple-200",
        "transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50"
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
