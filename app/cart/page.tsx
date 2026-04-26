"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowLeftRight,
  Bot,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";
import {
  useChainId,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { useCart } from "@/context/CartContext";
import { useAgent } from "@/context/AgentContext";
import {
  DEMO_MERCHANT_ADDRESS,
  DEMO_PAYMENT_AMOUNT_AVAX,
  DEMO_PAYMENT_CHAIN,
  DEMO_PAYMENT_CHAIN_LABEL,
  DEMO_PAYMENT_TOKEN,
  demoPaymentErrorMessage,
} from "@/lib/demoPayment";

type ShipStatus = "idle" | "switching" | "signing" | "settling" | "settled" | "failed";

export default function CartPage() {
  const { items, itemCount, subtotal, shipping, total, updateQuantity, removeItem, clearCart } =
    useCart();
  const { executeAgentPurchase } = useAgent();

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

  const [status, setStatus] = useState<ShipStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sendError && !receiptError) return;
    const err = sendError ?? receiptError;
    setStatus("failed");
    setError(demoPaymentErrorMessage(err));
    reset();
  }, [sendError, receiptError, reset]);

  const demoPaymentAmount = DEMO_PAYMENT_AMOUNT_AVAX;

  const fiatExchangeMerchants = useMemo(() => {
    const merchants = new Set<string>();
    items.forEach(({ product }) => {
      if (product.requiresFiatExchange) merchants.add(product.merchantName);
    });
    return Array.from(merchants);
  }, [items]);

  useEffect(() => {
    if (!isConfirmed || !hash || status === "settled") return;
    const summary =
      items.length === 1
        ? `${items[0].product.name}${items[0].quantity > 1 ? ` x${items[0].quantity}` : ""}`
        : `Cart bundle (${itemCount} items)`;
    executeAgentPurchase(summary, total, DEMO_PAYMENT_TOKEN, hash);
    setStatus("settled");
    clearCart();
  }, [isConfirmed, hash, status, items, itemCount, total, executeAgentPurchase, clearCart]);

  const handleShipAll = async () => {
    if (items.length === 0) return;
    setError(null);
    setStatus("idle");
    reset();
    try {
      if (chainId !== DEMO_PAYMENT_CHAIN.id) {
        setStatus("switching");
        await switchChainAsync({ chainId: DEMO_PAYMENT_CHAIN.id });
      }
      setStatus("signing");
      sendTransaction({
        to: DEMO_MERCHANT_ADDRESS,
        value: parseEther(DEMO_PAYMENT_AMOUNT_AVAX),
        chainId: DEMO_PAYMENT_CHAIN.id,
      });
    } catch (err) {
      setStatus("failed");
      setError(demoPaymentErrorMessage(err));
    }
  };

  const resetAfterSettle = () => {
    setStatus("idle");
    setError(null);
    reset();
  };

  if (status === "settled") {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.04] p-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/25 bg-emerald-300/10">
            <CheckCircle2 className="h-7 w-7 text-emerald-300" />
          </div>
          <h1 className="text-2xl font-semibold text-white">Order shipped</h1>
          <p className="mt-2 text-sm text-white/55">
            Settled in test AVAX on {DEMO_PAYMENT_CHAIN_LABEL}.{" "}
            <Link
              href="/wallet"
              className="text-sky-200 hover:text-sky-100 underline underline-offset-2"
            >
              View transaction
            </Link>
            .
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/agent"
              className="quarter-button px-5 py-2"
            >
              Continue shopping
            </Link>
            <button
              onClick={resetAfterSettle}
              className="quarter-button px-5 py-2"
            >
              View cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isBusy = status === "switching" || isWalletPending || (isConfirming && !!hash);

  const buttonLabel = isWalletPending
    ? "Confirm in Wallet..."
    : isConfirming && hash
      ? `Processing on ${DEMO_PAYMENT_CHAIN_LABEL}...`
      : status === "switching"
        ? `Switching to ${DEMO_PAYMENT_CHAIN_LABEL}...`
        : status === "failed"
          ? "Try again"
          : `Ship All Items (${demoPaymentAmount} ${DEMO_PAYMENT_TOKEN})`;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link
        href="/agent"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Agent
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
          <ShoppingCart className="h-5 w-5 text-white/75" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">Your Cart</h1>
          <p className="text-sm text-white/45">
            {itemCount === 0
              ? "No items yet"
              : `${itemCount} item${itemCount === 1 ? "" : "s"} ready to ship`}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#121212] p-12 text-center">
          <ShoppingCart className="mx-auto mb-4 h-10 w-10 text-white/15" />
          <p className="text-white/55">Your cart is empty.</p>
          <Link
            href="/agent"
            className="quarter-button mt-5 px-5 py-2"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-4 rounded-2xl border border-white/[0.06] bg-[#121212] p-4"
              >
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-[#1a1a1a]">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/30">
                    {product.category}
                  </p>
                  <h3 className="mt-1 truncate text-sm font-semibold text-white/90">
                    {product.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-white/45">{product.merchantName}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03]">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center text-white/55 hover:text-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-medium text-white/85">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center text-white/55 hover:text-white"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-white">
                        ${(product.price * quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="rounded-lg p-1.5 text-white/30 hover:bg-white/[0.05] hover:text-rose-300"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="mt-2 text-xs text-white/35 hover:text-white/65 transition-colors"
            >
              Clear cart
            </button>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/[0.06] bg-[#121212] p-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                Order summary
              </p>

              <div className="mt-4 space-y-2.5 text-sm">
                <Row
                  label={`Subtotal (${itemCount} item${itemCount === 1 ? "" : "s"})`}
                  value={`$${subtotal.toFixed(2)}`}
                />
                <Row
                  label={
                    <span className="inline-flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5" />
                      Shipping
                    </span>
                  }
                  value={`$${shipping.toFixed(2)}`}
                />
              </div>

              <div className="my-4 h-px bg-white/[0.06]" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/85">Total</span>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">${total.toFixed(2)}</p>
                  <p className="text-[11px] text-white/40">
                    Demo payment {demoPaymentAmount} {DEMO_PAYMENT_TOKEN}
                  </p>
                </div>
              </div>
            </div>

            {fiatExchangeMerchants.length > 0 && (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/10">
                    <ArrowLeftRight className="h-3.5 w-3.5 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-amber-100">Exchange required</p>
                    <p className="mt-1 text-[11px] leading-5 text-amber-100/65">
                      {fiatExchangeMerchants.length === 1
                        ? `${fiatExchangeMerchants[0]} does not accept crypto directly.`
                        : "Some grocery merchants do not accept crypto directly."}{" "}
                      Quarter will exchange your crypto to fiat before checkout.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && status === "failed" && (
              <div className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.05] p-4 text-xs text-rose-100/85">
                {error}
              </div>
            )}

            <button
              onClick={handleShipAll}
              disabled={items.length === 0 || isBusy}
              className="quarter-button w-full py-3 font-semibold"
            >
              <Bot className="h-4 w-4" />
              {buttonLabel}
            </button>

            <p className="text-center text-[11px] leading-5 text-white/35">
              One test AVAX payment on {DEMO_PAYMENT_CHAIN_LABEL} covers every item in this cart.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/55">{label}</span>
      <span className="text-white/85">{value}</span>
    </div>
  );
}
