"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/lib/useWallet";
import { fetchLeaderboard } from "@/lib/graphql";

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function LeaderboardPage() {
  const { address } = useWallet();
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => fetchLeaderboard(50),
    refetchInterval: 60_000,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-sans text-xl font-bold">Streak leaderboard</h1>
        <p className="mt-1 text-sm text-bp-fg/60">
          Sorted by BasePaint's own raw streak — consecutive painting days, no shields applied.
          BasePaint has{" "}
          <a
            href="https://basepaint.xyz/leaderboard"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-bp-accent"
          >
            its own leaderboard
          </a>{" "}
          too; this one lists every wallet, including those without a registered ENS or CB.id.
        </p>
      </div>

      {isLoading && <p className="text-sm text-bp-fg/50">Loading…</p>}

      {!isLoading && (data?.length ?? 0) === 0 && (
        <p className="text-sm text-bp-fg/50">No streak data yet.</p>
      )}

      {!isLoading && (data?.length ?? 0) > 0 && (
        <ol className="rounded-lg divide-y divide-bp-fg/10 border-2 border-bp-fg/15 bg-white/[0.02]">
          {data!.map((entry, i) => {
            const isYou = address && entry.id.toLowerCase() === address.toLowerCase();
            return (
              <li
                key={entry.id}
                className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                  isYou ? "bg-bp-accent/10" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 shrink-0 text-right font-mono text-bp-fg/40">{i + 1}</span>
                  <span className="font-mono">
                    {short(entry.id)}
                    {isYou && <span className="ml-2 text-bp-accent">you</span>}
                  </span>
                </div>
                <div className="flex items-center gap-4 font-mono text-xs text-bp-fg/60">
                  <span>
                    🔥 <span className="text-bp-fg">{entry.streak}</span>
                  </span>
                  <span className="hidden sm:inline">best {entry.longestStreak}</span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
