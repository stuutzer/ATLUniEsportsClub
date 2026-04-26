"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Store,
  X,
  AlertTriangle,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useIdentity } from "@/context/IdentityContext";
import type { AgentCredential } from "@/lib/identity";
import type { Product } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface PurchaseModalProps {
  product: Product;
  onClose: () => void;
  onConfirm?: () => void;
  policyError?: string | null;
  settlementStatus?: SettlementStatus;
  settlementError?: string | null;
  paymentToken?: string;
  paymentAmount?: string;
  networkLabel?: string;
}

export type SettlementStatus = "idle" | "settling" | "settled" | "failed";

const STEP_DELAYS = [800, 1000, 1200, 800];

export function PurchaseModal({
  product,
  onClose,
  onConfirm,
  policyError,
  settlementStatus = "idle",
  settlementError,
  paymentToken = "USDC",
  paymentAmount,
  networkLabel = "Avalanche C-Chain",
}: PurchaseModalProps) {
  const { credential } = useIdentity();
  const [step, setStep] = useState(1);
  const [cardVisible, setCardVisible] = useState(false);

  useEffect(() => {
    if (step !== 3) return;
    const timer = window.setTimeout(() => setCardVisible(true), 250);
    return () => window.clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (step >= 5) return;
    if (step === 4 && policyError) return;
    const timer = window.setTimeout(() => setStep((current) => current + 1), STEP_DELAYS[step - 1]);
    return () => window.clearTimeout(timer);
  }, [policyError, step]);

  const cryptoTotal = paymentAmount ?? product.price.toFixed(2);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-t-2xl border border-white/10 bg-[#0f0f0f] shadow-2xl animate-in slide-in-from-bottom-4 duration-300 sm:rounded-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-white/25 transition-colors hover:text-white/70"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center justify-center gap-2 border-b border-white/[0.06] px-6 pt-5 pb-4">
          {[1, 2, 3, 4, 5].map((current) => (
            <div
              key={current}
              className={cn(
                "rounded-full transition-all duration-300",
                current === step
                  ? "h-1.5 w-6 bg-sky-300"
                  : current < step
                  ? "h-1.5 w-1.5 bg-sky-300/40"
                  : "h-1.5 w-1.5 bg-white/10"
              )}
            />
          ))}
        </div>

        <div className="flex min-h-[300px] flex-col px-6 pt-6 pb-7">
          {step === 1 && <StepLoading credential={credential} product={product} />}
          {step === 2 && <StepContacting product={product} />}
          {step === 3 && (
            <StepPresenting product={product} credential={credential} visible={cardVisible} />
          )}
          {step === 4 && (
            <StepVerification
              credential={credential}
              policyError={policyError ?? null}
              onClose={onClose}
            />
          )}
          {step === 5 && (
            <StepPayment
              product={product}
              preferredToken={paymentToken}
              cryptoTotal={cryptoTotal}
              networkLabel={networkLabel}
              onClose={onClose}
              onConfirm={onConfirm}
              settlementStatus={settlementStatus}
              settlementError={settlementError ?? null}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StepLoading({
  credential,
  product,
}: {
  credential: AgentCredential | null;
  product: Product;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-sky-200/[0.15] bg-sky-300/10">
        <Loader2 className="h-5 w-5 animate-spin text-sky-200" />
      </div>
      <div>
        <p className="mb-1 font-semibold text-white">Loading agent identity...</p>
        <p className="text-sm text-white/35">Preparing purchase for {product.name}</p>
      </div>
      <div className="w-full space-y-2 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left">
        <Row label="Agent" value={credential?.agentName ?? "Quarter Auto-Agent"} mono />
        <Row
          label="Acting As"
          value={credential?.actingFor ?? "Guest checkout session"}
          mono
        />
        <Row
          label="Limit"
          value={credential ? `$${credential.spendingLimit}` : "No policy limit set"}
        />
      </div>
    </div>
  );
}

function StepContacting({ product }: { product: Product }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-600/15">
        <Store className="h-5 w-5 text-blue-400" />
      </div>
      <div>
        <div className="mb-1 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-white/40" />
          <p className="font-semibold text-white">Contacting merchant...</p>
        </div>
        <p className="text-sm text-white/35">Reaching {product.merchantName}</p>
      </div>
      <div className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3.5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/5 text-base font-bold text-white/30">
          {product.merchantName.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white/80">{product.merchantName}</p>
          <p className="text-xs text-white/30">Web3-verified merchant</p>
        </div>
        <ShieldCheck className="h-4 w-4 flex-shrink-0 text-green-400" />
      </div>
    </div>
  );
}

function StepPresenting({
  product,
  credential,
  visible,
}: {
  product: Product;
  credential: AgentCredential | null;
  visible: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="text-center">
        <p className="mb-1 font-semibold text-white">Presenting agent identity...</p>
        <p className="text-sm text-white/35">
          Sending identity proof to {product.merchantName}
        </p>
      </div>
      <div
        className={cn(
          "transition-all duration-500 ease-out",
          visible ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0"
        )}
      >
        <div className="space-y-2.5 rounded-xl border border-white/8 border-l-[3px] border-l-sky-300/70 bg-[#1a1a1a] px-4 py-3.5">
          <Row label="Agent" value={credential?.agentName ?? "Quarter Auto-Agent"} mono />
          <Row
            label="Authorized For"
            value={credential?.actingFor ?? "Guest checkout session"}
            mono
          />
          <Row
            label="Signature"
            value={
              credential
                ? `${credential.signature.slice(0, 22)}...`
                : "Mock identity fallback"
            }
            mono={!!credential}
            dim={!credential}
          />
        </div>
      </div>
    </div>
  );
}

function StepVerification({
  credential,
  policyError,
  onClose,
}: {
  credential: AgentCredential | null;
  policyError: string | null;
  onClose: () => void;
}) {
  if (policyError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
          <XCircle className="h-7 w-7 text-red-400" />
        </div>
        <div>
          <p className="mb-2 text-lg font-semibold text-white">Blocked by policy</p>
          <p className="mb-1 max-w-xs text-sm text-white/55">{policyError}</p>
          <p className="max-w-xs text-xs text-white/35">
            The merchant accepted the identity, but your spending policy refused this purchase.
          </p>
        </div>
        <Link
          href="/profile"
          onClick={onClose}
          className="rounded-full border border-white/[0.15] bg-sky-200 px-6 py-2.5 text-sm font-semibold text-[#06131d] transition-colors hover:bg-sky-100"
        >
          Adjust limit in Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full border",
          credential
            ? "border-green-500/20 bg-green-500/10"
            : "border-amber-400/20 bg-amber-400/10"
        )}
      >
        <CheckCircle2
          className={cn("h-7 w-7", credential ? "text-green-400" : "text-amber-300")}
        />
      </div>
      <div>
        <p className="mb-2 text-lg font-semibold text-white">
          {credential ? "Identity Verified" : "Guest Identity Ready"}
        </p>
        <p className="text-sm text-white/40">
          {credential
            ? "Merchant accepted agent credential. No login required."
            : "No credential found, so Quarter will continue with a mock agent identity for this checkout."}
        </p>
      </div>
      <div
        className={cn(
          "flex items-center gap-2 text-xs",
          credential ? "text-green-400" : "text-amber-300"
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 animate-pulse rounded-full",
            credential ? "bg-green-400" : "bg-amber-300"
          )}
        />
        Proceeding to payment...
      </div>
    </div>
  );
}

function StepPayment({
  product,
  preferredToken,
  cryptoTotal,
  networkLabel,
  onClose,
  onConfirm,
  settlementStatus,
  settlementError,
}: {
  product: Product;
  preferredToken: string;
  cryptoTotal: string;
  networkLabel: string;
  onClose: () => void;
  onConfirm?: () => void;
  settlementStatus: SettlementStatus;
  settlementError: string | null;
}) {
  const isSettling = settlementStatus === "settling";
  const [exchangePromptOpen, setExchangePromptOpen] = useState(false);

  const handleConfirmClick = () => {
    if (product.requiresFiatExchange) {
      setExchangePromptOpen(true);
      return;
    }

    onConfirm ? onConfirm() : onClose();
  };

  const handleExchangeConfirm = () => {
    setExchangePromptOpen(false);
    onConfirm ? onConfirm() : onClose();
  };

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="text-center">
        <p className="text-lg font-semibold text-white">Confirm Payment</p>
        <p className="mt-0.5 text-sm text-white/35">
          Settle on {networkLabel} for {product.merchantName}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.03]">
        <div className="flex justify-between border-b border-white/5 px-4 py-3 text-sm">
          <span className="text-white/40">Product price</span>
          <span className="text-white">${product.price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-b border-white/5 px-4 py-3 text-sm">
          <span className="text-white/40">Network</span>
          <span className="text-white">{networkLabel}</span>
        </div>
        <div className="flex justify-between bg-white/[0.04] px-4 py-3.5 text-sm">
          <span className="font-medium text-white">Stablecoin settlement</span>
          <span className="font-bold text-white">
            {cryptoTotal} {preferredToken}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-white/40">Payment network</span>
          <span className="text-white/70">{networkLabel} transaction</span>
        </div>
        <p className="mt-2 text-xs text-white/30">
          Quarter will only broadcast the payment when you confirm it in MetaMask.
        </p>
        {settlementError && (
          <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {settlementError}
          </p>
        )}
      </div>

      {product.requiresFiatExchange && (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-300" />
            <div>
              <p className="text-sm font-medium text-amber-100">Exchange required</p>
              <p className="mt-1 text-xs leading-5 text-amber-100/65">
                Grocery merchants do not accept crypto directly, so Quarter will exchange your crypto to fiat before checkout.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto flex gap-3">
        <button
          onClick={onClose}
          disabled={isSettling}
          className="flex-1 rounded-full border border-white/10 py-2.5 text-sm text-white/50 transition-colors hover:border-white/20 hover:text-white"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmClick}
          disabled={isSettling}
          className="flex-1 rounded-full bg-purple-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-700 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:cursor-wait disabled:opacity-60"
        >
          {isSettling ? "Settling on C-Chain..." : "Confirm Settlement"}
        </button>
      </div>

      {exchangePromptOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setExchangePromptOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#151515] p-5 shadow-2xl">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
              <RefreshCw className="h-5 w-5 text-amber-200" />
            </div>
            <p className="text-lg font-semibold text-white">You need to make an exchange</p>
            <p className="mt-2 text-sm leading-6 text-white/55">
              {product.merchantName} takes fiat for groceries. Quarter will exchange USDC to fiat, then continue checkout for {product.name}.
            </p>
            <div className="mt-5 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-white/40">Exchange from</span>
                <span className="font-medium text-white/75">USDC</span>
              </div>
              <div className="mt-2 flex justify-between gap-3">
                <span className="text-white/40">Merchant receives</span>
                <span className="font-medium text-white/75">Fiat checkout</span>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setExchangePromptOpen(false)}
                className="flex-1 rounded-full border border-white/10 py-2.5 text-sm text-white/55 transition-colors hover:border-white/20 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={handleExchangeConfirm}
                className="flex-1 rounded-full bg-purple-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
              >
                Make Exchange
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  dim,
}: {
  label: string;
  value: string;
  mono?: boolean;
  dim?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 text-xs">
      <span className="flex-shrink-0 text-white/30">{label}</span>
      <span
        className={cn(
          "text-right",
          mono && "font-mono",
          dim ? "text-white/35" : "text-white/70"
        )}
      >
        {value}
      </span>
    </div>
  );
}
