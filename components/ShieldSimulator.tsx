import { StreakState } from "@/lib/types";

const LABELS: Record<string, { label: string; icon: string; tone: string }> = {
  "shield-consumed": { label: "Shield auto-consumed — day missed but streak held", icon: "🛡️", tone: "text-bp-accent" },
  "shield-earned": { label: "Free shield earned — 30-day milestone", icon: "✨", tone: "text-emerald-300" },
  "shield-purchased": { label: "Shield purchased", icon: "💠", tone: "text-sky-300" },
  "streak-broken": { label: "Streak broken — no shield available", icon: "💥", tone: "text-red-300" },
};

/**
 * Demonstrates the auto-consumption simulation against this wallet's real
 * history: "if you'd had a shield, your streak would be X instead of 0."
 * Only shows the notable events (paints are omitted — there can be hundreds).
 */
export function ShieldSimulator({ streakState }: { streakState: StreakState }) {
  const notable = streakState.timeline.filter((e) => e.kind !== "painted").slice(-12).reverse();

  return (
    <div className="pixel-corners border-2 border-bp-fg/15 bg-white/[0.02] p-6">
      <h2 className="mb-1 font-sans text-sm font-bold uppercase tracking-widest text-bp-fg/70">
        Shield history
      </h2>
      <p className="mb-4 text-xs text-bp-fg/50">
        Simulated by replaying your BasePaint contribution history day-by-day against the shield
        rules — this is what would have happened, not a separate stored log.
      </p>

      {notable.length === 0 ? (
        <p className="text-sm text-bp-fg/40">No shield events yet — keep painting.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {notable.map((e, i) => {
            const meta = LABELS[e.kind];
            if (!meta) return null;
            return (
              <li key={`${e.day}-${e.kind}-${i}`} className="flex items-center gap-3">
                <span className="w-14 shrink-0 font-mono text-xs text-bp-fg/40">day {e.day}</span>
                <span>{meta.icon}</span>
                <span className={meta.tone}>{meta.label}</span>
              </li>
            );
          })}
        </ul>
      )}

      {streakState.totalShieldSaves > 0 && (
        <p className="mt-4 border-t border-bp-fg/10 pt-3 text-xs text-bp-fg/60">
          Across your whole history, shields have preserved your streak through{" "}
          <span className="font-bold text-bp-accent">{streakState.totalShieldSaves}</span> missed{" "}
          {streakState.totalShieldSaves === 1 ? "day" : "days"}.
        </p>
      )}
    </div>
  );
}
