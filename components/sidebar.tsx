"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gem, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { WalletButton } from "@/components/wallet-button";
import { useIdentity } from "@/context/IdentityContext";

const navItems = [
  { href: "/agent", icon: Gem, label: "Agent" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

function QuarterLogo() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="w-7 h-7"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 28 C4 14, 14 4, 28 4 L28 11 C18 11, 11 18, 11 28 Z"
        fill="#f5f5f5"
      />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { displayName, isCredentialActive } = useIdentity();

  const initials = displayName
    ? displayName.startsWith("0x")
      ? displayName.slice(2, 4).toUpperCase()
      : displayName.slice(0, 2).toUpperCase()
    : null;

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[#1a1a1a] border-r border-white/[0.04] flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 pt-7 pb-10">
        <QuarterLogo />
        <span className="text-white text-[22px] font-semibold tracking-tight">
          Quarter
        </span>
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
              {label}
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
          <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center flex-shrink-0">
            {initials ? (
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
              isCredentialActive ? "bg-green-400" : "bg-white/15"
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
