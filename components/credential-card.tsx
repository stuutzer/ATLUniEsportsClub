import { AgentCredential } from "@/lib/identity";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface CredentialCardProps {
  credential: AgentCredential;
  className?: string;
}

export function CredentialCard({ credential, className }: CredentialCardProps) {
  const validUntil = new Date(credential.expiresAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const permissionsLabel = credential.permissions
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" • ");

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden border border-white/10 border-l-[3px] border-l-sky-300/70",
        "bg-[#1a1a1a]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] bg-sky-300/[0.04]">
        <ShieldCheck className="w-4 h-4 text-sky-200 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold">Agent Credential</p>
          <p className="text-white/35 text-xs">Digital identity authorization</p>
        </div>
        <span className="text-[11px] text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full flex-shrink-0">
          Active
        </span>
      </div>

      {/* Fields */}
      <div className="px-5 py-4 space-y-2.5">
        <Field label="Agent" value={credential.agentName} mono />
        <Field label="Authorized For" value={credential.actingFor} mono />
        <Field label="Permissions" value={permissionsLabel} />
        <Field label="Spending Limit" value={`$${credential.spendingLimit}`} />
        <Field label="Valid Until" value={validUntil} />
        <div className="flex items-start justify-between gap-6">
          <span className="text-white/30 text-xs flex-shrink-0 pt-px">Signature</span>
          <div className="flex items-center gap-2 flex-shrink min-w-0">
            <span
              className={cn(
                "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border flex-shrink-0",
                credential.signatureType === "eip-712"
                  ? "text-green-400 bg-green-400/10 border-green-400/20"
                  : "text-sky-200/80 bg-sky-300/10 border-sky-300/20"
              )}
            >
              {credential.signatureType === "eip-712" ? "EIP-712" : "Demo"}
            </span>
            <span className="text-xs text-white/40 font-mono truncate">
              {credential.signature.slice(0, 14)}…
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  dim,
}: {
  label: string;
  value: string;
  mono?: boolean;
  dim?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <span className="text-white/30 text-xs flex-shrink-0 pt-px">{label}</span>
      <span
        className={cn(
          "text-xs text-right",
          mono && "font-mono",
          dim ? "text-white/40" : "text-white/75"
        )}
      >
        {value}
      </span>
    </div>
  );
}
