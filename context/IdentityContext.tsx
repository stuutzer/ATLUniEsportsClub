"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AgentCredential, loadCredential } from "@/lib/identity";

interface IdentityContextValue {
  walletAddress: string | null;
  ensName: string | null;
  ensAvatar: string | null;
  displayName: string | null;
  credential: AgentCredential | null;
  isCredentialActive: boolean;
  setIdentity: (address: string | null, ens: string | null, avatar: string | null) => void;
  setCredential: (c: AgentCredential | null) => void;
}

const IdentityContext = createContext<IdentityContextValue>({
  walletAddress: null,
  ensName: null,
  ensAvatar: null,
  displayName: null,
  credential: null,
  isCredentialActive: false,
  setIdentity: () => {},
  setCredential: () => {},
});

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [ensAvatar, setEnsAvatar] = useState<string | null>(null);
  const [credential, setCredentialState] = useState<AgentCredential | null>(null);

  useEffect(() => {
    setCredentialState(loadCredential());
  }, []);

  function setIdentity(address: string | null, ens: string | null, avatar: string | null) {
    setWalletAddress(address);
    setEnsName(ens);
    setEnsAvatar(avatar);
  }

  function setCredential(c: AgentCredential | null) {
    setCredentialState(c);
  }

  const displayName =
    ensName ??
    (walletAddress
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : null);

  return (
    <IdentityContext.Provider
      value={{
        walletAddress,
        ensName,
        ensAvatar,
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
