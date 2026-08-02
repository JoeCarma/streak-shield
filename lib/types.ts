export type PurchaseEvent = {
  /** BasePaint day this purchase was credited against (the day that was minted). */
  day: number;
  /** Wall-clock time of the purchase, ms since epoch. Used for the 30-day purchase-window rule. */
  timestamp: number;
  txHash: string;
};

export type DayEvent = {
  day: number;
  kind: "painted" | "shield-consumed" | "streak-broken" | "shield-earned" | "shield-purchased";
};

export type StreakState = {
  /** Effective Streak Shield streak: consecutive days, with missed days covered by a shield. */
  streak: number;
  shieldsHeld: number;
  maxShields: number;
  /** True if the wallet painted on the current (still-open) BasePaint day. */
  paintedToday: boolean;
  /** Notable events from the simulation, oldest first — used for the history/demo view. */
  timeline: DayEvent[];
  /** How many days were saved by a shield across the whole simulated history. */
  totalShieldSaves: number;
};
