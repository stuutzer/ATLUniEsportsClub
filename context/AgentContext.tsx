"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

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
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

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
    hash: "0x8f...3a1c",
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
    hash: "0x2b...9c4e",
    isAgent: true,
  },
];

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  
  // Simulated Agent Budget (e.g., User authorized $5000 for the Agent to use)
  const [agentBalanceUsdc, setAgentBalanceUsdc] = useState<number>(5000.00);

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
      hash: realHash || "0x" + Math.random().toString(16).substring(2, 10) + "...", // Use real hash if provided
      isAgent: true,
    };

    // 2. Add to top of transaction history
    setTransactions((prev) => [newTx, ...prev]);

    // 3. Deduct from the Agent's local simulated budget
    setAgentBalanceUsdc((prev) => prev - amount);
    
  }, []);

  return (
    <AgentContext.Provider value={{ transactions, agentBalanceUsdc, executeAgentPurchase }}>
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