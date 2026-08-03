"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useWallet } from "./useWallet";
import { useQuery } from "@tanstack/react-query";
import { fetchAccount, fetchContributionDays } from "./graphql";
import { BASEPAINT_ABI, BASEPAINT_ADDRESS, currentDay } from "./basepaint";
import { publicClient } from "./wagmi";
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

  /**
   * The handful of most recent days this wallet painted. Surfaced so a
   * surprising streak can be checked against the raw input rather than guessed
   * at — "0-day streak" means something very different when the last painted
   * days are [1090, 1089] than when the list is empty.
   */
  const recentPaintedDays = useMemo(
    () => [...paintedDays].sort((a, b) => b - a).slice(0, 8),
    [paintedDays]
  );

  /**
   * The current BasePaint day, read from the contract itself.
   *
   * The local `currentDay()` formula and the chain can disagree by a day around
   * the 16:41 UTC rollover, and the streak simulation is extremely sensitive to
   * which day it thinks "today" is: an off-by-one shifts the whole replay window
   * and can report a broken streak for someone who painted. The contract is the
   * authority BasePaint itself uses, so it's the authority here too.
   *
   * Shares a query key with BuyProtectionButton so the whole app agrees on the
   * day — previously the button read the chain while the streak used local math.
   * `currentDay()` remains the fallback for when the RPC is unreachable.
   */
  const onchainTodayQuery = useQuery({
    queryKey: ["basepaint-today"],
    queryFn: () =>
      publicClient.readContract({
        address: BASEPAINT_ADDRESS,
        abi: BASEPAINT_ABI,
        functionName: "today",
      }),
    refetchInterval: 60_000,
  });

  const today = useMemo(
    () => (onchainTodayQuery.data !== undefined ? Number(onchainTodayQuery.data) : currentDay()),
    [onchainTodayQuery.data]
  );

  const streakState = useMemo(
    () => computeStreakState({ paintedDays, today, purchases }),
    [paintedDays, today, purchases]
  );

  const rawStreak = useMemo(() => computeRawStreak({ paintedDays, today }), [paintedDays, today]);

  return {
    address,
    isConnected,
    today,
    /*
     * Waits on the day query too. Without it the first render simulates against
     * the local day estimate and then re-renders once the chain answers — a
     * visible flicker between two different streak numbers.
     */
    isLoading:
      accountQuery.isLoading || contributionsQuery.isLoading || onchainTodayQuery.isLoading,
    /**
     * True when the indexer couldn't be read. Callers must show this rather
     * than rendering the simulation's output, which would otherwise report a
     * confident 0-day streak built on no data at all.
     */
    isError: accountQuery.isError || contributionsQuery.isError,
    error: (contributionsQuery.error ?? accountQuery.error) as Error | null,
    paintedDayCount: paintedDays.size,
    recentPaintedDays,
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
