"use client";

import { useState, useEffect } from "react";
import { useIdentity } from "@/context/IdentityContext";
import {
  generateCredential,
  saveCredential,
  revokeCredential,
} from "@/lib/identity";
import { CredentialCard } from "@/components/credential-card";
import { Check, Copy, ShieldCheck, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_CATEGORIES = ["Electronics", "Clothing", "Food", "Software", "Travel", "Other"];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative w-9 h-5 rounded-full transition-colors flex-shrink-0",
        checked ? "bg-purple-600" : "bg-white/10"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-4"
        )}
      />
    </button>
  );
}

export default function ProfilePage() {
  const { walletAddress, ensName, displayName, credential, setCredential } =
    useIdentity();

  const [copied, setCopied] = useState(false);

  // Permissions state
  const [allowSearch, setAllowSearch] = useState(true);
  const [allowCompare, setAllowCompare] = useState(true);
  const [allowPurchase, setAllowPurchase] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [spendingLimit, setSpendingLimit] = useState("100");
  const [categories, setCategories] = useState<string[]>(["Electronics", "Software"]);

  // Sync permissions from existing credential on load
  useEffect(() => {
    if (!credential) return;
    setAllowSearch(credential.permissions.includes("search"));
    setAllowCompare(credential.permissions.includes("compare"));
    setAllowPurchase(credential.permissions.includes("purchase"));
    setSpendingLimit(String(credential.spendingLimit));
    setCategories(credential.allowedCategories);
  }, [credential]);

  function copyAddress() {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function buildPermissions() {
    const perms: string[] = [];
    if (allowSearch) perms.push("search");
    if (allowCompare) perms.push("compare");
    if (allowPurchase) perms.push("purchase");
    return perms;
  }

  function handleGenerate() {
    if (!walletAddress) return;
    const cred = generateCredential(
      walletAddress,
      ensName,
      buildPermissions(),
      Number(spendingLimit) || 100,
      categories
    );
    saveCredential(cred);
    setCredential(cred);
  }

  function handleRevoke() {
    revokeCredential();
    setCredential(null);
  }

  function handleRenew() {
    handleGenerate();
  }

  function toggleCategory(cat: string) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  const initials = displayName
    ? displayName.startsWith("0x")
      ? displayName.slice(2, 4).toUpperCase()
      : displayName.slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="p-8 max-w-full">
      <h1 className="text-2xl font-semibold text-white mb-7">Profile</h1>

      {/* ── Identity Card ─────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-[#141414] border border-white/[0.07] p-6 mb-4 flex items-center gap-5">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-purple-900/40 border border-purple-600/30 flex items-center justify-center flex-shrink-0">
          <span className="text-purple-300 text-xl font-bold">{initials}</span>
        </div>

        {/* Identity info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-white font-semibold text-lg">
              {displayName ?? "Not connected"}
            </p>
            {credential && (
              <span className="inline-flex items-center gap-1 text-[11px] text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Identity Verified ✓
              </span>
            )}
          </div>
          {walletAddress && (
            <div className="flex items-center gap-2">
              <span className="text-white/35 font-mono text-xs truncate">
                {walletAddress}
              </span>
              <button
                onClick={copyAddress}
                className="text-white/25 hover:text-white/70 transition-colors flex-shrink-0"
                title="Copy address"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
          {!walletAddress && (
            <p className="text-white/30 text-sm">Login by connecting your wallet</p>
          )}
        </div>
      </div>

      {/* ── Agent Credential Panel ───────────────────────────────────────── */}
      <div className="rounded-xl bg-[#141414] border border-white/[0.07] p-6 mb-4">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-4">
          Agent Credential
        </p>

        {credential ? (
          <>
            <CredentialCard credential={credential} className="mb-4" />
            <div className="flex gap-3">
              <button
                onClick={handleRevoke}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
              >
                <ShieldOff className="w-3.5 h-3.5" />
                Revoke
              </button>
              <button
                onClick={handleRenew}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm transition-colors"
              >
                Renew Credential
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-8 gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/8 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white/20" />
            </div>
            <div>
              <p className="text-white/70 font-medium mb-1">No Agent Credential Generated</p>
              <p className="text-white/30 text-sm max-w-xs">
                Generate a credential to allow Quarter to act on your behalf
                with merchants
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={!walletAddress}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-semibold transition-all",
                walletAddress
                  ? "bg-purple-600 hover:bg-purple-700 text-white hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
              )}
            >
              {walletAddress ? "Generate Credential" : "Connect wallet first"}
            </button>
          </div>
        )}
      </div>

      {/* ── Permissions Settings ─────────────────────────────────────────── */}
      <div className="rounded-xl bg-[#141414] border border-white/[0.07] p-6">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-5">
          Agent Permissions
        </p>

        <div className="space-y-4 mb-6">
          <PermissionRow
            label="Allow web search on my behalf"
            description="Agent can search the web for products"
            checked={allowSearch}
            onChange={() => setAllowSearch(!allowSearch)}
          />
          <PermissionRow
            label="Allow price comparison"
            description="Agent can compare prices across merchants"
            checked={allowCompare}
            onChange={() => setAllowCompare(!allowCompare)}
          />
          <PermissionRow
            label="Allow purchase initiation"
            description="Agent can initiate purchases on your behalf"
            checked={allowPurchase}
            onChange={() => setAllowPurchase(!allowPurchase)}
          />
          <PermissionRow
            label="Auto-approve purchases"
            description="Purchase without asking when under the limit"
            checked={autoApprove}
            onChange={() => setAutoApprove(!autoApprove)}
          />
        </div>

        {/* Spending limit */}
        <div className="mb-5">
          <label className="text-white/60 text-sm font-medium block mb-2">
            Spending limit per transaction
          </label>
          <div className="relative w-40">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">
              $
            </span>
            <input
              type="number"
              value={spendingLimit}
              onChange={(e) => setSpendingLimit(e.target.value)}
              min="1"
              className={cn(
                "w-full pl-7 pr-4 py-2 rounded-lg text-sm",
                "bg-white/[0.04] border border-white/8 text-white",
                "focus:outline-none focus:border-purple-500/40 transition-colors"
              )}
            />
          </div>
        </div>

        {/* Allowed categories */}
        <div className="mb-6">
          <p className="text-white/60 text-sm font-medium mb-2.5">
            Allowed categories
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  categories.includes(cat)
                    ? "bg-purple-600/20 border border-purple-500/40 text-purple-300"
                    : "bg-white/[0.04] border border-white/8 text-white/40 hover:text-white/70"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleGenerate}
          disabled={!walletAddress}
          className={cn(
            "px-5 py-2.5 rounded-full text-sm font-semibold transition-all",
            walletAddress
              ? "bg-purple-600 hover:bg-purple-700 text-white hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]"
              : "bg-white/5 text-white/20 cursor-not-allowed"
          )}
        >
          Save Permissions
        </button>
      </div>
    </div>
  );
}

function PermissionRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-white/80 text-sm">{label}</p>
        <p className="text-white/30 text-xs mt-0.5">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}
