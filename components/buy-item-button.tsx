"use client";

import { useEffect, useState } from "react";
import { Bot } from "lucide-react";
import { useAgent } from "@/context/AgentContext";
import { useIdentity } from "@/context/IdentityContext";
import { PurchaseModal, type SettlementStatus } from "@/components/purchase-modal";
import type { Product } from "@/lib/mockData";
import {
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { erc20Abi, parseUnits } from "viem";
import { baseSepolia } from "wagmi/chains";

const DUMMY_MERCHANT_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const DNZD_CONTRACT_ADDRESS = "0x63ee4b77d3912dc7bce711c3be7bf12d532f1853";
const DEFAULT_DNZD_DECIMALS = 6;

export function BuyItemButton({
  product,
  shippingUsd,
}: {
  product: Product;
  shippingUsd?: number;
}) {
  const { executeAgentPurchase } = useAgent();
  const { credential } = useIdentity();
  const [isPurchased, setIsPurchased] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [settlementStatus, setSettlementStatus] = useState<SettlementStatus>("idle");
  const [settlementError, setSettlementError] = useState<string | null>(null);
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContract, data: hash, isPending: isWalletPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  const { data: dnzdDecimals } = useReadContract({
    address: DNZD_CONTRACT_ADDRESS,
    abi: erc20Abi,
    functionName: "decimals",
    chainId: baseSepolia.id,
  });
  const dnzdAmount = product.price.toFixed(2);
  const settlementValue = parseUnits(
    dnzdAmount,
    Number(dnzdDecimals ?? DEFAULT_DNZD_DECIMALS)
  );

  useEffect(() => {
    if (!isConfirmed || !hash || isPurchased) return;
    executeAgentPurchase(product.name, product.price, "dNZD", hash);
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
      if (chainId !== baseSepolia.id) {
        await switchChainAsync({ chainId: baseSepolia.id });
      }

      writeContract({
        address: DNZD_CONTRACT_ADDRESS,
        abi: erc20Abi,
        functionName: "transfer",
        args: [DUMMY_MERCHANT_ADDRESS, settlementValue],
        chainId: baseSepolia.id,
      });
    } catch (err) {
      setSettlementStatus("failed");
      setSettlementError(
        err instanceof Error ? err.message : "Base Sepolia settlement failed"
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
          policyError={policyError}
          settlementStatus={settlementStatus}
          settlementError={settlementError}
          paymentToken="dNZD"
          paymentAmount={dnzdAmount}
          networkLabel="Base Sepolia"
          shippingValue={shippingUsd}
        />
      )}
    </>
  );
}
