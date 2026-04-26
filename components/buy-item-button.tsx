"use client";

import { useEffect, useState } from "react";
import { Bot } from "lucide-react";
import { useAgent } from "@/context/AgentContext";
import { useIdentity } from "@/context/IdentityContext";
import { PurchaseModal, type SettlementStatus } from "@/components/purchase-modal";
import type { Product } from "@/lib/mockData";
import {
  useChainId,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { avalanche } from "wagmi/chains";

const DUMMY_MERCHANT_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const FLAT_AVAX_VALUE = parseEther("0.0003");

export function BuyItemButton({ product }: { product: Product }) {
  const { executeAgentPurchase } = useAgent();
  const { credential } = useIdentity();
  const [isPurchased, setIsPurchased] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [settlementStatus, setSettlementStatus] = useState<SettlementStatus>("idle");
  const [settlementError, setSettlementError] = useState<string | null>(null);
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransaction, data: hash, isPending: isWalletPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!isConfirmed || !hash || isPurchased) return;
    executeAgentPurchase(product.name, product.price, "AVAX", hash);
    setIsPurchased(true);
    setSettlementStatus("settled");
    setModalOpen(false);
  }, [isConfirmed, hash, isPurchased, executeAgentPurchase, product.name, product.price]);

  // Policy enforcement: the credential's spendingLimit is treated as a hard cap
  // per transaction (USD). If the purchase price exceeds it, the modal shows a
  // "Blocked by policy" state at step 4 and we refuse to broadcast the tx.
  const policyError =
    credential && product.price > credential.spendingLimit
      ? `Purchase price $${product.price.toFixed(2)} exceeds your per-transaction limit of $${credential.spendingLimit}.`
      : null;

  const handleBuy = () => {
    setSettlementStatus("idle");
    setSettlementError(null);
    setModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (policyError) return;
    setSettlementStatus("settling");
    setSettlementError(null);

    try {
      if (chainId !== avalanche.id) {
        await switchChainAsync({ chainId: avalanche.id });
      }

      sendTransaction({
        to: DUMMY_MERCHANT_ADDRESS,
        value: FLAT_AVAX_VALUE,
        chainId: avalanche.id,
      });
    } catch (err) {
      setSettlementStatus("failed");
      setSettlementError(
        err instanceof Error ? err.message : "Avalanche C-Chain settlement failed"
      );
    }
  };

  let buttonText = "Purchase with Agent";
  if (settlementStatus === "settling" || isWalletPending) buttonText = "Confirm in Wallet...";
  if (isConfirming) buttonText = "Processing on C-Chain...";
  if (isPurchased) buttonText = "Purchase Complete!";

  return (
    <>
      <button
        onClick={handleBuy}
        disabled={settlementStatus === "settling" || isPurchased}
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
          settlementStatus={settlementStatus}
          settlementError={settlementError}
        />
      )}
    </>
  );
}
