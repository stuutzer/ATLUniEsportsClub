"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gem, User, Settings, Wallet, ShoppingCart, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { WalletButton } from "@/components/wallet-button";
import { useIdentity } from "@/context/IdentityContext";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";

const navItems = [
  { href: "/agent", icon: Gem, label: "Agent" },
  { href: "/cart", icon: ShoppingCart, label: "Cart" },
  { href: "/orders", icon: ClipboardList, label: "Orders" },
  { href: "/wallet", icon: Wallet, label: "Wallet" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

function QuarterLogo() {
  return (
    <Link
      href="/agent"
      aria-label="Go to Agent"
      className="inline-flex rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
    >
      <img src="quarter.png" alt="Quarter" className="h-5" />
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { displayName, ensAvatar, walletAddress } = useIdentity();
  const { itemCount } = useCart();
  const { pendingCount } = useOrders();

  const initials = displayName
    ? displayName.startsWith("0x")
      ? displayName.slice(2, 4).toUpperCase()
      : displayName.slice(0, 2).toUpperCase()
    : null;

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[#1a1a1a] border-r border-white/[0.04] flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-1 px-6 pt-10 pb-5">
        <QuarterLogo />
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href === "/agent" && pathname === "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-colors",
                isActive
                  ? "bg-[#2a2a2a] text-white"
                  : "text-white/55 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {href === "/cart" && itemCount > 0 && (
                <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sky-300/15 px-1.5 text-[10px] font-semibold text-sky-200 ring-1 ring-sky-300/25">
                  {itemCount}
                </span>
              )}
              {href === "/orders" && pendingCount > 0 && (
                <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-300/15 px-1.5 text-[10px] font-semibold text-amber-200 ring-1 ring-amber-300/25">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Identity display */}
      <div className="px-4 pb-3">
        <div className="h-px bg-white/[0.05] mb-3" />
        <Link
          href="/profile"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
        >
          <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {ensAvatar ? (
              <img src={ensAvatar} alt="" className="h-full w-full object-cover" />
            ) : initials ? (
              <span className="text-white/80 text-[10px] font-semibold">{initials}</span>
            ) : (
              <User className="w-3.5 h-3.5 text-white/30" />
            )}
          </div>
          <span className="text-white/55 text-xs truncate group-hover:text-white/80 transition-colors flex-1 min-w-0">
            {displayName ?? "Not connected"}
          </span>
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full flex-shrink-0",
              walletAddress ? "bg-green-400" : "bg-white/15"
            )}
          />
        </Link>
      </div>

      {/* Wallet connect */}
      <div className="px-4 pb-5">
        <WalletButton className="w-full justify-center" />
      </div>
    </aside>
  );
}
