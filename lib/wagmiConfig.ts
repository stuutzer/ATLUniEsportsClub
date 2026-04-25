import { http, createConfig } from "wagmi";
import { mainnet, sepolia, avalancheFuji, baseSepolia } from "wagmi/chains";
import { metaMask, walletConnect } from "wagmi/connectors";
import { defineChain } from "viem";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

export const wagmiConfig = createConfig({
  chains: [baseSepolia, avalancheFuji, mainnet, sepolia ],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: projectId,
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [avalancheFuji.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
