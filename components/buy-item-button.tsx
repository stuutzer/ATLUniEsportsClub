"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import { useAgent } from "@/context/AgentContext";
import { useIdentity } from "@/context/IdentityContext";
import { PurchaseModal, type SettlementStatus } from "@/components/purchase-modal";
import type { Product } from "@/lib/mockData";

interface MintSettlementResponse {
  settlement: {
    wallet_address: string;
    amount: number;
    remaining_balance: number;
    message: string;
  };
}

export function BuyItemButton({ product }: { product: Product }) {
  const { executeAgentPurchase } = useAgent();
  const { credential } = useIdentity();
  const [isPurchased, setIsPurchased] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [settlementStatus, setSettlementStatus] = useState<SettlementStatus>("idle");
  const [settlementError, setSettlementError] = useState<string | null>(null);

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
    setSettlementStatus("minting");
    setSettlementError(null);

    try {
      const response = await fetch("/api/newmoney/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: product.price,
          chain: "sepolia",
        }),
      });
      const data = (await response.json()) as MintSettlementResponse | { error?: string };

      if (!response.ok || !("settlement" in data)) {
        const errorMessage = "error" in data ? data.error : null;
        throw new Error(errorMessage || "NewMoney settlement failed");
      }

      const settlementRef = `newmoney:${data.settlement.wallet_address}:${Date.now()}`;
      executeAgentPurchase(product.name, data.settlement.amount, "dNZD", settlementRef);
      setIsPurchased(true);
      setSettlementStatus("settled");
      setModalOpen(false);
    } catch (err) {
      setSettlementStatus("failed");
      setSettlementError(err instanceof Error ? err.message : "NewMoney settlement failed");
    }
  };

  let buttonText = "Buy with Agent";
  if (settlementStatus === "minting") buttonText = "Minting dNZD...";
  if (isPurchased) buttonText = "Purchase Complete!";

  return (
    <>
      <button
        onClick={handleBuy}
        disabled={settlementStatus === "minting" || isPurchased}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.15] bg-sky-200 py-2.5 px-4 text-sm font-semibold text-[#06131d] shadow-lg shadow-black/25 transition-all hover:bg-sky-100 disabled:opacity-50"
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
