export function LowShieldBanner({
  shieldsHeld,
  paintedToday,
}: {
  shieldsHeld: number;
  paintedToday: boolean;
}) {
  if (paintedToday || shieldsHeld > 1) return null;

  const isZero = shieldsHeld === 0;

  return (
    <div
      className={`rounded-lg mb-6 border-2 px-4 py-3 text-sm ${
        isZero ? "border-red-400/70 bg-red-950/40 text-red-200" : "border-bp-accent/70 bg-bp-accent/10 text-bp-accent"
      }`}
      role="status"
    >
      {isZero
        ? "🛡️ No shields left — paint today to keep your streak."
        : "🛡️ You're down to your last shield — paint today or buy protection."}
    </div>
  );
}
