"use client";

import { useState } from "react";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { avalanche, baseSepolia } from "wagmi/chains";
import { Wallet, LogOut, CheckCircle, Clock, ExternalLink, Bot, AlertCircle, Download, Loader2, Beaker } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgent } from "@/context/AgentContext";
import { useIdentity } from "@/context/IdentityContext";
import { generateInvoiceData, buildFilename } from "@/lib/invoiceData";
import { AVALANCHE_USDC_ADDRESS } from "@/lib/aave";

const DNZD_CONTRACT_ADDRESS = "0x63ee4b77d3912dc7bce711c3be7bf12d532f1853";

// Hackathon MVP only: Local mock price oracle for USD value calculation
const MOCK_TOKEN_PRICES: Record<string, number> = {
  AVAX: 35.50,
  dNZD: 0.6,
  USDC: 1,
  ETH: 3000.00,
};

function Toggle({ checked, onChange, disabled = false }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "group relative h-5 w-9 flex-shrink-0 rounded-full transition-[background-color,box-shadow,transform] duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]",
        "active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.22)]"
          : "bg-white/10 hover:bg-white/[0.16]"
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300",
          checked && "translate-x-4"
        )}
      />
    </button>
  );
}

export default function WalletPage() {
  const { displayName, ensName, walletAddress } = useIdentity();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [downloadingTx, setDownloadingTx] = useState<string | null>(null);

  async function handleDownloadInvoice(tx: ReturnType<typeof useAgent>["transactions"][0]) {
    setDownloadingTx(tx.id);
    try {
      const invoiceData = generateInvoiceData({
        item: tx.item,
        hash: tx.hash,
        date: tx.date,
        amount: tx.amount,
        token: tx.token,
        status: tx.status,
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
      setDownloadingTx(null);
    }
  }

  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  const {
    transactions,
    executeAgentPurchase,
    isAaveEnabled,
    toggleAaveYield,
    yieldEarned,
    liveApy,
    statusLabel,
    agentIdentity,
  } = useAgent();

  const { data: nativeBalance } = useBalance({
    address,
  });
  const { data: dnzdBalance } = useBalance({
    address,
    token: DNZD_CONTRACT_ADDRESS,
    chainId: baseSepolia.id,
  });
  const { data: usdcBalance } = useBalance({
    address,
    token: AVALANCHE_USDC_ADDRESS,
    chainId: avalanche.id,
  });

  function simulatePurchase() {
    const fakeHash =
      "0x" +
      Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
    const sampleItems = [
      "Neural Pro Keyboard",
      "Aurora Wireless Headphones",
      "Quantum Coffee Subscription",
      "Helios Smart Lamp",
    ];
    const item = sampleItems[Math.floor(Math.random() * sampleItems.length)];
    const price = +(Math.random() * 200 + 10).toFixed(2);
    executeAgentPurchase(item, price, "AVAX", fakeHash);
  }

  const renderBalanceCard = (
    fallbackSymbol: string,
    balanceData?: { formatted: string, symbol: string },
    statusNode?: React.ReactNode
  ) => {
    const amount = balanceData ? Number(balanceData.formatted) : 0;
    const actualSymbol = balanceData?.symbol || fallbackSymbol;
    const effectiveAmount =
      actualSymbol === "USDC" ? amount + yieldEarned : amount;
    const price = MOCK_TOKEN_PRICES[actualSymbol] || 1.00;
    const usdValue = effectiveAmount * price;
    const formattedAmount = actualSymbol.includes("USD") || actualSymbol.includes("NZD")
      ? effectiveAmount.toFixed(2)
      : amount.toFixed(4);

    return (
      <div
        key={fallbackSymbol}
        className="rounded-xl bg-[#141414] border border-white/[0.07] p-6 relative overflow-hidden group hover:border-sky-200/20 transition-colors"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="text-xs text-white/30 uppercase tracking-widest">
            {actualSymbol}
          </p>
          {statusNode}
        </div>
        <p className="text-white font-bold text-3xl mb-1">
          {formattedAmount}{" "}
          <span className="text-lg text-white/40 font-normal">{actualSymbol}</span>
        </p>
        <p className="text-white/40 text-sm">${usdValue.toFixed(2)}</p>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-sky-300/[0.08] rounded-full blur-2xl group-hover:bg-sky-300/[0.12] transition-all" />
      </div>
    );
  };

  const handleConnect = () => {
    if (typeof window !== "undefined" && !window.ethereum) {
      setShowInstallModal(true);
      return;
    }
    connect({ connector: injected() });
  };

  return (
    <div className="p-8 relative">

      {/* Install Wallet Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-sky-300/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-sky-200" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Wallet Not Detected</h3>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">
              We couldn't detect a Web3 wallet in your browser. Please install MetaMask to enable AI purchasing features.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="quarter-button rounded-xl py-3 font-semibold"
                onClick={() => setShowInstallModal(false)}
              >
                Install MetaMask
              </a>
              <button
                onClick={() => setShowInstallModal(false)}
                className="text-white/40 hover:text-white text-sm py-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <h1 className="text-2xl font-semibold text-white mb-7">Wallet</h1>

      {/* ── Identity / Connection Card ───────────────────────────────────── */}
      <div className="rounded-xl bg-[#141414] border border-white/[0.07] p-6 mb-4 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-sky-300/10 border border-sky-200/20 flex items-center justify-center flex-shrink-0">
          <Wallet className="w-6 h-6 text-sky-200" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-lg mb-1">
            {isConnected ? (displayName ?? "Connected") : "Not connected"}
          </p>
          <p className="text-white/30 text-sm">
            {isConnected
              ? "Manage funds and view AI spending history"
              : "Connect your wallet to fund your AI Agent"}
          </p>
        </div>
        {isConnected ? (
          <button
            onClick={() => disconnect()}
            className="quarter-button flex-shrink-0 px-4 py-2"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="quarter-button flex-shrink-0 px-5 py-2.5 font-semibold"
          >
            {isConnecting ? "Connecting…" : "Connect MetaMask"}
          </button>
        )}
      </div>

      {/* ── Balances Panel ───────────────────────────────────────────────── */}
      <div className="rounded-xl bg-[#141414] border border-white/[0.07] p-6 mb-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest">
              Balances
            </p>
            {isAaveEnabled && (
              <p className="mt-2 text-xs font-medium text-emerald-400 animate-pulse">
                Earning {liveApy.toFixed(1)}% APY via Aave...
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/80">Smart Yield</p>
              <p className="text-[11px] text-white/35">
                Idle USDC auto-deposits into Aave after 24h
              </p>
            </div>
            <Toggle checked={isAaveEnabled} onChange={toggleAaveYield} />
          </div>
        </div>

        {isConnected ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderBalanceCard(nativeBalance?.symbol ?? "Native", nativeBalance)}
            {renderBalanceCard("dNZD", dnzdBalance)}
            {renderBalanceCard(
              "USDC",
              usdcBalance,
              isAaveEnabled ? (
                <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300 animate-pulse">
                  Earning {liveApy.toFixed(1)}% APY via Aave...
                </span>
              ) : undefined
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-8 gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/8 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white/20" />
            </div>
            <div>
              <p className="text-white/70 font-medium mb-1">No Wallet Connected</p>
              <p className="text-white/30 text-sm max-w-xs">
                Connect your Web3 wallet to view real-time balances
              </p>
            </div>
            <button
              onClick={handleConnect}
              className="quarter-button px-5 py-2.5 font-semibold"
            >
              Connect Wallet
            </button>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/[0.07] pt-4">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
              isAaveEnabled
                ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                : "border border-white/[0.10] bg-white/[0.04] text-white/55"
            )}
          >
            {statusLabel}
          </span>
          <span className="text-xs text-white/35">
            Total Yield Earned: ${yieldEarned.toFixed(2)} USDC
          </span>
          {isAaveEnabled ? (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-300 animate-pulse">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Auto-routing idle capital into Aave vault strategy...
            </span>
          ) : (
            <span className="text-xs text-white/35">
              Yield engine paused. Accrued gains remain in wallet balance.
            </span>
          )}
        </div>
      </div>

      {/* ── Transaction History Panel ────────────────────────────────────── */}
      <div className="rounded-xl bg-[#141414] border border-white/[0.07] overflow-hidden">
        {/* Panel header — mirrors Agent Credential / Agent Permissions label style */}
        <div className="px-6 py-5 border-b border-white/[0.07] flex justify-between items-center">
          <p className="text-xs text-white/30 uppercase tracking-widest">
            Transaction History
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={simulatePurchase}
              className="quarter-button rounded-md px-2.5 py-1 text-xs"
              title="Add a synthetic transaction (no wallet needed) to test invoice generation"
            >
              <Beaker className="w-3.5 h-3.5" />
              Simulate purchase (dev)
            </button>
            <span className="flex items-center gap-1.5 text-xs text-sky-200 bg-sky-300/10 px-2.5 py-1 rounded-md border border-sky-200/20">
              <Bot className="w-3.5 h-3.5" />
              100% Agent Managed
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] text-white/30 font-medium text-xs">
                <th className="text-left px-6 py-4 uppercase tracking-widest w-[15%]">Date</th>
                <th className="text-left px-6 py-4 uppercase tracking-widest w-[33%]">Item &amp; Type</th>
                <th className="text-right px-6 py-4 uppercase tracking-widest w-[13%]">Amount</th>
                <th className="text-right px-6 py-4 uppercase tracking-widest w-[13%]">Status</th>
                <th className="text-right px-6 py-4 uppercase tracking-widest w-[10%]">Hash</th>
                <th className="text-right px-6 py-4 uppercase tracking-widest w-[8%]">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 text-white/40">{tx.date}</td>
                    <td className="px-6 py-4">
                      <p className="text-white/90 font-medium flex items-center gap-2">
                        {tx.item}
                        {tx.isAgent && <Bot className="w-3.5 h-3.5 text-sky-200" />}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5">{tx.type}</p>
                    </td>
                    <td
                      className={cn(
                        "px-6 py-4 text-right font-mono",
                        tx.amount.startsWith("+") ? "text-green-400" : "text-white"
                      )}
                    >
                      {tx.amount}{" "}
                      <span className="text-xs text-white/30">{tx.token}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center gap-1.5">
                        {tx.status === "Completed" ? (
                          <CheckCircle className="w-4 h-4 text-green-500/70" />
                        ) : (
                          <Clock className="w-4 h-4 text-sky-400/70 animate-pulse" />
                        )}
                        <span
                          className={cn(
                            "text-xs",
                            tx.status === "Completed"
                              ? "text-white/50"
                              : "text-sky-400/70"
                          )}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center gap-1 text-white/20 transition-colors hover:text-white/70">
                        <span
                          className={cn(
                            "text-xs",
                            agentIdentity ? "text-emerald-300 animate-pulse" : "font-mono"
                          )}
                        >
                          {agentIdentity ?? tx.hash.slice(0, 6)}
                        </span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(tx)}
                        disabled={downloadingTx === tx.id}
                        title="Download Invoice"
                        className="inline-flex items-center justify-center text-white/20 transition-colors hover:text-white/70 disabled:opacity-40"
                      >
                        {downloadingTx === tx.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="inline-flex flex-col items-center justify-center opacity-40">
                      <Bot className="w-8 h-8 mb-3" />
                      <p className="text-white text-sm">
                        No transactions yet - buy with Agent or use Simulate purchase to add one
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
