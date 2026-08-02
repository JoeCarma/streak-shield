export function StreakFlame({ streak, size = 64 }: { streak: number; size?: number }) {
  const lit = streak > 0;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        shapeRendering="crispEdges"
        className={lit ? "drop-shadow-[0_0_10px_rgba(253,224,71,0.5)]" : "opacity-30"}
      >
        {/* tiny pixel-art flame, blocky on purpose to match BasePaint's aesthetic */}
        <rect x="7" y="1" width="2" height="2" fill={lit ? "#fde047" : "#4b5563"} />
        <rect x="6" y="3" width="4" height="2" fill={lit ? "#fbbf24" : "#4b5563"} />
        <rect x="5" y="5" width="6" height="2" fill={lit ? "#f97316" : "#374151"} />
        <rect x="4" y="7" width="8" height="3" fill={lit ? "#ea580c" : "#374151"} />
        <rect x="5" y="10" width="6" height="2" fill={lit ? "#c2410c" : "#374151"} />
        <rect x="6" y="12" width="4" height="2" fill={lit ? "#9a3412" : "#1f2937"} />
      </svg>
      <div className="font-sans text-3xl font-extrabold tabular-nums text-bp-fg">{streak}</div>
      <div className="text-[10px] uppercase tracking-widest text-bp-fg/50">day streak</div>
    </div>
  );
}
