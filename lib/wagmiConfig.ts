import { http, createConfig } from "wagmi";
import { mainnet, sepolia, avalanche, avalancheFuji, baseSepolia } from "wagmi/chains";
import { metaMask, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

export const wagmiConfig = createConfig({
  chains: [avalanche, baseSepolia, avalancheFuji, mainnet, sepolia],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: projectId,
    }),
  ],
  transports: {
    [avalanche.id]: http(process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL),
    [baseSepolia.id]: http(),
    [avalancheFuji.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
