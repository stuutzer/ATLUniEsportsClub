"use client";

import { useEffect, useState } from "react";
import { X, Check, Download, Loader2 } from "lucide-react";
import type { Transaction, TransactionStatus } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useIdentity } from "@/context/IdentityContext";

interface OrderTrackingModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const statusConfig: Record<TransactionStatus, { label: string; className: string }> = {
  placed:     { label: "Order Placed",       className: "bg-white/8 text-white/50 border border-white/10" },
  confirmed:  { label: "Payment Confirmed",  className: "bg-blue-500/15 text-blue-300 border border-blue-500/20" },
  processing: { label: "Processing",         className: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/20" },
  shipped:    { label: "Shipped",            className: "bg-purple-500/15 text-purple-300 border border-purple-500/20" },
  delivered:  { label: "Delivered",          className: "bg-green-500/15 text-green-300 border border-green-500/20" },
};

export function OrderTrackingModal({ transaction, onClose }: OrderTrackingModalProps) {
  const { displayName } = useIdentity();
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
      const amountNum = parseFloat(transaction.amount) || 0;
      const fee = 0.001;
      const { downloadInvoice } = await import("@/components/invoice-pdf");
      await downloadInvoice(
        {
          invoiceNumber: transaction.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase(),
          agentName: "agentcart.eth",
          userName: displayName ?? "Unknown",
          merchantName: transaction.vendor,
          itemName: transaction.productName,
          amount: transaction.amount,
          token: transaction.token,
          networkFee: fee.toFixed(4),
          total: (amountNum + fee).toFixed(4),
          txHash: transaction.id,
          timestamp: new Date().toLocaleString(),
          status: "CONFIRMED",
        },
        transaction.id
      );
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
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full border-2 border-purple-500 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-[#3a3a3a]" />
                  )}

                  {/* Connecting line */}
                  {!isLast && (
                    <div
                      className={cn(
                        "w-0.5 flex-1 my-1.5",
                        isDone ? "bg-purple-600" : "bg-[#2e2e2e]"
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
                    <div className="mt-2 bg-[#2a1f3d] rounded-lg px-3 py-2 border border-purple-600/20">
                      <p className="text-white/75 text-xs">
                        🤖 Agent credential verified by merchant
                      </p>
                      <p className="text-purple-300/60 text-[11px] mt-0.5 font-mono">
                        Identity: agentcart.eth → justin.eth
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
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                Download Invoice
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
