"use client";

import { useAccount } from "wagmi";
import { mockPurchaseHistory } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { User, Wallet, History, Settings, CheckCircle, Clock, XCircle } from "lucide-react";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// TODO: Replace with real wallet balances
const mockBalances = {
  ETH: { amount: "0.4821", usd: "$1,542.72" },
  AVAX: { amount: "48.32", usd: "$1,352.96" },
  USDC: { amount: "312.00", usd: "$312.00" },
};

const statusIcon: Record<string, React.ReactNode> = {
  Completed: <CheckCircle className="w-4 h-4 text-green-400" />,
  Pending: <Clock className="w-4 h-4 text-yellow-400" />,
  Failed: <XCircle className="w-4 h-4 text-red-400" />,
};

const statusColors: Record<string, string> = {
  Completed: "text-green-400",
  Pending: "text-yellow-400",
  Failed: "text-red-400",
};

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [autoApprove, setAutoApprove] = useState(true);
  const [spendLimit, setSpendLimit] = useState("100");
  const [preferredToken, setPreferredToken] = useState("AVAX");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="md:col-span-1 space-y-4">
          {/* Avatar + identity */}
          <div className="rounded-xl bg-[#141414] border border-white/10 p-5 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            {isConnected && address ? (
              <>
                {/* TODO: Replace with ENS name from @ensdomains/ensjs */}
                <p className="text-white font-semibold text-sm">Anonymous Agent</p>
                <p className="text-white/40 font-mono text-xs mt-1">{truncateAddress(address)}</p>
              </>
            ) : (
              <p className="text-white/40 text-sm">Wallet not connected</p>
            )}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between text-xs text-white/40 mb-1">
                <span>Purchases</span>
                <span className="text-white">{mockPurchaseHistory.length}</span>
              </div>
              <div className="flex justify-between text-xs text-white/40">
                <span>Total Spent</span>
                <span className="text-white">
                  ${mockPurchaseHistory.reduce((s, p) => s + p.amountPaid, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Balances */}
          <div className="rounded-xl bg-[#141414] border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-white/40 uppercase tracking-widest">Wallet Balances</p>
            </div>
            {/* TODO: Replace with real wallet balances */}
            <div className="space-y-3">
              {Object.entries(mockBalances).map(([token, { amount, usd }]) => (
                <div key={token} className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-sm font-medium">{token}</p>
                    <p className="text-white/40 text-xs">{amount}</p>
                  </div>
                  <p className="text-white/70 text-sm">{usd}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-2 space-y-6">
          {/* Purchase history */}
          <div className="rounded-xl bg-[#141414] border border-white/10 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
              <History className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-white/40 uppercase tracking-widest">Purchase History</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-3 text-white/30 font-normal text-xs">Date</th>
                    <th className="text-left px-5 py-3 text-white/30 font-normal text-xs">Item</th>
                    <th className="text-right px-5 py-3 text-white/30 font-normal text-xs">Amount</th>
                    <th className="text-right px-5 py-3 text-white/30 font-normal text-xs">Token</th>
                    <th className="text-right px-5 py-3 text-white/30 font-normal text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPurchaseHistory.map((entry) => (
                    <tr key={entry.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3 text-white/40 text-xs">{entry.date}</td>
                      <td className="px-5 py-3 text-white/80">{entry.item}</td>
                      <td className="px-5 py-3 text-right text-white font-medium">
                        ${entry.amountPaid.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-right text-white/50 text-xs">{entry.tokenUsed}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={cn("flex items-center gap-1 justify-end text-xs", statusColors[entry.status])}>
                          {statusIcon[entry.status]}
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Agent settings */}
          <div className="rounded-xl bg-[#141414] border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-5">
              <Settings className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-white/40 uppercase tracking-widest">Agent Settings</p>
            </div>
            <div className="space-y-5">
              {/* Auto-approve toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">Allow agent to auto-approve purchases</p>
                  <p className="text-white/40 text-xs mt-0.5">Agent will purchase without asking when under the limit</p>
                </div>
                <button
                  onClick={() => setAutoApprove(!autoApprove)}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors flex-shrink-0",
                    autoApprove ? "bg-purple-600" : "bg-white/10"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                      autoApprove && "translate-x-5"
                    )}
                  />
                </button>
              </div>

              {/* Spend limit */}
              {autoApprove && (
                <div>
                  <label className="text-white text-sm font-medium block mb-2">
                    Spending Limit (USD)
                  </label>
                  <div className="relative w-full max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">$</span>
                    <input
                      type="number"
                      value={spendLimit}
                      onChange={(e) => setSpendLimit(e.target.value)}
                      min="1"
                      className={cn(
                        "w-full pl-7 pr-4 py-2.5 rounded-full text-sm",
                        "bg-white/5 border border-white/10 text-white",
                        "focus:outline-none focus:border-purple-500/50",
                        "transition-all duration-200"
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Preferred token */}
              <div>
                <p className="text-white text-sm font-medium mb-2">Preferred Payment Token</p>
                <div className="flex gap-2">
                  {["ETH", "AVAX", "USDC"].map((token) => (
                    <button
                      key={token}
                      onClick={() => setPreferredToken(token)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all",
                        preferredToken === token
                          ? "bg-purple-600 text-white"
                          : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/10"
                      )}
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
