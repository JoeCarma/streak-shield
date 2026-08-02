"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useWallet } from "./useWallet";
import { useQuery } from "@tanstack/react-query";
import { fetchAccount, fetchContributionDays } from "./graphql";
import { currentDay } from "./basepaint";
import { computeRawStreak, computeStreakState } from "./streak";
import { getPurchases } from "./shieldStore";
import { PurchaseEvent } from "./types";

export function useStreakData() {
  const { address, isConnected } = useWallet();
  const [purchases, setPurchases] = useState<PurchaseEvent[]>([]);

  const refreshPurchases = useCallback(() => {
    if (address) setPurchases(getPurchases(address));
  }, [address]);

  useEffect(() => {
    refreshPurchases();
  }, [refreshPurchases]);

  const accountQuery = useQuery({
    queryKey: ["account", address],
    queryFn: () => fetchAccount(address as string),
    enabled: Boolean(address),
    refetchInterval: 60_000,
  });

  const contributionsQuery = useQuery({
    queryKey: ["contributions", address],
    queryFn: () => fetchContributionDays(address as string),
    enabled: Boolean(address),
    refetchInterval: 60_000,
  });

  const paintedDays = useMemo(() => {
    const set = new Set<number>();
    for (const c of contributionsQuery.data ?? []) set.add(c.canvasId);
    return set;
  }, [contributionsQuery.data]);

  const today = useMemo(() => currentDay(), []);

  const streakState = useMemo(
    () => computeStreakState({ paintedDays, today, purchases }),
    [paintedDays, today, purchases]
  );

  const rawStreak = useMemo(() => computeRawStreak({ paintedDays, today }), [paintedDays, today]);

  return {
    address,
    isConnected,
    today,
    isLoading: accountQuery.isLoading || contributionsQuery.isLoading,
    account: accountQuery.data ?? null,
    paintedDays,
    purchases,
    refreshPurchases,
    streakState,
    rawStreak,
    refetchAll: () => {
      accountQuery.refetch();
      contributionsQuery.refetch();
    },
  };
}
