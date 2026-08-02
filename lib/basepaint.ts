// Core BasePaint constants, day math, and mint-contract bindings.
// Source of truth: https://github.com/BasePaint/basepaint-contracts

/** Unix timestamp (seconds) when BasePaint day 1 started. */
export const BASEPAINT_STARTED_AT = 1691599315;

/** Length of one BasePaint day/epoch, in seconds. */
export const EPOCH_DURATION = 86400;

/** The BasePaint core contract: tracks artwork, contributions, and mints. */
export const BASEPAINT_ADDRESS = "0xBa5e05cb26b78eDa3A2f8e3b3814726305dcAc83" as const;

/**
 * BasePaint's own day math — deliberately not calendar/timezone based.
 * currentDay = floor((now - startedAt) / epochDuration) + 1
 */
export function currentDay(nowSeconds: number = Date.now() / 1000): number {
  return Math.floor((nowSeconds - BASEPAINT_STARTED_AT) / EPOCH_DURATION) + 1;
}

/** Seconds remaining until the current day's canvas flips (painting -> sale, or sale -> next canvas). */
export function secondsUntilNextFlip(nowSeconds: number = Date.now() / 1000): number {
  const day = currentDay(nowSeconds);
  const dayStart = BASEPAINT_STARTED_AT + (day - 1) * EPOCH_DURATION;
  const dayEnd = dayStart + EPOCH_DURATION;
  return Math.max(0, Math.round(dayEnd - nowSeconds));
}

/**
 * The day currently in its 24h sale/mint window is the day that most recently
 * finished painting, i.e. currentDay - 1. That's the canvas "Buy Protection"
 * mints against (see mint()'s `day + 1 == today()` requirement on-chain).
 */
export function mintableDay(nowSeconds: number = Date.now() / 1000): number {
  return currentDay(nowSeconds) - 1;
}

/** Minimal ABI surface Streak Shield needs from the BasePaint contract. */
export const BASEPAINT_ABI = [
  {
    type: "function",
    name: "mint",
    stateMutability: "payable",
    inputs: [
      { name: "day", type: "uint256" },
      { name: "count", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "openEditionPrice",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "today",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "contribution",
    stateMutability: "view",
    inputs: [
      { name: "day", type: "uint256" },
      { name: "author", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export function basepaintArtUrl(day: number): string {
  return `https://basepaint.net/v3/${String(day).padStart(4, "0")}.png`;
}
