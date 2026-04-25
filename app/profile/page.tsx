"use client";

import { useEffect, useRef, useState } from "react";
import { useSignTypedData } from "wagmi";
import {
  Bell,
  Check,
  ChevronDown,
  Copy,
  MapPin,
  ShieldCheck,
  ShieldOff,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { CredentialCard } from "@/components/credential-card";
import { useIdentity } from "@/context/IdentityContext";
import {
  buildCredentialDraft,
  buildTypedData,
  finalizeCredential,
  generateMockCredential,
  saveCredential,
  revokeCredential,
} from "@/lib/identity";
import { cn } from "@/lib/utils";

const ALL_CATEGORIES = ["Electronics", "Clothing", "Food", "Software", "Travel", "Other"];
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

type Integration = {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
};

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);

    const handleChange = () => setReducedMotion(query.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return reducedMotion;
}

function AmazonIcon({ className }: { className?: string }) {
  return <img src="amazon.svg" alt="" className={className} />;
}

function EbayIcon({ className }: { className?: string }) {
  return <img src="ebay.svg" alt="" className={className} />;
}

function ShopifyIcon({ className }: { className?: string }) {
  return <img src="shopify.svg" alt="" className={className} />;
}

function StockXIcon({ className }: { className?: string }) {
  return <img src="stockx.svg" alt="" className={className} />;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "group relative h-5 w-9 flex-shrink-0 rounded-full transition-[background-color,box-shadow,transform] duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]",
        "active:scale-95",
        checked
          ? "bg-purple-600 shadow-[0_0_18px_rgba(124,58,237,0.28)]"
          : "bg-white/10 hover:bg-white/[0.16]"
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300",
          "group-hover:shadow-[0_0_12px_rgba(255,255,255,0.2)]",
          checked && "translate-x-4"
        )}
      />
    </button>
  );
}

function SectionBlock({
  label,
  iconBg,
  icon,
  defaultOpen = false,
  children,
}: {
  label: string;
  iconBg: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">(defaultOpen ? "auto" : 0);
  const [overflow, setOverflow] = useState<"hidden" | "visible">(
    defaultOpen ? "visible" : "hidden"
  );
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    if (reducedMotion) {
      setHeight(open ? "auto" : 0);
      setOverflow(open ? "visible" : "hidden");
      return;
    }

    if (open) {
      const h = el.scrollHeight;
      setOverflow("hidden");
      setHeight(h);
      const t = setTimeout(() => {
        setHeight("auto");
        setOverflow("visible");
      }, 360);
      return () => clearTimeout(t);
    }

    setHeight(el.scrollHeight);
    setOverflow("hidden");
    requestAnimationFrame(() => requestAnimationFrame(() => setHeight(0)));
  }, [open, reducedMotion]);

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-xl border border-white/[0.07] bg-[#141414]",
        "transition-[border-color,background-color,box-shadow,transform] duration-300",
        "hover:border-white/[0.12] hover:bg-[#171717]"
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors duration-300 hover:bg-white/[0.03] focus:outline-none focus-visible:bg-white/[0.04]"
      >
        <div
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
            "transition-[transform,box-shadow] duration-300",
            open
              ? "scale-110 shadow-[0_0_18px_rgba(255,255,255,0.08)]"
              : "scale-100 group-hover:scale-105",
            iconBg
          )}
          style={{ transitionTimingFunction: EASE_SPRING }}
        >
          {icon}
        </div>
        <span className="flex-1 text-left text-sm font-medium text-white">{label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-[color,transform] duration-300",
            open ? "rotate-180 text-white/65" : "rotate-0 text-white/30 group-hover:text-white/45"
          )}
          style={{ transitionTimingFunction: EASE_SPRING }}
        />
      </button>

      <div
        style={{
          height: height === "auto" ? "auto" : `${height}px`,
          overflow,
          transition: reducedMotion ? "none" : `height 340ms ${EASE_OUT}`,
        }}
      >
        <div
          ref={contentRef}
          style={{
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0)" : "translateY(-6px)",
            transition: reducedMotion
              ? "none"
              : `opacity 220ms ${EASE_OUT}, transform 340ms ${EASE_OUT}`,
          }}
        >
          <div className="border-t border-white/[0.07] py-2">{children}</div>
        </div>
      </div>
    </div>
  );
}

function MarketplaceConnections({
  integrations,
  connected,
  onToggle,
}: {
  integrations: Integration[];
  connected: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const connectedList = integrations.filter((i) => connected[i.key]);

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="mb-4 flex flex-wrap gap-2">
        {integrations.map((integration) => (
          <button
            key={integration.key}
            type="button"
            onClick={() => !connected[integration.key] && onToggle(integration.key)}
            title={
              connected[integration.key]
                ? `${integration.label} connected`
                : `Connect ${integration.label}`
            }
            className={cn(
              "group flex h-12 w-12 items-center justify-center rounded-2xl border will-change-transform",
              "transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "hover:-translate-y-0.5 hover:scale-105 active:translate-y-0 active:scale-95",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]",
              connected[integration.key]
                ? cn(
                    "border-white/[0.09] shadow-[0_12px_30px_rgba(0,0,0,0.22)]",
                    integration.bgColor,
                    integration.color
                  )
                : "border-white/[0.08] bg-white/[0.05] text-white/30 hover:border-white/20 hover:bg-white/[0.09] hover:text-white/60"
            )}
          >
            <div className="h-6 w-6 transition-transform duration-300 group-hover:scale-105">
              {integration.icon}
            </div>
          </button>
        ))}
      </div>

      {connectedList.length > 0 ? (
        <div className="space-y-2">
          {connectedList.map((integration) => (
            <div
              key={integration.key}
              className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3"
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl",
                    integration.bgColor,
                    integration.color
                  )}
                >
                  <div className="h-5 w-5">{integration.icon}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight text-white">Connected</p>
                  <p className="text-xs text-white/40">{integration.label}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggle(integration.key)}
                  className="rounded-md p-1 text-white/20 transition-[background-color,color,transform] duration-200 hover:scale-105 hover:bg-red-400/[0.08] hover:text-red-400 active:scale-95"
                  title={`Disconnect ${integration.label}`}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-2">
                <p className="text-sm text-white/60">Allow agent access</p>
                <Toggle
                  checked={enabled[integration.key] ?? true}
                  onChange={() =>
                    setEnabled((p) => ({
                      ...p,
                      [integration.key]: !(p[integration.key] ?? true),
                    }))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-2 text-center text-xs text-white/20">
          Click an icon above to connect a marketplace
        </p>
      )}
    </div>
  );
}

function AddressForm() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postcode: "",
    country: "New Zealand",
  });

  const inputClass = cn(
    "w-full rounded-lg px-3 py-2 text-sm text-white",
    "border border-white/[0.08] bg-white/[0.04]",
    "focus:border-purple-500/50 focus:bg-white/[0.06] focus:outline-none",
    "transition-[background-color,border-color,box-shadow,transform] duration-200",
    "focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]",
    "placeholder:text-white/20"
  );

  return (
    <div className="space-y-3 px-4 pb-3 pt-1">
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-widest text-white/30">
          Full Name
        </label>
        <input
          className={inputClass}
          placeholder="Jane Smith"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-widest text-white/30">
          Address Line 1
        </label>
        <input
          className={inputClass}
          placeholder="123 Queen Street"
          value={form.line1}
          onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-widest text-white/30">
          Address Line 2
        </label>
        <input
          className={inputClass}
          placeholder="Apartment, suite, unit (optional)"
          value={form.line2}
          onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-white/30">
            City
          </label>
          <input
            className={inputClass}
            placeholder="Auckland"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-white/30">
            Region
          </label>
          <input
            className={inputClass}
            placeholder="Auckland"
            value={form.region}
            onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-white/30">
            Postcode
          </label>
          <input
            className={inputClass}
            placeholder="1010"
            value={form.postcode}
            onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-white/30">
            Country
          </label>
          <select
            className={cn(inputClass, "cursor-pointer")}
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
          >
            {["New Zealand", "Australia", "United States", "United Kingdom", "Canada"].map(
              (country) => (
                <option key={country} value={country} className="bg-[#1a1a1a]">
                  {country}
                </option>
              )
            )}
          </select>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
        className={cn(
          "mt-1 rounded-full px-5 py-2 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-300",
          saved
            ? "scale-[0.98] border border-green-500/30 bg-green-600/20 text-green-400"
            : "bg-purple-600 text-white hover:-translate-y-0.5 hover:bg-purple-700 hover:shadow-[0_0_22px_rgba(124,58,237,0.38)] active:translate-y-0 active:scale-95"
        )}
      >
        {saved ? (
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        ) : (
          "Save Address"
        )}
      </button>
    </div>
  );
}

function PreferenceSelect({
  label,
  description,
  options,
  value,
  onChange,
}: {
  label: string;
  description: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg px-4 py-3 transition-[background-color,transform] duration-200 hover:translate-x-0.5 hover:bg-white/[0.03]">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white/85">{label}</p>
        <p className="mt-0.5 text-xs text-white/30">{description}</p>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer rounded-lg border border-white/[0.08] bg-white/[0.06] px-3 py-1.5 text-xs text-white/70 transition-[background-color,border-color,box-shadow] duration-200 focus:border-purple-500/40 focus:outline-none focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#1a1a1a]">
            {option}
          </option>
        ))}
      </select>
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
    <div className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-[background-color,transform] duration-200 hover:translate-x-0.5 hover:bg-white/[0.03]">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white/85">{label}</p>
        <p className="mt-0.5 text-xs text-white/30">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function ProfilePage() {
  const { walletAddress, ensName, displayName, credential, setCredential } = useIdentity();
  const { signTypedDataAsync } = useSignTypedData();

  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [connected, setConnected] = useState<Record<string, boolean>>({
    amazon: false,
    ebay: false,
    shopify: false,
    stockx: false,
  });
  const [currency, setCurrency] = useState("USD");
  const [network, setNetwork] = useState("Avalanche (Fuji)");
  const [notifications, setNotifications] = useState({
    purchases: true,
    priceAlerts: false,
    webhooks: false,
  });
  const [allowSearch, setAllowSearch] = useState(true);
  const [allowCompare, setAllowCompare] = useState(true);
  const [allowPurchase, setAllowPurchase] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [spendingLimit, setSpendingLimit] = useState("100");
  const [categories, setCategories] = useState<string[]>(["Electronics", "Software"]);

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

  async function handleGenerate() {
    if (!walletAddress || generating) return;
    setGenerating(true);
    const draft = buildCredentialDraft(
      walletAddress,
      ensName,
      buildPermissions(),
      Number(spendingLimit) || 100,
      categories
    );

    try {
      const typedData = buildTypedData(draft);
      const signature = await signTypedDataAsync(typedData);
      const cred = finalizeCredential(draft, signature, "eip-712");
      saveCredential(cred);
      setCredential(cred);
    } catch (err) {
      console.warn("EIP-712 signing failed, falling back to mock signature", err);
      const cred = generateMockCredential(
        walletAddress,
        ensName,
        buildPermissions(),
        Number(spendingLimit) || 100,
        categories
      );
      saveCredential(cred);
      setCredential(cred);
    } finally {
      setGenerating(false);
    }
  }

  function handleRevoke() {
    revokeCredential();
    setCredential(null);
  }

  function toggleCategory(cat: string) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  const marketplaces: Integration[] = [
    {
      key: "amazon",
      label: "Amazon",
      description: "Search and purchase from Amazon",
      icon: <AmazonIcon className="h-5 w-5" />,
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
    },
    {
      key: "ebay",
      label: "eBay",
      description: "Browse listings and buy from eBay",
      icon: <EbayIcon className="h-5 w-5" />,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
    {
      key: "shopify",
      label: "Shopify",
      description: "Access Shopify Vendors",
      icon: <ShopifyIcon className="h-5 w-5" />,
      color: "text-sky-400",
      bgColor: "bg-sky-400/10",
    },
    {
      key: "stockx",
      label: "StockX",
      description: "Buy and sell on StockX",
      icon: <StockXIcon className="h-5 w-5" />,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
  ];

  const initials = displayName
    ? displayName.startsWith("0x")
      ? displayName.slice(2, 4).toUpperCase()
      : displayName.slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="max-w-full p-8">
      <h1 className="mb-7 text-2xl font-semibold text-white">
        Profile
      </h1>

      <div className="mb-4 flex items-center gap-5 rounded-xl border border-white/[0.07] bg-[#141414] p-6 transition-[border-color,background-color] hover:border-white/[0.12] hover:bg-[#171717]">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-purple-600/30 bg-purple-900/40 transition-[box-shadow,transform] duration-300 hover:scale-105 hover:shadow-[0_0_28px_rgba(124,58,237,0.22)]">
          <span className="text-xl font-bold text-purple-300">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold text-white">{displayName ?? "Not connected"}</p>
            {credential && (
              <span className="inline-flex items-center gap-1 rounded-full border border-green-400/20 bg-green-400/10 px-2 py-0.5 text-[11px] text-green-400">
                <ShieldCheck className="h-3 w-3" />
                Identity Verified ✓
              </span>
            )}
          </div>
          {walletAddress ? (
            <div className="flex items-center gap-2">
              <span className="truncate font-mono text-xs text-white/35">{walletAddress}</span>
              <button
                type="button"
                onClick={copyAddress}
                className="flex-shrink-0 text-white/25 transition-[color,transform] duration-200 hover:scale-110 hover:text-white/70 active:scale-95"
                title="Copy address"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ) : (
            <p className="text-sm text-white/30">Login by connecting your wallet</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <SectionBlock
          label="Marketplace Connections"
          iconBg="bg-purple-600/30"
          icon={<ShoppingCart className="h-4 w-4 text-white" />}
        >
          <MarketplaceConnections
            integrations={marketplaces}
            connected={connected}
            onToggle={(key) => setConnected((p) => ({ ...p, [key]: !p[key] }))}
          />
        </SectionBlock>

        <SectionBlock
          label="Address Book"
          iconBg="bg-blue-600/30"
          icon={<MapPin className="h-4 w-4 text-white" />}
        >
          <AddressForm />
        </SectionBlock>

        <SectionBlock
          label="Crypto Preferences"
          iconBg="bg-emerald-600/30"
          icon={<Wallet className="h-4 w-4 text-white" />}
        >
          <PreferenceSelect
            label="Display Currency"
            description="Convert prices into your preferred currency"
            options={["USD", "NZD", "AUD", "AVAX", "ETH"]}
            value={currency}
            onChange={setCurrency}
          />
          <PreferenceSelect
            label="Preferred Network"
            description="Default chain for payments and transactions"
            options={["Avalanche (Fuji)", "Avalanche (Mainnet)", "Ethereum", "Polygon"]}
            value={network}
            onChange={setNetwork}
          />
        </SectionBlock>

        <SectionBlock
          label="Price Alerts & Notifications"
          iconBg="bg-yellow-600/30"
          icon={<Bell className="h-4 w-4 text-white" />}
        >
          {[
            {
              key: "purchases",
              label: "Purchase confirmations",
              description: "Notify when an agent purchase completes",
            },
            {
              key: "priceAlerts",
              label: "Price drop alerts",
              description: "Alert when a tracked item hits your target price",
            },
            {
              key: "webhooks",
              label: "Webhook delivery",
              description: "POST transaction events to your endpoint",
            },
          ].map(({ key, label, description }) => (
            <div
              key={key}
              className="flex items-center gap-4 rounded-lg px-4 py-3 transition-[background-color,transform] duration-200 hover:translate-x-0.5 hover:bg-white/[0.03]"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white/85">{label}</p>
                <p className="mt-0.5 text-xs text-white/30">{description}</p>
              </div>
              <Toggle
                checked={notifications[key as keyof typeof notifications]}
                onChange={() =>
                  setNotifications((p) => ({
                    ...p,
                    [key]: !p[key as keyof typeof notifications],
                  }))
                }
              />
            </div>
          ))}
        </SectionBlock>
      </div>
    </div>
  );
}
