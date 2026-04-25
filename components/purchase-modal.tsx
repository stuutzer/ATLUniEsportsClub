"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";
import { useIdentity } from "@/context/IdentityContext";
import { AgentCredential } from "@/lib/identity";
import type { Product } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface PurchaseModalProps {
  product: Product;
  onClose: () => void;
  onConfirm?: () => void;
  policyError?: string | null;
  settlementStatus?: SettlementStatus;
  settlementError?: string | null;
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
}: PurchaseModalProps) {
  const { credential } = useIdentity();
  const [step, setStep] = useState(1);
  const [cardVisible, setCardVisible] = useState(false);

  // Trigger slide-in animation for step 3
  useEffect(() => {
    if (step !== 3) return;
    const t = setTimeout(() => setCardVisible(true), 250);
    return () => clearTimeout(t);
  }, [step]);

  // Auto-advance steps
  useEffect(() => {
    if (step >= 5) return;
    if (step === 4 && !credential) return; // stop — no credential
    if (step === 4 && policyError) return; // stop — credential exists but policy blocks
    const t = setTimeout(() => setStep((s) => s + 1), STEP_DELAYS[step - 1]);
    return () => clearTimeout(t);
  }, [step, credential, policyError]);

  const preferredToken = "USDC";
  const cryptoTotal = product.price.toFixed(2);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/25 hover:text-white/70 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-5 pb-4 border-b border-white/[0.06]">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={cn(
                "rounded-full transition-all duration-300",
                s === step
                  ? "w-6 h-1.5 bg-sky-300"
                  : s < step
                  ? "w-1.5 h-1.5 bg-sky-300/40"
                  : "w-1.5 h-1.5 bg-white/10"
              )}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="px-6 pt-6 pb-7 min-h-[300px] flex flex-col">
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
              preferredToken={preferredToken}
              cryptoTotal={cryptoTotal}
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

// ─── Step 1: Loading credential ───────────────────────────────────────────────
function StepLoading({
  credential,
  product,
}: {
  credential: AgentCredential | null;
  product: Product;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-5 flex-1 justify-center">
      <div className="w-12 h-12 rounded-xl bg-sky-300/10 border border-sky-200/[0.15] flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-sky-200 animate-spin" />
      </div>
      <div>
        <p className="text-white font-semibold mb-1">Loading agent credential…</p>
        <p className="text-white/35 text-sm">Preparing purchase for {product.name}</p>
      </div>
      {credential && (
        <div className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 space-y-2 text-left">
          <Row label="Agent" value={credential.agentName} mono />
          <Row label="Acting As" value={credential.actingFor} mono />
          <Row label="Limit" value={`$${credential.spendingLimit}`} />
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Contacting merchant ───────────────────────────────────────────────
function StepContacting({ product }: { product: Product }) {
  return (
    <div className="flex flex-col items-center text-center gap-5 flex-1 justify-center">
      <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center">
        <Store className="w-5 h-5 text-blue-400" />
      </div>
      <div>
        <div className="flex items-center gap-2 justify-center mb-1">
          <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
          <p className="text-white font-semibold">Contacting merchant…</p>
        </div>
        <p className="text-white/35 text-sm">Reaching {product.merchantName}</p>
      </div>
      <div className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-white/30 text-base font-bold flex-shrink-0">
          {product.merchantName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/80 text-sm font-medium">{product.merchantName}</p>
          <p className="text-white/30 text-xs">Web3-verified merchant</p>
        </div>
        <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
      </div>
    </div>
  );
}

// ─── Step 3: Presenting identity ──────────────────────────────────────────────
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
    <div className="flex flex-col gap-4 flex-1">
      <div className="text-center">
        <p className="text-white font-semibold mb-1">Presenting agent credential…</p>
        <p className="text-white/35 text-sm">
          Sending identity proof to {product.merchantName}
        </p>
      </div>
      <div
        className={cn(
          "transition-all duration-500 ease-out",
          visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
        )}
      >
        {credential ? (
          <div className="bg-[#1a1a1a] border border-white/8 border-l-[3px] border-l-sky-300/70 rounded-xl px-4 py-3.5 space-y-2.5">
            <Row label="Agent" value={credential.agentName} mono />
            <Row label="Authorized For" value={credential.actingFor} mono />
            <Row
              label="Signature"
              value={`${credential.signature.slice(0, 22)}…`}
              mono
              dim
            />
          </div>
        ) : (
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 text-center">
            <p className="text-red-400 text-sm">No credential to present</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 4: Verification result ──────────────────────────────────────────────
function StepVerification({
  credential,
  policyError,
  onClose,
}: {
  credential: AgentCredential | null;
  policyError: string | null;
  onClose: () => void;
}) {
  if (!credential) {
    return (
      <div className="flex flex-col items-center text-center gap-5 flex-1 justify-center">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <XCircle className="w-7 h-7 text-red-400" />
        </div>
        <div>
          <p className="text-white font-semibold text-lg mb-2">No credential found</p>
          <p className="text-white/40 text-sm max-w-xs">
            Please generate an Agent Credential in your Profile first.
          </p>
        </div>
        <Link
          href="/profile"
          onClick={onClose}
          className="rounded-full border border-white/[0.15] bg-sky-200 px-6 py-2.5 text-sm font-semibold text-[#06131d] transition-colors hover:bg-sky-100"
        >
          Go to Profile
        </Link>
      </div>
    );
  }

  if (policyError) {
    return (
      <div className="flex flex-col items-center text-center gap-5 flex-1 justify-center">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <XCircle className="w-7 h-7 text-red-400" />
        </div>
        <div>
          <p className="text-white font-semibold text-lg mb-2">Blocked by policy</p>
          <p className="text-white/55 text-sm max-w-xs mb-1">{policyError}</p>
          <p className="text-white/35 text-xs max-w-xs">
            The merchant accepted the credential, but your spending policy refused this purchase.
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
    <div className="flex flex-col items-center text-center gap-5 flex-1 justify-center">
      <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
        <CheckCircle2 className="w-7 h-7 text-green-400" />
      </div>
      <div>
        <p className="text-white font-semibold text-lg mb-2">Identity Verified ✓</p>
        <p className="text-white/40 text-sm">
          Merchant accepted agent credential. No login required.
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-green-400">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Proceeding to payment…
      </div>
    </div>
  );
}

// ─── Step 5: Payment confirmation ─────────────────────────────────────────────
function StepPayment({
  product,
  preferredToken,
  cryptoTotal,
  onClose,
  onConfirm,
  settlementStatus,
  settlementError,
}: {
  product: Product;
  preferredToken: string;
  cryptoTotal: string;
  onClose: () => void;
  onConfirm?: () => void;
  settlementStatus: SettlementStatus;
  settlementError: string | null;
}) {
  const isSettling = settlementStatus === "settling";

  return (
    <div className="flex flex-col gap-5 flex-1">
      <div className="text-center">
        <p className="text-white font-semibold text-lg">Confirm Payment</p>
        <p className="text-white/35 text-sm mt-0.5">
          Settle on Avalanche C-Chain for {product.merchantName}
        </p>
      </div>

      <div className="bg-white/[0.03] border border-white/8 rounded-xl overflow-hidden">
        <div className="px-4 py-3 flex justify-between text-sm border-b border-white/5">
          <span className="text-white/40">Product price</span>
          <span className="text-white">${product.price.toFixed(2)}</span>
        </div>
        <div className="px-4 py-3 flex justify-between text-sm border-b border-white/5">
          <span className="text-white/40">Network</span>
          <span className="text-white">Avalanche C-Chain</span>
        </div>
        <div className="px-4 py-3.5 flex justify-between text-sm bg-white/[0.04]">
          <span className="text-white font-medium">
            Stablecoin settlement
          </span>
          <span className="text-white font-bold">
            {cryptoTotal} {preferredToken}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-white/40">Payment network</span>
          <span className="text-white/70">Avalanche C-Chain transaction</span>
        </div>
        <p className="text-white/30 text-xs mt-2">
          Quarter broadcasts payment on Avalanche C-Chain only after the agent credential and spending policy pass.
        </p>
        {settlementError && (
          <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {settlementError}
          </p>
        )}
      </div>

      <div className="flex gap-3 mt-auto">
        <button
          onClick={onClose}
          disabled={isSettling}
          className="flex-1 py-2.5 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => (onConfirm ? onConfirm() : onClose())}
          disabled={isSettling}
          className="flex-1 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:cursor-wait disabled:opacity-60"
        >
          {isSettling ? "Settling on C-Chain..." : "Confirm Settlement"}
        </button>
      </div>
    </div>
  );
}

// ─── Shared row ───────────────────────────────────────────────────────────────
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
      <span className="text-white/30 flex-shrink-0">{label}</span>
      <span className={cn("text-right", mono && "font-mono", dim ? "text-white/35" : "text-white/70")}>
        {value}
      </span>
    </div>
  );
}
