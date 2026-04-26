"use client";

import { useRouter } from "next/navigation";
import { Wallet, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function WalletRequiredModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
    >
      <div
        className={cn(
          "relative w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#141414] p-8",
          "shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-white/25 transition-colors hover:bg-white/[0.06] hover:text-white/60"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200/20 bg-sky-300/10 shadow-[0_0_32px_rgba(125,211,252,0.12)]">
            <Wallet className="h-6 w-6 text-sky-200" />
          </div>
        </div>

        <div className="mb-8 text-center">
          <h2 className="mb-2 text-base font-semibold text-white">
            Wallet Required
          </h2>
          <p className="text-sm leading-relaxed text-white/45">
            Connect your wallet and set up your profile to start searching and purchasing with your AI agent.
          </p>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => { onClose(); router.push("/wallet"); }}
            className={cn(
              "w-full rounded-full py-2.5 text-sm font-semibold",
              "bg-sky-200 text-[#06131d]",
              "transition-[background-color,transform,box-shadow] duration-200",
              "hover:bg-sky-100 hover:-translate-y-px",
              "shadow-[0_8px_24px_rgba(125,211,252,0.18)]"
            )}
          >
            Set Up Wallet
          </button>
          <button
            onClick={onClose}
            className={cn(
              "w-full rounded-full py-2.5 text-sm font-medium text-white/50",
              "border border-white/[0.08] bg-transparent",
              "transition-[background-color,color] duration-200",
              "hover:bg-white/[0.05] hover:text-white/75"
            )}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
