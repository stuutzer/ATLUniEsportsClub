"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AgentCredential, loadCredential } from "@/lib/identity";

interface IdentityContextValue {
  walletAddress: string | null;
  ensName: string | null;
  displayName: string | null;
  credential: AgentCredential | null;
  isCredentialActive: boolean;
  setIdentity: (address: string | null, ens: string | null) => void;
  setCredential: (c: AgentCredential | null) => void;
}

const IdentityContext = createContext<IdentityContextValue>({
  walletAddress: null,
  ensName: null,
  displayName: null,
  credential: null,
  isCredentialActive: false,
  setIdentity: () => {},
  setCredential: () => {},
});

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [credential, setCredentialState] = useState<AgentCredential | null>(null);

  useEffect(() => {
    setCredentialState(loadCredential());
  }, []);

  function setIdentity(address: string | null, ens: string | null) {
    setWalletAddress(address);
    setEnsName(ens);
  }

  function setCredential(c: AgentCredential | null) {
    setCredentialState(c);
  }

  const displayName =
    ensName ??
    (walletAddress ? "Justin" : null);

  return (
    <IdentityContext.Provider
      value={{
        walletAddress,
        ensName,
        displayName,
        credential,
        isCredentialActive: !!credential,
        setIdentity,
        setCredential,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  return useContext(IdentityContext);
}
