"use client";
import { useState, useRef, useEffect } from "react";
import { useIdentity } from "@/context/IdentityContext";
import { Check, Copy, ChevronDown, ShoppingCart, MapPin, Bell, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

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

/* ── Brand icons ─────────────────────────────────────────────────────────── */
function AmazonIcon({ className }: { className?: string }) { return <img src="amazon.svg" alt="" className={className} />; }
function EbayIcon({ className }: { className?: string }) { return <img src="ebay.svg" alt="" className={className} />; }
function ShopifyIcon({ className }: { className?: string }) { return <img src="shopify.svg" alt="" className={className} />; }
function StockXIcon({ className }: { className?: string }) { return <img src="stockx.svg" alt="" className={className} />; }

/* ── Types ───────────────────────────────────────────────────────────────── */
type Integration = {
  key: string; label: string; description: string;
  icon: React.ReactNode; color: string; bgColor: string;
};

/* ── Toggle ──────────────────────────────────────────────────────────────── */
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
      <span className={cn(
        "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300",
        "group-hover:shadow-[0_0_12px_rgba(255,255,255,0.2)]",
        checked && "translate-x-4"
      )} />
    </button>
  );
}

/* ── Animated Section Block ──────────────────────────────────────────────── */
function SectionBlock({ label, iconBg, icon, defaultOpen = false, children }: {
  label: string; iconBg: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">(defaultOpen ? "auto" : 0);
  const [overflow, setOverflow] = useState<"hidden" | "visible">(defaultOpen ? "visible" : "hidden");
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
      const t = setTimeout(() => { setHeight("auto"); setOverflow("visible"); }, 360);
      return () => clearTimeout(t);
    } else {
      // Pin to px first so transition fires, then collapse to 0
      setHeight(el.scrollHeight);
      setOverflow("hidden");
      requestAnimationFrame(() => requestAnimationFrame(() => setHeight(0)));
    }
  }, [open, reducedMotion]);

  return (
    <div
      className={cn(
        "group rounded-xl bg-[#141414] border border-white/[0.07] overflow-hidden",
        "transition-[border-color,background-color,box-shadow,transform] duration-300",
        "hover:border-white/[0.12] hover:bg-[#171717]"
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors duration-300 hover:bg-white/[0.03] focus:outline-none focus-visible:bg-white/[0.04]"
      >
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
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
        <span className="flex-1 text-left text-white font-medium text-sm">{label}</span>
        <ChevronDown className={cn(
          "w-4 h-4 transition-[color,transform] duration-300",
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
            transition: reducedMotion ? "none" : `opacity 220ms ${EASE_OUT}, transform 340ms ${EASE_OUT}`,
          }}
        >
          <div className="border-t border-white/[0.07] py-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Marketplace Connections ─────────────────────────────────────────────── */
function MarketplaceConnections({ integrations, connected, onToggle }: {
  integrations: Integration[];
  connected: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const connectedList = integrations.filter(i => connected[i.key]);

  return (
    <div className="px-4 pt-2 pb-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {integrations.map((integration, index) => (
          <button
            key={integration.key}
            type="button"
            onClick={() => !connected[integration.key] && onToggle(integration.key)}
            title={connected[integration.key] ? `${integration.label} connected` : `Connect ${integration.label}`}
            className={cn(
              "group w-12 h-12 rounded-2xl flex items-center justify-center border will-change-transform",
              "transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95",
              "hover:-translate-y-0.5 hover:scale-105 active:translate-y-0 active:scale-95",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]",
              connected[integration.key]
                ? cn("border-white/[0.09] shadow-[0_12px_30px_rgba(0,0,0,0.22)]", integration.bgColor, integration.color)
                : "bg-white/[0.05] border-white/[0.08] text-white/30 hover:bg-white/[0.09] hover:text-white/60 hover:border-white/20"
            )}
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <div className="w-6 h-6 transition-transform duration-300 group-hover:scale-105">{integration.icon}</div>
          </button>
        ))}
      </div>

      {connectedList.length > 0 && (
        <div className="space-y-2">
          {connectedList.map((integration) => (
            <div
              key={integration.key}
              className="rounded-xl bg-white/[0.03] border border-white/[0.07] px-4 py-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", integration.bgColor, integration.color)}>
                  <div className="w-5 h-5">{integration.icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold leading-tight">Connected</p>
                  <p className="text-white/40 text-xs">{integration.label}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggle(integration.key)}
                  className="text-white/20 hover:text-red-400 transition-[background-color,color,transform] duration-200 p-1 rounded-md hover:bg-red-400/[0.08] hover:scale-105 active:scale-95"
                  title={`Disconnect ${integration.label}`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <p className="text-white/60 text-sm">Allow agent access</p>
                <Toggle
                  checked={enabled[integration.key] ?? true}
                  onChange={() => setEnabled(p => ({ ...p, [integration.key]: !(p[integration.key] ?? true) }))}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {connectedList.length === 0 && (
        <p className="text-white/20 text-xs text-center py-2 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">Click an icon above to connect a marketplace</p>
      )}
    </div>
  );
}

/* ── Address Form ────────────────────────────────────────────────────────── */
function AddressForm() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "", line1: "", line2: "", city: "", region: "", postcode: "", country: "New Zealand" });

  const inputClass = cn(
    "w-full px-3 py-2 rounded-lg text-sm text-white",
    "bg-white/[0.04] border border-white/[0.08]",
    "focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06]",
    "transition-[background-color,border-color,box-shadow,transform] duration-200",
    "focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]",
    "placeholder:text-white/20"
  );

  return (
    <div className="px-4 pt-1 pb-3 space-y-3">
      <div>
        <label className="text-xs text-white/30 uppercase tracking-widest block mb-1.5">Full Name</label>
        <input className={inputClass} placeholder="Jane Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>
      <div>
        <label className="text-xs text-white/30 uppercase tracking-widest block mb-1.5">Address Line 1</label>
        <input className={inputClass} placeholder="123 Queen Street" value={form.line1} onChange={e => setForm(f => ({ ...f, line1: e.target.value }))} />
      </div>
      <div>
        <label className="text-xs text-white/30 uppercase tracking-widest block mb-1.5">Address Line 2</label>
        <input className={inputClass} placeholder="Apartment, suite, unit (optional)" value={form.line2} onChange={e => setForm(f => ({ ...f, line2: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/30 uppercase tracking-widest block mb-1.5">City</label>
          <input className={inputClass} placeholder="Auckland" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs text-white/30 uppercase tracking-widest block mb-1.5">Region</label>
          <input className={inputClass} placeholder="Auckland" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/30 uppercase tracking-widest block mb-1.5">Postcode</label>
          <input className={inputClass} placeholder="1010" value={form.postcode} onChange={e => setForm(f => ({ ...f, postcode: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs text-white/30 uppercase tracking-widest block mb-1.5">Country</label>
          <select className={cn(inputClass, "cursor-pointer")} value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
            {["New Zealand", "Australia", "United States", "United Kingdom", "Canada"].map(c => (
              <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="button"
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
        className={cn(
          "mt-1 px-5 py-2 rounded-full text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-300",
          saved
            ? "bg-green-600/20 border border-green-500/30 text-green-400 scale-[0.98]"
            : "bg-purple-600 hover:bg-purple-700 text-white hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(124,58,237,0.38)] active:translate-y-0 active:scale-95"
        )}
      >
        {saved ? <span className="flex items-center gap-1.5 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95"><Check className="w-3.5 h-3.5" /> Saved</span> : "Save Address"}
      </button>
    </div>
  );
}

/* ── Preference Select ───────────────────────────────────────────────────── */
function PreferenceSelect({ label, description, options, value, onChange }: {
  label: string; description: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-white/[0.03] transition-[background-color,transform] duration-200 hover:translate-x-0.5">
      <div className="flex-1 min-w-0">
        <p className="text-white/85 text-sm font-medium">{label}</p>
        <p className="text-white/30 text-xs mt-0.5">{description}</p>
      </div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-white/[0.06] border border-white/[0.08] text-white/70 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500/40 cursor-pointer transition-[background-color,border-color,box-shadow] duration-200 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]"
      >
        {options.map(o => <option key={o} value={o} className="bg-[#1a1a1a]">{o}</option>)}
      </select>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { walletAddress, displayName } = useIdentity();
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState<Record<string, boolean>>({ amazon: false, ebay: false, shopify: false, stockx: false });
  const [currency, setCurrency] = useState("USD");
  const [network, setNetwork] = useState("Avalanche (Fuji)");
  const [notifications, setNotifications] = useState({ purchases: true, priceAlerts: false, webhooks: false });

  function copyAddress() {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const marketplaces: Integration[] = [
    { key: "amazon", label: "Amazon", description: "Search and purchase from Amazon", icon: <AmazonIcon className="w-5 h-5" />, color: "text-orange-400", bgColor: "bg-orange-400/10" },
    { key: "ebay", label: "eBay", description: "Browse listings and buy from eBay", icon: <EbayIcon className="w-5 h-5" />, color: "text-yellow-400", bgColor: "bg-yellow-400/10" },
    { key: "shopify", label: "Shopify", description: "Access Shopify Vendors", icon: <ShopifyIcon className="w-5 h-5" />, color: "text-sky-400", bgColor: "bg-sky-400/10" },
    { key: "stockx", label: "StockX", description: "Buy and sell on StockX", icon: <StockXIcon className="w-5 h-5" />, color: "text-green-400", bgColor: "bg-green-400/10" },
  ];

  const initials = displayName
    ? displayName.startsWith("0x") ? displayName.slice(2, 4).toUpperCase() : displayName.slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="p-8 max-w-full">
      <h1 className="text-2xl font-semibold text-white mb-7 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-500">Profile</h1>

      {/* Identity Card */}
      <div className="rounded-xl bg-[#141414] border border-white/[0.07] p-6 mb-4 flex items-center gap-5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 transition-[border-color,background-color] hover:border-white/[0.12] hover:bg-[#171717]">
        <div className="w-16 h-16 rounded-full bg-purple-900/40 border border-purple-600/30 flex items-center justify-center flex-shrink-0 transition-[box-shadow,transform] duration-300 hover:scale-105 hover:shadow-[0_0_28px_rgba(124,58,237,0.22)]">
          <span className="text-purple-300 text-xl font-bold">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-lg mb-1">{displayName ?? "Not connected"}</p>
          {walletAddress ? (
            <div className="flex items-center gap-2">
              <span className="text-white/35 font-mono text-xs truncate">{walletAddress}</span>
              <button type="button" onClick={copyAddress} className="text-white/25 hover:text-white/70 transition-[color,transform] duration-200 flex-shrink-0 hover:scale-110 active:scale-95" title="Copy address">
                {copied ? <Check className="w-3.5 h-3.5 text-green-400 motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-200" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          ) : (
            <p className="text-white/30 text-sm">Login by connecting your wallet</p>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:delay-100">
        <SectionBlock defaultOpen label="Marketplace Connections" iconBg="bg-purple-600/30" icon={<ShoppingCart className="w-4 h-4 text-white" />}>
          <MarketplaceConnections integrations={marketplaces} connected={connected} onToggle={(key) => setConnected(p => ({ ...p, [key]: !p[key] }))} />
        </SectionBlock>

        <SectionBlock label="Address Book" iconBg="bg-blue-600/30" icon={<MapPin className="w-4 h-4 text-white" />}>
          <AddressForm />
        </SectionBlock>

        <SectionBlock label="Crypto Preferences" iconBg="bg-emerald-600/30" icon={<Wallet className="w-4 h-4 text-white" />}>
          <PreferenceSelect label="Display Currency" description="Convert prices into your preferred currency" options={["USD", "NZD", "AUD", "AVAX", "ETH"]} value={currency} onChange={setCurrency} />
          <PreferenceSelect label="Preferred Network" description="Default chain for payments and transactions" options={["Avalanche (Fuji)", "Avalanche (Mainnet)", "Ethereum", "Polygon"]} value={network} onChange={setNetwork} />
        </SectionBlock>

        <SectionBlock label="Price Alerts & Notifications" iconBg="bg-yellow-600/30" icon={<Bell className="w-4 h-4 text-white" />}>
          {([
            { key: "purchases", label: "Purchase confirmations", description: "Notify when an agent purchase completes" },
            { key: "priceAlerts", label: "Price drop alerts", description: "Alert when a tracked item hits your target price" },
            { key: "webhooks", label: "Webhook delivery", description: "POST transaction events to your endpoint" },
          ] as const).map(({ key, label, description }) => (
            <div key={key} className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-white/[0.03] transition-[background-color,transform] duration-200 hover:translate-x-0.5">
              <div className="flex-1 min-w-0">
                <p className="text-white/85 text-sm font-medium">{label}</p>
                <p className="text-white/30 text-xs mt-0.5">{description}</p>
              </div>
              <Toggle checked={notifications[key]} onChange={() => setNotifications(p => ({ ...p, [key]: !p[key] }))} />
            </div>
          ))}
        </SectionBlock>
      </div>
    </div>
  );
}
