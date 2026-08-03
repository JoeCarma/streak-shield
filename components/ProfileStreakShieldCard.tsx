"use client";

import Link from "next/link";
import { useStreakData } from "@/lib/useStreakData";
import { BuyProtectionButton } from "./BuyProtectionButton";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { ShieldIcons } from "./ShieldIcons";

/**
 * Demo fallback shown when no wallet is connected, so the profile mockup still
 * looks complete for screenshots / the pitch video without forcing a connect
 * step. Chosen to be internally consistent with the rules in lib/shieldRules.ts
 * (2 shields held, cap of 2) rather than arbitrary numbers.
 */
const DEMO_STATE = {
  streak: 24,
  rawStreak: 21,
  shieldsHeld: 2,
  maxShields: 2,
  paintedToday: true,
  /** Missed days a shield absorbed — the 3-day gap between 24 and 21. */
  shieldSaves: 3,
};

/**
 * The Streak Shield feature, reimagined as a native section of a BasePaint
 * profile page (as opposed to living in its own separate dashboard app). Sits
 * right below the stats grid, next to "Longest Streak", with its own heading
 * and CTA — mirroring how "Favorite Canvases" and "Activity" are laid out
 * elsewhere on the same page.
 *
 * When a wallet is connected this reuses the exact same engine as the real
 * dashboard (lib/streak.ts via useStreakData) — it is not a separate mock of
 * the logic, just a different visual shell around it. When disconnected it
 * falls back to a clearly-labeled demo state.
 */
export function ProfileStreakShieldCard() {
  const {
    isConnected,
    isLoading,
    streakState,
    rawStreak,
    purchases,
    refreshPurchases,
    refetchAll,
    today,
    paintedDayCount,
    recentPaintedDays,
  } = useStreakData();

  const showDemo = !isConnected;

  const streak = showDemo ? DEMO_STATE.streak : streakState.streak;
  const raw = showDemo ? DEMO_STATE.rawStreak : rawStreak.streak;
  const shieldsHeld = showDemo ? DEMO_STATE.shieldsHeld : streakState.shieldsHeld;
  const maxShields = showDemo ? DEMO_STATE.maxShields : streakState.maxShields;
  const paintedToday = showDemo ? DEMO_STATE.paintedToday : streakState.paintedToday;
  /** Days of streak preserved — not the same as the number of days a shield absorbed. */
  const saved = streak - raw;
  const shieldSaves = showDemo ? DEMO_STATE.shieldSaves : streakState.totalShieldSaves;

  return (
    <div className="rounded-lg border-2 border-bp-accent/30 bg-bp-card p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-bp-fg/70">
          Streak Shield
        </h2>
        <Link href="/" className="text-xs text-bp-fg/50 underline hover:text-bp-accent">
          Open dashboard →
        </Link>
      </div>

      {showDemo && (
        <p className="mb-4 rounded border border-bp-accent/30 bg-bp-accent/5 px-3 py-2 text-[11px] text-bp-accent/80">
          Preview data — connect your wallet to see your real streak &amp; shields here.
        </p>
      )}

      {isConnected && isLoading ? (
        <p className="text-sm text-bp-fg/50">Loading your streak…</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <span className="font-sans text-3xl font-extrabold tabular-nums text-bp-fg">
                {streak}
              </span>
              <span className="text-xs uppercase tracking-widest text-bp-fg/50">day streak</span>
            </div>
            <ShieldIcons held={shieldsHeld} max={maxShields} />
          </div>

          <p className="mt-3 text-xs text-bp-fg/50">
            {paintedToday ? "Painted today ✓" : "Not painted today yet"}
          </p>

          {saved > 0 && (
            /*
              Two different quantities, deliberately kept distinct: how many
              missed days a shield actually absorbed, and how much streak that
              preserved. Collapsing them into one "saved N days" reads as a
              contradiction next to the shield history, which counts the former.
            */
            <p className="mt-3 border-t border-bp-fg/10 pt-3 text-xs text-bp-fg/60">
              Without Streak Shield this would read{" "}
              <span className="font-bold text-bp-fg">{raw}</span> — covering{" "}
              <span className="font-bold text-bp-fg">{shieldSaves}</span> missed{" "}
              {shieldSaves === 1 ? "day" : "days"} kept{" "}
              <span className="font-bold text-bp-accent">{saved}</span> days of streak alive.
            </p>
          )}

          {/*
            The inputs behind the headline number, shown next to it rather than
            on another page: day, how much history loaded, and the most recent
            painted days. A streak that looks wrong is almost always one of
            those three being wrong, and this makes that visible immediately.
          */}
          {isConnected && (
            <p className="mt-3 border-t border-bp-fg/10 pt-3 font-mono text-[11px] text-bp-fg/30">
              day {today} · {paintedDayCount} days of history loaded
              {recentPaintedDays.length > 0 && <> · recent: {recentPaintedDays.join(", ")}</>}
            </p>
          )}

          <div className="mt-4">
            {isConnected ? (
              <BuyProtectionButton
                shieldsHeld={streakState.shieldsHeld}
                purchases={purchases}
                onPurchased={() => {
                  refreshPurchases();
                  refetchAll();
                }}
              />
            ) : (
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-bp-fg/50">Connect your wallet to buy protection.</p>
                <ConnectWalletButton />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
