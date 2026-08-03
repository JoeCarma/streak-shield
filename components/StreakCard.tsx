import { StreakState } from "@/lib/types";
import { StreakFlame } from "./StreakFlame";
import { ShieldIcons } from "./ShieldIcons";

export function StreakCard({
  streakState,
  rawStreak,
}: {
  streakState: StreakState;
  rawStreak: StreakState;
}) {
  const savedDays = streakState.streak - rawStreak.streak;

  return (
    <div className="rounded-lg border-2 border-bp-fg/15 bg-white/[0.02] p-6">
      <div className="flex items-center justify-between gap-6">
        <StreakFlame streak={streakState.streak} />
        <div className="flex flex-col items-end gap-2">
          <ShieldIcons held={streakState.shieldsHeld} max={streakState.maxShields} />
          <span className="text-xs text-bp-fg/50">
            {streakState.paintedToday ? "Painted today ✓" : "Not painted today yet"}
          </span>
        </div>
      </div>

      {savedDays > 0 && (
        <p className="mt-4 border-t border-bp-fg/10 pt-3 text-xs text-bp-fg/60">
          Without Streak Shield, BasePaint's own streak counter would read{" "}
          <span className="font-bold text-bp-fg">{rawStreak.streak}</span> right now — shields have
          saved you <span className="font-bold text-bp-accent">{savedDays}</span>{" "}
          {savedDays === 1 ? "day" : "days"} of streak.
        </p>
      )}
    </div>
  );
}
