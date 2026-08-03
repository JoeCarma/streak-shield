"use client";

import Link from "next/link";
import { useStreakData } from "@/lib/useStreakData";
import { StreakCard } from "@/components/StreakCard";
import { LowShieldBanner } from "@/components/LowShieldBanner";
import { BuyProtectionButton } from "@/components/BuyProtectionButton";
import { ShieldSimulator } from "@/components/ShieldSimulator";

export default function HomePage() {
  const {
    isConnected,
    isLoading,
    isError,
    error,
    streakState,
    rawStreak,
    purchases,
    refreshPurchases,
    refetchAll,
    today,
    paintedDayCount,
    recentPaintedDays,
  } = useStreakData();

  if (!isConnected) {
    return (
      <div className="rounded-lg flex flex-col items-center gap-3 border-2 border-bp-fg/15 bg-white/[0.02] px-6 py-16 text-center">
        <span className="text-4xl">🛡️</span>
        <h1 className="font-sans text-xl font-bold">Connect your wallet to see your streak</h1>
        <p className="max-w-sm text-sm text-bp-fg/60">
          Streak Shield reads your BasePaint painting history straight from the public indexer —
          nothing to sign, nothing to set up.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <p className="py-16 text-center text-sm text-bp-fg/50">Loading your streak…</p>;
  }

  /*
   * Never fall through to the simulation on a failed read — with no
   * contribution history it returns a 0-day streak, which looks like a real
   * (and alarming) answer rather than a missing one.
   */
  if (isError) {
    return (
      <div className="rounded-lg border-2 border-red-400/60 bg-red-950/30 p-6 text-sm">
        <p className="font-bold text-red-200">Couldn&apos;t reach BasePaint&apos;s indexer.</p>
        <p className="mt-2 text-red-200/70">
          Your streak can&apos;t be calculated without your painting history, so nothing is shown
          rather than a misleading zero.
        </p>
        {error?.message && (
          <p className="mt-2 font-mono text-xs text-red-200/50">{error.message}</p>
        )}
        <button
          onClick={() => refetchAll()}
          className="mt-4 rounded border-2 border-red-300/50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-200 hover:border-red-200 hover:text-red-100"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LowShieldBanner shieldsHeld={streakState.shieldsHeld} paintedToday={streakState.paintedToday} />

      <StreakCard streakState={streakState} rawStreak={rawStreak} />

      <div className="rounded-lg border-2 border-bp-fg/15 bg-white/[0.02] p-6">
        <h2 className="mb-3 font-sans text-sm font-bold uppercase tracking-widest text-bp-fg/70">
          Buy Protection
        </h2>
        <p className="mb-4 text-sm text-bp-fg/60">
          Mints today's on-sale canvas at its live price and credits a shield. It's real
          participation — you own a mint — it just doesn't count as painting today.
        </p>
        <BuyProtectionButton
          shieldsHeld={streakState.shieldsHeld}
          purchases={purchases}
          onPurchased={() => {
            refreshPurchases();
            refetchAll();
          }}
        />
      </div>

      <ShieldSimulator streakState={streakState} />

      <div className="text-center">
        <Link href="/leaderboard" className="text-sm text-bp-fg/60 underline hover:text-bp-accent">
          See the public leaderboard →
        </Link>
      </div>

      {/*
        Deliberately visible rather than hidden in a console log: the day number
        and the raw painted-day list are the two inputs that decide the streak,
        so when the headline number looks wrong this line says immediately
        whether the cause is bad data, the wrong day, or a correct-but-broken
        streak.
      */}
      <p className="text-center text-[11px] text-bp-fg/30">
        BasePaint day {today} · {paintedDayCount} days painted
        {recentPaintedDays.length > 0 && <> · most recent: {recentPaintedDays.join(", ")}</>}
      </p>
    </div>
  );
}
