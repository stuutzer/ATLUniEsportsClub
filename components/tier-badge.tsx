import { cn } from "@/lib/utils";
import type { Tier } from "@/lib/mockData";

const tierStyles: Record<Tier, string> = {
  S: "bg-purple-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.6)]",
  A: "bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.5)]",
  B: "bg-teal-600 text-white shadow-[0_0_12px_rgba(13,148,136,0.4)]",
};

const tierLabels: Record<Tier, string> = {
  S: "S-Tier",
  A: "A-Tier",
  B: "B-Tier",
};

interface TierBadgeProps {
  tier: Tier;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TierBadge({ tier, size = "md", className }: TierBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-bold rounded-full",
        size === "sm" && "text-xs px-2 py-0.5",
        size === "md" && "text-sm px-3 py-1",
        size === "lg" && "text-base px-4 py-1.5",
        tierStyles[tier],
        className
      )}
    >
      {tierLabels[tier]}
    </span>
  );
}
