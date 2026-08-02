import { PurchaseEvent } from "./types";

/**
 * MVP shield ledger: a per-wallet, localStorage-backed record of "Buy Protection"
 * purchases. This is intentionally the off-chain path described in the spec
 * (section 5) — a hackathon-scoped stand-in for either a small on-chain
 * contract or a signed off-chain record. It is NOT a source of truth for the
 * mint itself (that's a real on-chain transaction against BasePaint.mint);
 * it only remembers "this wallet bought a shield on day N" so the streak
 * simulation can credit it consistently across page loads on this device.
 *
 * Honest limitation: this ledger is local to the browser. A wallet used on a
 * different device/browser won't see prior purchases reflected until the
 * on-chain stretch-goal contract (contracts/StreakShield.sol) replaces this.
 */

function storageKey(address: string): string {
  return `streak-shield:purchases:${address.toLowerCase()}`;
}

export function getPurchases(address: string): PurchaseEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(address));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as PurchaseEvent[];
  } catch (err) {
    console.error("getPurchases failed to read localStorage", err);
    return [];
  }
}

export function addPurchase(address: string, event: PurchaseEvent): void {
  if (typeof window === "undefined") return;
  const existing = getPurchases(address);
  const updated = [...existing, event].sort((a, b) => a.day - b.day);
  window.localStorage.setItem(storageKey(address), JSON.stringify(updated));
}

export function clearPurchases(address: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey(address));
}
