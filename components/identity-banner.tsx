"use client";

import Link from "next/link";
import { useIdentity } from "@/context/IdentityContext";

export function IdentityBanner() {
  const { credential } = useIdentity();

  if (credential) {
    const hoursLeft = Math.max(
      0,
      Math.floor((new Date(credential.expiresAt).getTime() - Date.now()) / 3_600_000)
    );

    return (
      <div className="flex justify-center pt-5 px-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/8 border border-green-500/20 text-green-400 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
          <span>Quarter Identity Active</span>
          <span className="text-green-400/40">•</span>
          <span>
            acting as <span className="font-medium">{credential.actingFor}</span>
          </span>
          <span className="text-green-400/40">•</span>
          <span>Limit ${credential.spendingLimit}</span>
          <span className="text-green-400/40">•</span>
          <span>Expires in {hoursLeft}h</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center pt-5 px-8">
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/8 border border-yellow-500/20 text-yellow-400 text-xs hover:bg-yellow-500/12 transition-colors"
      >
        <span className="flex-shrink-0">⚠</span>
        <span>No agent credential — purchases unavailable.</span>
        <span className="font-semibold underline underline-offset-2">
          Generate one in Profile →
        </span>
      </Link>
    </div>
  );
}
