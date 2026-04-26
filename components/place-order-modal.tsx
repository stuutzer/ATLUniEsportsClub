"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  PackageSearch,
  TrendingDown,
  X,
} from "lucide-react";
import {
  useChainId,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from "wagmi";
import { avalanche } from "wagmi/chains";
import { parseEther } from "viem";
import {
  ORDER_TYPE_DESCRIPTIONS,
  ORDER_TYPE_LABELS,
  useOrders,
  type OrderType,
} from "@/context/OrdersContext";
import {
  PurchaseModal,
  type SettlementStatus,
} from "@/components/purchase-modal";
import type { Product } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<OrderType, React.ComponentType<{ className?: string }>> = {
  unreleased: CalendarClock,
  "price-drop": TrendingDown,
  availability: PackageSearch,
};

const COMMITMENT_AVAX = "0.0003";
const DUMMY_MERCHANT_ADDRESS = "0x000000000000000000000000000000000000dEaD";

type Phase = "configure" | "verifying" | "placed";

function isUserRejection(err: unknown): boolean {
  if (!err) return false;
  const name = (err as { name?: string }).name ?? "";
  const msg = (err as Error).message ?? "";
  return /UserRejected|User rejected|denied/i.test(`${name} ${msg}`);
}

export function PlaceOrderModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { placeOrder } = useOrders();

  // configuration state
  const [type, setType] = useState<OrderType>("price-drop");
  const [targetPrice, setTargetPrice] = useState<string>(
    (product.price * 0.9).toFixed(2)
  );
  const [note, setNote] = useState("");
  const [phase, setPhase] = useState<Phase>("configure");

  const targetPriceNum = parseFloat(targetPrice);
  const targetPriceInvalid =
    type === "price-drop" &&
    (Number.isNaN(targetPriceNum) ||
      targetPriceNum <= 0 ||
      targetPriceNum >= product.price);

  // wallet flow
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const {
    sendTransaction,
    data: hash,
    isPending: isWalletPending,
    error: sendError,
    reset,
  } = useSendTransaction();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const [settlementStatus, setSettlementStatus] = useState<SettlementStatus>("idle");
  const [settlementError, setSettlementError] = useState<string | null>(null);
  const placedRef = useRef(false);

  // Reflect wagmi state into the shared SettlementStatus shape
  useEffect(() => {
    if (sendError || receiptError) {
      const err = sendError ?? receiptError;
      setSettlementStatus("failed");
      setSettlementError(
        isUserRejection(err)
          ? "Transaction cancelled."
          : err instanceof Error
          ? err.message
          : "Avalanche C-Chain settlement failed"
      );
      reset();
      return;
    }
    if (isWalletPending || isConfirming) setSettlementStatus("settling");
  }, [sendError, receiptError, isWalletPending, isConfirming, reset]);

  // On confirmed tx: persist the order + show success
  useEffect(() => {
    if (!isConfirmed || !hash || placedRef.current) return;
    placedRef.current = true;
    placeOrder({
      product,
      type,
      targetPrice: type === "price-drop" ? targetPriceNum : undefined,
      note: note.trim() || undefined,
      commitmentHash: hash,
    });
    setSettlementStatus("settled");
    setPhase("placed");
  }, [isConfirmed, hash, placeOrder, product, type, targetPriceNum, note]);

  const handleStartVerify = () => {
    if (type === "price-drop" && targetPriceInvalid) return;
    setSettlementError(null);
    setSettlementStatus("idle");
    setPhase("verifying");
  };

  const handleConfirmCommitment = async () => {
    setSettlementError(null);
    setSettlementStatus("settling");
    try {
      if (chainId !== avalanche.id) {
        await switchChainAsync({ chainId: avalanche.id });
      }
      sendTransaction({
        to: DUMMY_MERCHANT_ADDRESS,
        value: parseEther(COMMITMENT_AVAX),
        chainId: avalanche.id,
      });
    } catch (err) {
      setSettlementStatus("failed");
      setSettlementError(
        isUserRejection(err)
          ? "Transaction cancelled."
          : err instanceof Error
          ? err.message
          : "Avalanche C-Chain settlement failed"
      );
    }
  };

  if (phase === "verifying") {
    return (
      <PurchaseModal
        product={product}
        onClose={() => {
          if (settlementStatus === "settling") return;
          setPhase("configure");
          reset();
          setSettlementStatus("idle");
          setSettlementError(null);
        }}
        onConfirm={handleConfirmCommitment}
        settlementStatus={settlementStatus}
        settlementError={settlementError}
        paymentToken="AVAX"
        paymentAmount={COMMITMENT_AVAX}
        networkLabel="Avalanche C-Chain (commitment)"
        priceLabel={
          type === "price-drop"
            ? "Target price"
            : type === "unreleased"
            ? "Reserved price"
            : "Product price"
        }
        priceValue={
          type === "price-drop" && !targetPriceInvalid
            ? targetPriceNum
            : product.price
        }
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-t-3xl border border-white/[0.08] bg-[#101010] p-6 shadow-2xl sm:rounded-3xl">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/45 p-2 text-white/50 transition-colors hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {phase === "placed" ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/25 bg-emerald-300/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-300" />
            </div>
            <h2 className="text-lg font-semibold text-white">Order placed</h2>
            <p className="mt-2 text-sm text-white/55">
              Quarter will watch {product.name} and act when conditions are met.
            </p>
            {hash && (
              <p className="mt-3 text-[10px] text-white/35 font-mono break-all px-4">
                Commitment: {hash.slice(0, 10)}…{hash.slice(-8)}
              </p>
            )}
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={onClose}
                className="quarter-button px-5 py-2"
              >
                Close
              </button>
              <a
                href="/orders"
                className="quarter-button px-5 py-2"
              >
                View orders
              </a>
            </div>
          </div>
        ) : (
          <>
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
              Place an order
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">{product.name}</h2>
            <p className="mt-0.5 text-xs text-white/45">{product.merchantName}</p>

            <div className="mt-5 space-y-2">
              {(Object.keys(ORDER_TYPE_LABELS) as OrderType[]).map((t) => {
                const Icon = TYPE_ICON[t];
                const active = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                      active
                        ? "border-sky-300/30 bg-sky-300/[0.06]"
                        : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border",
                        active
                          ? "border-sky-300/30 bg-sky-300/10 text-sky-200"
                          : "border-white/10 bg-white/[0.03] text-white/50"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          active ? "text-white" : "text-white/80"
                        )}
                      >
                        {ORDER_TYPE_LABELS[t]}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-5 text-white/45">
                        {ORDER_TYPE_DESCRIPTIONS[t]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {type === "price-drop" && (
              <div className="mt-4">
                <label className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-white/45">
                  Target price (USD)
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2">
                  <span className="text-white/45">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full bg-transparent text-sm text-white outline-none"
                  />
                  <span className="text-[11px] text-white/35">
                    of ${product.price.toFixed(2)}
                  </span>
                </div>
                {targetPriceInvalid && (
                  <p className="mt-1.5 text-[11px] text-rose-300/80">
                    Target must be greater than 0 and below the current price.
                  </p>
                )}
              </div>
            )}

            <div className="mt-4">
              <label className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-white/45">
                Note (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="e.g. Birthday gift, only buy if shipping is free"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-sky-300/30"
              />
            </div>

            <p className="mt-4 text-[11px] leading-5 text-white/40">
              Quarter verifies your agent credential and signs a small{" "}
              <span className="font-mono">{COMMITMENT_AVAX} AVAX</span> commitment
              on Avalanche C-Chain so the merchant can prove the order is real.
            </p>

            <div className="mt-5 flex gap-2">
              <button
                onClick={onClose}
                className="quarter-button flex-1 py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={handleStartVerify}
                disabled={targetPriceInvalid}
                className="quarter-button flex-1 py-2.5 font-semibold"
              >
                Continue to Verification
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
