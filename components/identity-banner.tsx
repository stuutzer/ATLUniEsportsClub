"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
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
          <span>Expires in {hoursLeft}h</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center pt-5 px-8">
      <Link
        href="/profile"
        className="quarter-button px-4 py-2 text-xs"
      >
        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
        <span>No agent credential — purchases unavailable.</span>
        <span className="font-semibold underline underline-offset-2">
          Generate one in Profile
        </span>
      </Link>
    </div>
  );
}
