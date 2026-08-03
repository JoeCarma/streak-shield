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
    streakState,
    rawStreak,
    purchases,
    refreshPurchases,
    refetchAll,
    today,
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

      <p className="text-center text-[11px] text-bp-fg/30">BasePaint day {today}</p>
    </div>
  );
}
