"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { Bot } from "lucide-react";
import { useAgent } from "@/context/AgentContext";

// Standard ERC20 ABI for the transfer function
const erc20Abi = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const;

// The dNZD Contract on Base Sepolia
const DNZD_CONTRACT_ADDRESS = "0x63ee4b77d3912dc7bce711c3be7bf12d532f1853";

// Dummy Merchant Address (Replace with any wallet address you control if you want to see the funds arrive)
const DUMMY_MERCHANT_ADDRESS = "0x000000000000000000000000000000000000dEaD"; 

// Define a simple product type based on your mockData
interface ProductProp {
  name: string;
  price: number;
}

export function BuyItemButton({ product }: { product: ProductProp }) {
  const { executeAgentPurchase } = useAgent();
  const [isPurchased, setIsPurchased] = useState(false);

  // Wagmi hooks for writing to the blockchain
  const { writeContract, data: hash, isPending: isWalletPending, error } = useWriteContract();
  
  // Wagmi hook to wait for the block to be mined
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleBuy = () => {
    // 1. Trigger MetaMask to send the transaction
    writeContract({
      address: DNZD_CONTRACT_ADDRESS,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [
        DUMMY_MERCHANT_ADDRESS, 
        parseUnits(product.price.toString(), 6) // Convert price to 6 decimals for dNZD
      ]
    });
  };

  // 2. Watch for the blockchain confirmation
  useEffect(() => {
    if (isConfirmed && hash && !isPurchased) {
      // Once confirmed, log it to our UI Wallet Page with the REAL transaction hash!
      executeAgentPurchase(product.name, product.price, "dNZD", hash);
      setIsPurchased(true);
    }
  }, [isConfirmed, hash, isPurchased, executeAgentPurchase, product]);

  // Determine button text based on blockchain state
  let buttonText = "Buy with Agent";
  if (isWalletPending) buttonText = "Confirm in Wallet...";
  if (isConfirming) buttonText = "Processing on Base...";
  if (isConfirmed) buttonText = "Purchase Complete!";

  return (
    <button 
      onClick={handleBuy}
      disabled={isWalletPending || isConfirming || isConfirmed}
      className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-xl disabled:opacity-50 transition-all text-sm font-medium mt-4 shadow-lg shadow-purple-900/20"
    >
      <Bot className="w-4 h-4" />
      {buttonText}
    </button>
  );
}