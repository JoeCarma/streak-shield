import { MAX_SHIELDS, MILESTONE_INTERVAL_DAYS, PURCHASE_WINDOW_DAYS } from "./shieldRules";
import { DayEvent, PurchaseEvent, StreakState } from "./types";

type SimulateOptions = {
  /** Set of BasePaint day numbers this wallet has a Contribution on. */
  paintedDays: Set<number>;
  /** The live, current BasePaint day (today() on-chain). */
  today: number;
  /** Purchase events from the local shield ledger (or, on-chain, from the stretch-goal contract). */
  purchases: PurchaseEvent[];
  /** When false, shields never activate — used to compute the "raw" BasePaint streak for comparison. */
  shieldsEnabled?: boolean;
};

/**
 * Deterministic forward simulation of Streak Shield's rules (spec section 3):
 * - max 2 shields held at once
 * - 1 purchase per rolling 30-day window
 * - +1 free shield at every 30-day streak milestone, up to the cap
 * - a missed day auto-consumes the oldest available shield, else the streak resets
 *
 * Walking forward (not backward) is what makes this correct: shield state is
 * path-dependent (you can't know how many shields were available on day 400
 * without knowing the full history of misses/earns/purchases before it), so
 * we replay the whole history in order rather than trying to infer it from
 * the tail alone.
 */
export function simulateStreak({
  paintedDays,
  today,
  purchases,
  shieldsEnabled = true,
}: SimulateOptions): StreakState {
  const timeline: DayEvent[] = [];

  if (paintedDays.size === 0) {
    return {
      streak: 0,
      shieldsHeld: 0,
      maxShields: MAX_SHIELDS,
      paintedToday: false,
      timeline,
      totalShieldSaves: 0,
    };
  }

  const firstDay = Math.min(...paintedDays);
  const paintedToday = paintedDays.has(today);
  // Don't judge "today" until its 24h window is over, unless the wallet already painted.
  const lastDayToWalk = paintedToday ? today : today - 1;

  const purchasesByDay = new Map<number, PurchaseEvent[]>();
  for (const p of purchases) {
    const list = purchasesByDay.get(p.day) ?? [];
    list.push(p);
    purchasesByDay.set(p.day, list);
  }

  let consecutive = 0;
  let shieldsHeld = 0;
  let totalShieldSaves = 0;
  let lastPurchaseTimestamp: number | null = null;

  for (let day = firstDay; day <= lastDayToWalk; day++) {
    // 1) Apply any purchase credited to this day (subject to cap + rolling window, enforced
    //    again here even though the UI also enforces it before letting a purchase happen).
    if (shieldsEnabled) {
      for (const purchase of purchasesByDay.get(day) ?? []) {
        const withinWindow =
          lastPurchaseTimestamp === null ||
          purchase.timestamp - lastPurchaseTimestamp >= PURCHASE_WINDOW_DAYS * 86400 * 1000;
        if (shieldsHeld < MAX_SHIELDS && withinWindow) {
          shieldsHeld += 1;
          lastPurchaseTimestamp = purchase.timestamp;
          timeline.push({ day, kind: "shield-purchased" });
        }
      }
    }

    // 2) Did the wallet paint this day?
    if (paintedDays.has(day)) {
      consecutive += 1;
      timeline.push({ day, kind: "painted" });
    } else if (shieldsEnabled && shieldsHeld > 0) {
      shieldsHeld -= 1;
      consecutive += 1;
      totalShieldSaves += 1;
      timeline.push({ day, kind: "shield-consumed" });
    } else {
      if (consecutive > 0) timeline.push({ day, kind: "streak-broken" });
      consecutive = 0;
    }

    // 3) Milestone: every 30 consecutive days earns a free shield, up to the cap.
    if (shieldsEnabled && consecutive > 0 && consecutive % MILESTONE_INTERVAL_DAYS === 0) {
      if (shieldsHeld < MAX_SHIELDS) {
        shieldsHeld += 1;
        timeline.push({ day, kind: "shield-earned" });
      }
    }
  }

  return {
    streak: consecutive,
    shieldsHeld,
    maxShields: MAX_SHIELDS,
    paintedToday,
    timeline,
    totalShieldSaves,
  };
}

/** Convenience: the streak Streak Shield reports, with shields active. */
export function computeStreakState(opts: Omit<SimulateOptions, "shieldsEnabled">): StreakState {
  return simulateStreak({ ...opts, shieldsEnabled: true });
}

/** The streak BasePaint itself would show — no shields, breaks on the first missed day. */
export function computeRawStreak(opts: Omit<SimulateOptions, "shieldsEnabled" | "purchases">): StreakState {
  return simulateStreak({ ...opts, purchases: [], shieldsEnabled: false });
}

/** True once the wallet can legally buy another shield (cap + rolling-window rules). */
export function canPurchaseShield(
  shieldsHeld: number,
  purchases: PurchaseEvent[],
  nowMs: number = Date.now()
): { allowed: boolean; reason?: string; nextEligibleAt?: number } {
  if (shieldsHeld >= MAX_SHIELDS) {
    return { allowed: false, reason: "Already at the 2-shield cap." };
  }
  const lastPurchase = [...purchases].sort((a, b) => b.timestamp - a.timestamp)[0];
  if (lastPurchase) {
    const nextEligibleAt = lastPurchase.timestamp + PURCHASE_WINDOW_DAYS * 86400 * 1000;
    if (nowMs < nextEligibleAt) {
      return {
        allowed: false,
        reason: "Only 1 purchase per rolling 30-day window.",
        nextEligibleAt,
      };
    }
  }
  return { allowed: true };
}
