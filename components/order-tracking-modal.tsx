"use client";

import { useEffect, useState } from "react";
import { X, Check, Download, Loader2 } from "lucide-react";
import type { Transaction, TransactionStatus } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useIdentity } from "@/context/IdentityContext";
import { useAgent } from "@/context/AgentContext";
import { generateInvoiceData, buildFilename } from "@/lib/invoiceData";

interface OrderTrackingModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const statusConfig: Record<TransactionStatus, { label: string; className: string }> = {
  placed:     { label: "Order Placed",       className: "bg-white/8 text-white/50 border border-white/10" },
  confirmed:  { label: "Payment Confirmed",  className: "bg-blue-500/15 text-blue-300 border border-blue-500/20" },
  processing: { label: "Processing",         className: "bg-sky-400/15 text-sky-200 border border-sky-400/20" },
  shipped:    { label: "Shipped",            className: "bg-sky-300/[0.15] text-sky-200 border border-sky-200/20" },
  delivered:  { label: "Delivered",          className: "bg-green-500/15 text-green-300 border border-green-500/20" },
};

export function OrderTrackingModal({ transaction, onClose }: OrderTrackingModalProps) {
  const { displayName, ensName, walletAddress } = useIdentity();
  const { agentIdentity } = useAgent();
  const [downloading, setDownloading] = useState(false);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleDownloadInvoice() {
    setDownloading(true);
    try {
      const invoiceData = generateInvoiceData({
        productName: transaction.productName,
        vendor: transaction.vendor,
        amount: transaction.amount,
        token: transaction.token,
        status: transaction.status,
        hash: transaction.id,
        userName: displayName ?? undefined,
        agentName: agentIdentity ?? undefined,
        userENS: ensName ?? undefined,
        userWallet: walletAddress ?? undefined,
      });
      const [{ pdf }, { InvoicePDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/invoice-pdf"),
      ]);
      const blob = await pdf(<InvoicePDF data={invoiceData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = buildFilename(invoiceData);
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  const firstIncompleteIdx = transaction.steps.findIndex((s) => !s.done);
  const badge = statusConfig[transaction.status];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1a1a1a] rounded-2xl p-8 w-[480px] max-h-[80vh] flex flex-col shadow-2xl border border-white/[0.08]">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/25 hover:text-white/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h2 className="text-white font-bold text-xl leading-snug mb-1">
              {transaction.productName}
            </h2>
            <p className="text-white/40 text-[13px]">{transaction.vendor}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-white font-bold text-xl">
              {transaction.amount} {transaction.token}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.07] mb-5" />

        {/* Status badge */}
        <div className="mb-5">
          <span className={cn("text-xs font-medium px-3 py-1.5 rounded-full", badge.className)}>
            {badge.label}
          </span>
        </div>

        {/* Timeline — scrollable */}
        <div className="overflow-y-auto scrollbar-hide flex-1 -mr-2 pr-2">
          {transaction.steps.map((step, i) => {
            const isDone = step.done;
            const isCurrent = i === firstIncompleteIdx;
            const isLast = i === transaction.steps.length - 1;
            const isMerchantVerify = i === 2;

            return (
              <div key={i} className="flex gap-3.5">
                {/* Circle + vertical line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  {/* Circle */}
                  {isDone ? (
                    <div className="w-6 h-6 rounded-full bg-sky-300 text-black flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full border-2 border-sky-200 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-sky-200 animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-[#3a3a3a]" />
                  )}

                  {/* Connecting line */}
                  {!isLast && (
                    <div
                      className={cn(
                        "w-0.5 flex-1 my-1.5",
                        isDone ? "bg-sky-300" : "bg-[#2e2e2e]"
                      )}
                      style={{ minHeight: 20 }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className={cn("min-w-0", isLast ? "pb-0" : "pb-4")}>
                  <p
                    className={cn(
                      "text-sm font-medium leading-none mb-1",
                      isDone ? "text-white" : isCurrent ? "text-white/70" : "text-white/25"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.time && (
                    <p className="text-white/30 text-xs">{step.time}</p>
                  )}

                  {/* Special "Merchant Verified Agent" card */}
                  {isMerchantVerify && isDone && (
                    <div className="mt-2 bg-sky-300/[0.06] rounded-lg px-3 py-2 border border-sky-200/[0.15]">
                      <p className="text-white/75 text-xs">
                        🤖 Agent credential verified by merchant
                      </p>
                      <p className="text-sky-200/60 text-[11px] mt-0.5 font-mono">
                        Identity: quarter.eth → justin.eth
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-white/[0.07] flex items-center justify-between gap-3">
          <p className="text-white/25 text-xs truncate">
            Txn: {transaction.id}
          </p>
          <div className="flex items-center gap-3 flex-shrink-0">
            {transaction.status === "delivered" && (
              <button
                onClick={handleDownloadInvoice}
                disabled={downloading}
                className="quarter-button rounded-lg px-3 py-1.5 text-xs"
              >
                {downloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                Download Invoice ↓
              </button>
            )}
            <button className="text-white/25 hover:text-white/50 text-xs transition-colors">
              {/* TODO: link to testnet explorer */}
              View on Explorer →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
