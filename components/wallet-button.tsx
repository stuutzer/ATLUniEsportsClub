"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { cn } from "@/lib/utils";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface WalletButtonProps {
  className?: string;
}

export function WalletButton({ className }: WalletButtonProps = {}) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [showMenu, setShowMenu] = useState(false);

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
            "bg-white/10 hover:bg-white/[0.15] border border-white/10",
            "text-white transition-all duration-200",
            className
          )}
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {/* TODO: Replace with ENS name from @ensdomains/ensjs resolution */}
          {truncateAddress(address)}
        </button>
        {showMenu && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-xs text-white/50">Connected</p>
              <p className="text-sm text-white font-mono mt-0.5">{truncateAddress(address)}</p>
            </div>
            <button
              onClick={() => { disconnect(); setShowMenu(false); }}
              className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: metaMask() })}
      className={cn(
        "px-5 py-2 rounded-full text-sm font-semibold",
        "border border-white/[0.15] bg-sky-200 text-[#06131d] hover:bg-sky-100",
        "transition-all duration-200 shadow-[0_10px_28px_rgba(0,0,0,0.28)]",
        className
      )}
    >
      Connect Wallet
    </button>
  );
}
