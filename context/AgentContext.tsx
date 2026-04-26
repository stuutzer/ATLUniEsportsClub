"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { useIdentity } from "@/context/IdentityContext";
import { getAgentIdentityRoot } from "@/lib/demoIdentity";

// Define the shape of a single transaction
export type Transaction = {
  id: string;
  date: string;
  type: string;
  item: string;
  amount: string;
  token: string;
  status: "Pending" | "Completed" | "Failed";
  hash: string;
  isAgent: boolean;
};

// Define what functions and data are available globally
interface AgentContextType {
  transactions: Transaction[];
  agentBalanceUsdc: number; // Simulated local Agent budget/allowance
  executeAgentPurchase: (item: string, amount: number, token: string, realHash?: string) => void;
  isAaveEnabled: boolean;
  toggleAaveYield: () => void;
  yieldEarned: number;
  liveApy: number;
  statusLabel: string;
  agentIdentity: string | null;
  setAgentIdentity: (label: string | null) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);
const AGENT_IDENTITY_STORAGE_KEY = "agentcart_agent_identity";

// The initial hardcoded transactions you had in the Wallet Page
const initialTransactions: Transaction[] = [
  {
    id: "tx-1",
    date: "Today, 14:32",
    type: "Agent Purchase",
    item: "MSI GeForce RTX 4090 24GB",
    amount: "-1,850.00",
    token: "dNZD",
    status: "Completed",
    hash: "0x8f4a2d1e9b3c7f06a5d8e2b4c9f1a3d7e8b2c5f9a4d1e6b3c8f2a5d9e1b4c7f3",
    isAgent: true,
  },
  {
    id: "tx-2",
    date: "Yesterday, 09:15",
    type: "Utility Payment",
    item: "Mercury Energy Bill (Auto-paid)",
    amount: "-124.50",
    token: "dNZD",
    status: "Completed",
    hash: "0x2b7e9f3a1d4c8b5e2f6a9d3c7e1b4f8a2d5c9e3b6f1a4d7c2e5b8f3a6d1c4e9b",
    isAgent: true,
  },
];

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const { ensName } = useIdentity();
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  
  // Simulated Agent Budget (e.g., User authorized $5000 for the Agent to use)
  const [agentBalanceUsdc, setAgentBalanceUsdc] = useState<number>(5000.00);
  const [isAaveEnabled, setIsAaveEnabled] = useState(false);
  const [yieldEarned, setYieldEarned] = useState(0);
  const [agentIdentity, setAgentIdentityState] = useState<string | null>(null);
  const liveApy = 5.2;
  const agentIdentityRoot = useMemo(() => getAgentIdentityRoot(ensName), [ensName]);

  useEffect(() => {
    const saved = window.localStorage.getItem(AGENT_IDENTITY_STORAGE_KEY);
    if (saved) {
      const normalizedSaved = saved.trim().toLowerCase();
      const currentRootSuffix = `.${agentIdentityRoot}`;
      if (normalizedSaved.endsWith(currentRootSuffix)) {
        setAgentIdentityState(normalizedSaved);
        return;
      }

      const label = normalizedSaved.split(".")[0];
      const migratedIdentity = `${label}${currentRootSuffix}`;
      window.localStorage.setItem(AGENT_IDENTITY_STORAGE_KEY, migratedIdentity);
      setAgentIdentityState(migratedIdentity);
    }
  }, [agentIdentityRoot]);

  // The globally available purchase function that any button can call
  const executeAgentPurchase = useCallback((item: string, amount: number, token: string, realHash?: string) => {
    // 1. Create a new transaction record
    const newTxId = `tx-${Date.now()}`;
    const newTx: Transaction = {
      id: newTxId,
      date: "Just now",
      type: "Agent Purchase",
      item: item,
      amount: `-${amount.toFixed(2)}`,
      token: token,
      status: "Completed", // We set it to completed because the blockchain transaction is already mined
      hash: realHash || "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      isAgent: true,
    };

    // 2. Add to top of transaction history
    setTransactions((prev) => [newTx, ...prev]);

    // 3. Deduct from the Agent's local simulated budget
    setAgentBalanceUsdc((prev) => prev - amount);
    
  }, []);

  const toggleAaveYield = useCallback(() => {
    setIsAaveEnabled((prev) => !prev);
  }, []);

  const setAgentIdentity = useCallback((label: string | null) => {
    if (!label) {
      window.localStorage.removeItem(AGENT_IDENTITY_STORAGE_KEY);
      setAgentIdentityState(null);
      return;
    }

    const normalized = `${label.trim().toLowerCase()}.${agentIdentityRoot}`;
    window.localStorage.setItem(AGENT_IDENTITY_STORAGE_KEY, normalized);
    setAgentIdentityState(normalized);
  }, [agentIdentityRoot]);

  useEffect(() => {
    if (!isAaveEnabled) return;

    const interval = window.setInterval(() => {
      setYieldEarned((prev) => prev + 0.0015);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isAaveEnabled]);

  const statusLabel = isAaveEnabled
    ? "Agent is optimizing your idle funds"
    : "Idle funds stay in wallet until optimization is enabled";

  return (
    <AgentContext.Provider
      value={{
        transactions,
        agentBalanceUsdc,
        executeAgentPurchase,
        isAaveEnabled,
        toggleAaveYield,
        yieldEarned,
        liveApy,
        statusLabel,
        agentIdentity,
        setAgentIdentity,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

// Custom hook to use the context easily in any component
export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error("useAgent must be used within an AgentProvider");
  }
  return context;
}
