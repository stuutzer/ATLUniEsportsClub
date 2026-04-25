"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, useAccount, useEnsName } from "wagmi";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { useState, useEffect } from "react";
import { IdentityProvider, useIdentity } from "@/context/IdentityContext";

function IdentitySync() {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address, chainId: 1 });
  const { setIdentity } = useIdentity();

  useEffect(() => {
    setIdentity(address ?? null, ensName ?? null);
  }, [address, ensName, setIdentity]);

  return null;
}

function InnerProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <IdentityProvider>
        <IdentitySync />
        {children}
      </IdentityProvider>
    </QueryClientProvider>
  );
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <InnerProvider>{children}</InnerProvider>
    </WagmiProvider>
  );
}
