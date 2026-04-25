"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { injected } from "wagmi/connectors";
import { avalancheFuji } from "wagmi/chains";
import { Wallet, LogOut, CheckCircle, Clock, ExternalLink, Bot, AlertCircle, Download, Loader2, Beaker } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgent } from "@/context/AgentContext";
import { useIdentity } from "@/context/IdentityContext";

// Hackathon MVP only: Local mock price oracle for USD value calculation
const MOCK_TOKEN_PRICES: Record<string, number> = {
  AVAX: 35.50,
  dNZD: 0.60,
  ETH: 3000.00,
};


export default function WalletPage() {
  const { displayName } = useIdentity();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [downloadingTx, setDownloadingTx] = useState<string | null>(null);

  async function handleDownloadInvoice(tx: ReturnType<typeof useAgent>["transactions"][0]) {
    setDownloadingTx(tx.id);
    try {
      const cleanAmount = tx.amount.replace(/[+\-,\s]/g, "");
      const amountNum = parseFloat(cleanAmount) || 0;
      const fee = 0.001;
      const { downloadInvoice } = await import("@/components/invoice-pdf");
      await downloadInvoice(
        {
          invoiceNumber: tx.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
          agentName: "agentcart.eth",
          userName: displayName ?? "Unknown",
          merchantName: "AgentCart Marketplace",
          itemName: tx.item,
          amount: cleanAmount,
          token: tx.token,
          networkFee: fee.toFixed(3),
          total: (amountNum + fee).toFixed(3),
          txHash: tx.hash,
          timestamp: tx.date,
          status: tx.status === "Completed" ? "CONFIRMED" : "PENDING",
        },
        tx.id
      );
    } finally {
      setDownloadingTx(null);
    }
  }

  // Wagmi connection states
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  const { transactions, executeAgentPurchase } = useAgent();

  // Native AVAX balance on Fuji (Avalanche C-Chain testnet)
  const { data: nativeBalance } = useBalance({
    address,
    chainId: avalancheFuji.id,
  });

  // Hackathon-only: synthesize a transaction so the invoice flow can be tested
  // without a wallet, faucet, or on-chain send. Generates a random 32-byte hash.
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

  // Dynamically renders the balance card using on-chain symbol data
  const renderBalanceCard = (fallbackSymbol: string, balanceData?: { formatted: string, symbol: string }) => {
    const amount = balanceData ? Number(balanceData.formatted) : 0;
    
    // Extract real symbol from contract if available, otherwise use fallback
    const actualSymbol = balanceData?.symbol || fallbackSymbol; 
    
    const price = MOCK_TOKEN_PRICES[actualSymbol] || 1.00;
    const usdValue = amount * price;
    
    // Determine decimal formatting based on token type
    const formattedAmount = actualSymbol.includes("USD") || actualSymbol.includes("NZD") 
      ? amount.toFixed(2) 
      : amount.toFixed(4);

    return (
      <div key={fallbackSymbol} className="rounded-xl bg-[#1c1c1c] border border-white/5 p-5 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
        <p className="text-white/40 text-xs uppercase tracking-widest mb-3">{actualSymbol}</p>
        <p className="text-white font-bold text-3xl mb-1">
          {formattedAmount} <span className="text-lg text-white/40 font-normal">{actualSymbol}</span>
        </p>
        <p className="text-white/40 text-sm">${usdValue.toFixed(2)}</p>
        
        {/* Decorative background glow effect */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all"></div>
      </div>
    );
  };

  // Custom connection handler to intercept users without a Web3 wallet
  const handleConnect = () => {
    if (typeof window !== "undefined" && !window.ethereum) {
      setShowInstallModal(true);
      return;
    }
    connect({ connector: injected() });
  };

  return (
    <div className="max-w-6xl mx-auto p-8 relative">
      
      {/* Custom Install Wallet Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all">
            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-purple-400" />
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
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl transition-colors"
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

      {/* Header navigation section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Agent Wallet</h1>
          <p className="text-white/40 text-sm">Manage funds and view AI spending history</p>
        </div>
        
        {isConnected ? (
          <button
            onClick={() => disconnect()}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-sm py-2 px-4 rounded-full transition-all"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-6 rounded-full transition-colors disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Connect MetaMask"}
          </button>
        )}
      </div>

      {/* Asset cards layout */}
      {isConnected ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {renderBalanceCard("AVAX", nativeBalance)}

          {/* Empty placeholder card for balanced layout design */}
          <div className="rounded-xl bg-[#1c1c1c]/50 border border-white/5 border-dashed p-5 flex flex-col items-center justify-center text-white/20 hover:border-white/20 transition-colors cursor-pointer">
            <span className="text-xs uppercase tracking-widest">+ Add Token</span>
          </div>
          <div className="rounded-xl bg-[#1c1c1c]/50 border border-white/5 border-dashed p-5 flex flex-col items-center justify-center text-white/20 hover:border-white/20 transition-colors cursor-pointer">
            <span className="text-xs uppercase tracking-widest">+ Add Token</span>
          </div>
        </div>
      ) : (
        <div className="bg-[#1c1c1c] border border-white/5 rounded-xl p-12 flex flex-col items-center justify-center mb-10 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-white/30" />
          </div>
          <h3 className="text-white font-medium mb-2">Wallet Disconnected</h3>
          <p className="text-white/40 text-sm max-w-sm mb-6">
            Connect your Web3 wallet to fund your AI Agent and view real-time balances.
          </p>
          <button
            onClick={handleConnect}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2.5 px-8 rounded-full transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {/* Transaction history section */}
      <div className="rounded-xl bg-[#1c1c1c] border border-white/5 overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#141414]">
          <h2 className="text-white font-medium">Transaction History</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={simulatePurchase}
              className="flex items-center gap-1.5 text-xs text-yellow-300/80 bg-yellow-400/8 hover:bg-yellow-400/15 px-2.5 py-1 rounded-md border border-yellow-400/20 transition-colors"
              title="Add a synthetic transaction (no wallet needed) to test invoice generation"
            >
              <Beaker className="w-3.5 h-3.5" />
              Simulate purchase (dev)
            </button>
            <span className="flex items-center gap-1.5 text-xs text-purple-400 bg-purple-400/10 px-2.5 py-1 rounded-md border border-purple-400/20">
              <Bot className="w-3.5 h-3.5" />
              100% Agent Managed
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-white/30 font-medium text-xs">
                <th className="text-left px-6 py-4 uppercase tracking-wider w-[15%]">Date</th>
                <th className="text-left px-6 py-4 uppercase tracking-wider w-[33%]">Item & Type</th>
                <th className="text-right px-6 py-4 uppercase tracking-wider w-[13%]">Amount</th>
                <th className="text-right px-6 py-4 uppercase tracking-wider w-[13%]">Status</th>
                <th className="text-right px-6 py-4 uppercase tracking-wider w-[10%]">Hash</th>
                <th className="text-right px-6 py-4 uppercase tracking-wider w-[8%]">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {isConnected ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors group">
                    <td className="px-6 py-4 text-white/40">{tx.date}</td>
                    <td className="px-6 py-4">
                      <p className="text-white/90 font-medium flex items-center gap-2">
                        {tx.item}
                        {tx.isAgent && (
                           <Bot className="w-3.5 h-3.5 text-purple-400" />
                        )}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5">{tx.type}</p>
                    </td>
                    <td className={cn(
                      "px-6 py-4 text-right font-mono",
                      tx.amount.startsWith("+") ? "text-green-400" : "text-white"
                    )}>
                      {tx.amount} <span className="text-xs text-white/30">{tx.token}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center gap-1.5">
                        {tx.status === "Completed" ? (
                          <CheckCircle className="w-4 h-4 text-green-500/70" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500/70 animate-pulse" />
                        )}
                        <span className={cn(
                          "text-xs",
                          tx.status === "Completed" ? "text-white/50" : "text-yellow-500/70"
                        )}>{tx.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-white/20 hover:text-purple-400 transition-colors inline-flex items-center gap-1">
                        <span className="font-mono text-xs">{tx.hash.slice(0,6)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(tx)}
                        disabled={downloadingTx === tx.id}
                        title="Download Invoice"
                        className="text-white/20 hover:text-purple-400 transition-colors inline-flex items-center justify-center disabled:opacity-40"
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
                      <p className="text-white text-sm">Connect wallet to sync Agent transaction history</p>
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