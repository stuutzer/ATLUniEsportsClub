"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, ShoppingBag, Wallet, User, Settings, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { WalletButton } from "@/components/wallet-button";
import { useIdentity } from "@/context/IdentityContext";

const navItems = [
  { href: "/agent", icon: Bot, label: "Agent" },
  { href: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
  { href: "/wallet", icon: Wallet, label: "Wallet" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { displayName, isCredentialActive } = useIdentity();

  const initials = displayName
    ? displayName.startsWith("0x")
      ? displayName.slice(2, 4).toUpperCase()
      : displayName.slice(0, 2).toUpperCase()
    : null;

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-[#111111] border-r border-white/5 flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="w-7 h-7 rounded-lg bg-purple-700 flex items-center justify-center flex-shrink-0">
          <ShoppingCart className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-bold text-base tracking-tight">
          Agent<span className="text-purple-400">Cart</span>
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#7c3aed] text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Identity display */}
      <div className="px-3 pb-3">
        <div className="h-px bg-white/[0.06] mb-3" />
        <Link
          href="/profile"
          className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors group"
        >
          <div className="w-7 h-7 rounded-full bg-purple-900/40 border border-purple-600/25 flex items-center justify-center flex-shrink-0">
            {initials ? (
              <span className="text-purple-300 text-[10px] font-semibold">{initials}</span>
            ) : (
              <User className="w-3.5 h-3.5 text-white/20" />
            )}
          </div>
          <span className="text-white/50 text-xs truncate group-hover:text-white/80 transition-colors flex-1 min-w-0">
            {displayName ?? "Not connected"}
          </span>
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full flex-shrink-0",
              isCredentialActive ? "bg-green-400" : "bg-white/15"
            )}
          />
        </Link>
      </div>

      {/* Wallet connect */}
      <div className="px-3 pb-5">
        <WalletButton className="w-full justify-center" />
      </div>
    </aside>
  );
}
