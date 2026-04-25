import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { metaMask, walletConnect } from "wagmi/connectors";
import { defineChain } from "viem";

// Avalanche Fuji C-Chain Testnet (chainId 43113)
export const avalancheFuji = defineChain({
  id: 43113,
  name: "Avalanche Fuji Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Avalanche",
    symbol: "AVAX",
  },
  rpcUrls: {
    default: { http: ["https://api.avax-test.network/ext/bc/C/rpc"] },
  },
  blockExplorers: {
    default: { name: "SnowTrace", url: "https://testnet.snowtrace.io" },
  },
  testnet: true,
});

// TODO: Replace with real WalletConnect project ID from https://cloud.walletconnect.com
const WALLETCONNECT_PROJECT_ID = "YOUR_WALLETCONNECT_PROJECT_ID";

export const wagmiConfig = createConfig({
  chains: [avalancheFuji, mainnet, sepolia],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
    }),
  ],
  transports: {
    [avalancheFuji.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
