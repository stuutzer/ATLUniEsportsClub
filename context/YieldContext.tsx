"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AAVE_TARGET_APY } from "@/lib/aave";

const STORAGE_KEY = "agentcart_yield_optimization";

type YieldSnapshot = {
  enabled: boolean;
  liveApy: number;
  optimizedUsdc: number;
  realizedYieldUsdc: number;
  yieldStartAt: number | null;
  lastActivityAt: number | null;
  lastOptimizedAt: number | null;
};

type YieldContextValue = {
  enabled: boolean;
  liveApy: number;
  optimizedUsdc: number;
  totalYieldEarned: number;
  lastActivityAt: number | null;
  lastOptimizedAt: number | null;
  statusLabel: string;
  setEnabled: (enabled: boolean) => void;
  setLiveApy: (apy: number) => void;
  markActivity: () => void;
  recordOptimization: (amountUsdc: number) => void;
};

const defaultSnapshot: YieldSnapshot = {
  enabled: false,
  liveApy: AAVE_TARGET_APY,
  optimizedUsdc: 0,
  realizedYieldUsdc: 0,
  yieldStartAt: null,
  lastActivityAt: null,
  lastOptimizedAt: null,
};

const YieldContext = createContext<YieldContextValue | undefined>(undefined);

function loadSnapshot(): YieldSnapshot {
  if (typeof window === "undefined") return defaultSnapshot;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSnapshot;
    return { ...defaultSnapshot, ...JSON.parse(raw) };
  } catch {
    return defaultSnapshot;
  }
}

function computeAccruedYield(
  realizedYieldUsdc: number,
  optimizedUsdc: number,
  liveApy: number,
  yieldStartAt: number | null
) {
  if (!yieldStartAt || optimizedUsdc <= 0) return realizedYieldUsdc;

  const elapsedMs = Math.max(Date.now() - yieldStartAt, 0);
  const elapsedYears = elapsedMs / (1000 * 60 * 60 * 24 * 365);
  return realizedYieldUsdc + optimizedUsdc * (liveApy / 100) * elapsedYears;
}

export function YieldProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<YieldSnapshot>(defaultSnapshot);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setSnapshot(loadSnapshot());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [hydrated, snapshot]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const totalYieldEarned = useMemo(
    () =>
      computeAccruedYield(
        snapshot.realizedYieldUsdc,
        snapshot.optimizedUsdc,
        snapshot.liveApy,
        snapshot.yieldStartAt
      ),
    [now, snapshot.liveApy, snapshot.optimizedUsdc, snapshot.realizedYieldUsdc, snapshot.yieldStartAt]
  );

  const setEnabled = useCallback((enabled: boolean) => {
    setSnapshot((prev) => ({ ...prev, enabled }));
  }, []);

  const setLiveApy = useCallback((apy: number) => {
    setSnapshot((prev) => ({ ...prev, liveApy: apy }));
  }, []);

  const markActivity = useCallback(() => {
    setSnapshot((prev) => ({ ...prev, lastActivityAt: Date.now() }));
  }, []);

  const recordOptimization = useCallback((amountUsdc: number) => {
    setSnapshot((prev) => {
      const realizedYieldUsdc = computeAccruedYield(
        prev.realizedYieldUsdc,
        prev.optimizedUsdc,
        prev.liveApy,
        prev.yieldStartAt
      );

      return {
        ...prev,
        enabled: true,
        optimizedUsdc: amountUsdc,
        realizedYieldUsdc,
        yieldStartAt: Date.now(),
        lastOptimizedAt: Date.now(),
      };
    });
  }, []);

  const statusLabel = snapshot.enabled
    ? "Agent is optimizing your idle funds"
    : "Idle funds stay in wallet until optimization is enabled";

  return (
    <YieldContext.Provider
      value={{
        enabled: snapshot.enabled,
        liveApy: snapshot.liveApy,
        optimizedUsdc: snapshot.optimizedUsdc,
        totalYieldEarned,
        lastActivityAt: snapshot.lastActivityAt,
        lastOptimizedAt: snapshot.lastOptimizedAt,
        statusLabel,
        setEnabled,
        setLiveApy,
        markActivity,
        recordOptimization,
      }}
    >
      {children}
    </YieldContext.Provider>
  );
}

export function useYield() {
  const context = useContext(YieldContext);
  if (!context) {
    throw new Error("useYield must be used within a YieldProvider");
  }

  return context;
}
