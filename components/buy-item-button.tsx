"use client";

import { useEffect, useState } from "react";
import { Bot } from "lucide-react";
import { useAgent } from "@/context/AgentContext";
import { PurchaseModal, type SettlementStatus } from "@/components/purchase-modal";
import type { Product } from "@/lib/mockData";
import {
  useChainId,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import {
  DEMO_MERCHANT_ADDRESS,
  DEMO_PAYMENT_AMOUNT_AVAX,
  DEMO_PAYMENT_CHAIN,
  DEMO_PAYMENT_CHAIN_LABEL,
  DEMO_PAYMENT_TOKEN,
  demoPaymentErrorMessage,
} from "@/lib/demoPayment";

export function BuyItemButton({
  product,
  shippingUsd,
}: {
  product: Product;
  shippingUsd?: number;
}) {
  const { executeAgentPurchase } = useAgent();
  const [isPurchased, setIsPurchased] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [settlementStatus, setSettlementStatus] = useState<SettlementStatus>("idle");
  const [settlementError, setSettlementError] = useState<string | null>(null);
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const {
    sendTransaction,
    data: hash,
    isPending: isWalletPending,
    error: sendError,
    reset,
  } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!isConfirmed || !hash || isPurchased) return;
    executeAgentPurchase(product.name, product.price, DEMO_PAYMENT_TOKEN, hash);
    setIsPurchased(true);
    setSettlementStatus("settled");
    setModalOpen(false);
  }, [isConfirmed, hash, isPurchased, executeAgentPurchase, product.name, product.price]);

  useEffect(() => {
    if (!sendError) return;
    setSettlementStatus("failed");
    setSettlementError(demoPaymentErrorMessage(sendError));
    reset();
  }, [sendError, reset]);

  const handleBuy = () => {
    setSettlementStatus("idle");
    setSettlementError(null);
    setModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    setSettlementStatus("settling");
    setSettlementError(null);

    try {
      if (chainId !== DEMO_PAYMENT_CHAIN.id) {
        await switchChainAsync({ chainId: DEMO_PAYMENT_CHAIN.id });
      }

      sendTransaction({
        to: DEMO_MERCHANT_ADDRESS,
        value: parseEther(DEMO_PAYMENT_AMOUNT_AVAX),
        chainId: DEMO_PAYMENT_CHAIN.id,
      });
    } catch (err) {
      setSettlementStatus("failed");
      setSettlementError(demoPaymentErrorMessage(err));
    }
  };

  let buttonText = "Purchase with Agent";
  if (settlementStatus === "settling" || isWalletPending) buttonText = "Confirm in Wallet...";
  if (isConfirming) buttonText = `Processing on ${DEMO_PAYMENT_CHAIN_LABEL}...`;
  if (isPurchased) buttonText = "Purchase Complete!";

  return (
    <>
      <button
        onClick={handleBuy}
        disabled={settlementStatus === "settling" || isPurchased}
        className="quarter-button mt-4 w-full rounded-xl px-4 py-2.5"
      >
        <Bot className="w-4 h-4" />
        {buttonText}
      </button>
      {modalOpen && (
        <PurchaseModal
          product={product}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirmPayment}
          settlementStatus={settlementStatus}
          settlementError={settlementError}
          paymentToken={DEMO_PAYMENT_TOKEN}
          paymentAmount={DEMO_PAYMENT_AMOUNT_AVAX}
          networkLabel={DEMO_PAYMENT_CHAIN_LABEL}
          shippingValue={shippingUsd}
        />
      )}
    </>
  );
}
