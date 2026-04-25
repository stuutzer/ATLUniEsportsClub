"use client";

import { useState, useEffect } from "react";
import { useSendTransaction, useWaitForTransactionReceipt, useSwitchChain, useChainId } from "wagmi";
import { parseEther } from "viem";
import { avalancheFuji } from "wagmi/chains";
import { Bot } from "lucide-react";
import { useAgent } from "@/context/AgentContext";
import { useIdentity } from "@/context/IdentityContext";
import { PurchaseModal } from "@/components/purchase-modal";
import type { Product } from "@/lib/mockData";

const DUMMY_MERCHANT_ADDRESS = "0x000000000000000000000000000000000000dEaD";

// Hackathon: send a flat ~1¢ in native AVAX on Fuji regardless of product price.
// 0.0003 AVAX ≈ $0.011 at $35.50/AVAX (matches MOCK_TOKEN_PRICES on the wallet page).
const FLAT_AVAX_VALUE = parseEther("0.0003");

export function BuyItemButton({ product }: { product: Product }) {
  const { executeAgentPurchase } = useAgent();
  const { credential } = useIdentity();
  const [isPurchased, setIsPurchased] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransaction, data: hash, isPending: isWalletPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Policy enforcement: the credential's spendingLimit is treated as a hard cap
  // per transaction (USD). If the purchase price exceeds it, the modal shows a
  // "Blocked by policy" state at step 4 and we refuse to broadcast the tx.
  const policyError =
    credential && product.price > credential.spendingLimit
      ? `Purchase price $${product.price.toFixed(2)} exceeds your per-transaction limit of $${credential.spendingLimit}.`
      : null;

  const handleBuy = () => {
    setModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (policyError) return;
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

  useEffect(() => {
    if (isConfirmed && hash && !isPurchased) {
      executeAgentPurchase(product.name, product.price, "AVAX", hash);
      setIsPurchased(true);
    }
  }, [isConfirmed, hash, isPurchased, executeAgentPurchase, product]);

  let buttonText = "Buy with Agent";
  if (isWalletPending) buttonText = "Confirm in Wallet...";
  if (isConfirming) buttonText = "Processing on Fuji...";
  if (isConfirmed) buttonText = "Purchase Complete!";

  return (
    <>
      <button
        onClick={handleBuy}
        disabled={isWalletPending || isConfirming || isConfirmed}
        className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-xl disabled:opacity-50 transition-all text-sm font-medium mt-4 shadow-lg shadow-purple-900/20"
      >
        <Bot className="w-4 h-4" />
        {buttonText}
      </button>
      {modalOpen && (
        <PurchaseModal
          product={product}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirmPayment}
          policyError={policyError}
        />
      )}
    </>
  );
}
