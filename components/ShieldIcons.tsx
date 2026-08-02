export function ShieldIcons({ held, max }: { held: number; max: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${held} of ${max} shields`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-2xl ${i < held ? "" : "grayscale opacity-25"}`}>
          🛡️
        </span>
      ))}
      <span className="ml-1 font-mono text-sm text-bp-fg/70">
        {held}/{max}
      </span>
    </div>
  );
}
