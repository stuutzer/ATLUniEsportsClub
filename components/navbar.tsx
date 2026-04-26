"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "@/components/wallet-button";
import { cn } from "@/lib/utils";
import { Search, ShoppingCart, User, Zap } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const isAgentPage = pathname === "/agent";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-sky-300/[0.15] border border-sky-200/20 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight hidden sm:block">
              Agent<span className="text-sky-200">Cart</span>
            </span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search AI agents and products..."
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 rounded-full text-sm",
                  "bg-white/5 border border-white/10 text-white placeholder:text-white/30",
                  "focus:outline-none focus:border-sky-200/40 focus:bg-white/8",
                  "transition-all duration-200"
                )}
              />
            </div>
          </form>

          {/* Right nav */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/agent"
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors",
                isAgentPage
                  ? "text-green-400 bg-green-400/10"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isAgentPage ? "bg-green-400 animate-pulse" : "bg-white/30"
                )}
              />
              <Zap className="w-4 h-4" />
              <span className="hidden sm:block">Agent</span>
            </Link>
            <Link
              href="/profile"
              className={cn(
                "p-2 rounded-full text-sm font-medium transition-colors",
                pathname === "/profile"
                  ? "text-sky-200 bg-sky-300/10"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <User className="w-4 h-4" />
            </Link>
            <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
