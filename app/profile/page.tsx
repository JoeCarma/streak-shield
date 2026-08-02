import type { Metadata } from "next";
import Link from "next/link";
import { ProfileStreakShieldCard } from "@/components/ProfileStreakShieldCard";
import { XIcon, FarcasterIcon, GlobeIcon } from "@/components/SocialIcons";
import { basepaintArtUrl } from "@/lib/basepaint";

export const metadata: Metadata = {
  title: "joec.base.eth — Streak Shield profile concept",
  description:
    "Mockup of what Streak Shield would look like built natively into a BasePaint profile page, instead of living in a separate app.",
};

const STATS: [string, string, boolean][] = [
  ["106.723", "Pixels Painted", false],
  ["276", "Canvases Painted", false],
  ["11", "Canvases Collected", false],
  ["130", "Longest Streak", true],
  ["106", "Days Voted", false],
  ["38", "Themes Proposed", false],
];

const COLLECTION: [string, number][] = [
  ["Brushes", 1],
  ["Artworks", 11],
  ["Works In Progress", 2],
  ["Future Art", 0],
  ["Animations", 0],
];

const NAV_TABS = ["PAINT", "MINT", "VIEW", "VOTE", "HACK", "···"];

/**
 * Real CC0 BasePaint canvases used instead of placeholder gradients — all
 * BasePaint artwork is public domain, so these can be used freely. See
 * lib/basepaint.ts#basepaintArtUrl.
 */
const AVATAR_CANVAS_DAY = 1042;
const FEATURED_CANVAS_DAY = 1077;

/**
 * V2 concept: instead of Streak Shield living in its own dashboard app, this
 * recreates a real BasePaint profile page (basepaint.xyz/@joec.base.eth) with
 * Streak Shield designed as a native section — right below the stats grid, next
 * to "Longest Streak" — the way it'd ship if BasePaint adopted it directly.
 *
 * Chrome/colors follow the official brand palette (https://basepaint.xyz/brand):
 * BasePaint Blue #0042E0 for the header, near-black surface, yellow accent.
 * Everything except the Streak Shield card is a static recreation for the pitch;
 * the Streak Shield card is wired to the real engine (lib/streak.ts).
 */
export default function ProfileConceptPage() {
  return (
    <div className="min-h-screen bg-bp-surface font-mono text-bp-fg">
      {/* Top nav — mimics basepaint.xyz's own header, not Streak Shield's */}
      <div className="border-b-2 border-black/40 bg-bp-blue">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            {/*
              Official BasePaint mark, served from BasePaint's own brand page.
              To make the repo fully self-contained, download it to
              public/basepaint-logo-white.svg and swap this src for
              "/basepaint-logo-white.svg" — the brand guidelines ask that the
              mark not be recolored or recreated in another typeface, so it's
              used as-is rather than redrawn.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://basepaint.xyz/brand/basepaint-logo-white.svg"
              alt="BasePaint"
              className="h-7 w-auto pr-2"
            />
            <nav className="flex flex-wrap items-center gap-1.5 text-xs font-bold sm:text-sm">
              {NAV_TABS.map((label) => (
                <span
                  key={label}
                  className="rounded border-2 border-black/25 bg-white/15 px-3 py-1.5"
                >
                  {label}
                </span>
              ))}
            </nav>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <span className="rounded border-2 border-black/25 bg-black/25 px-2.5 py-1.5">
              💧 0013
            </span>
            <span className="rounded border-2 border-black/25 bg-black/25 px-2.5 py-1.5">
              🔥 01
            </span>
            <span className="rounded border-2 border-black/25 bg-black/25 px-2.5 py-1.5">
              💎 000000
            </span>
            <span className="rounded border-2 border-black/25 bg-bp-accent px-2.5 py-1.5 text-bp-ink">
              joec.base.eth
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="pixel-corners border-2 border-bp-fg/15 bg-bp-card p-5">
            <div className="mb-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={basepaintArtUrl(AVATAR_CANVAS_DAY)}
                alt={`BasePaint canvas #${AVATAR_CANVAS_DAY}`}
                className="h-14 w-14 shrink-0 rounded object-cover [image-rendering:pixelated]"
              />
              <div>
                <p className="font-sans text-lg font-bold">joec.base.eth</p>
                <p className="text-xs text-bp-fg/50">0x1F3f...D4bf</p>
              </div>
            </div>

            <p className="mb-1 text-xs uppercase tracking-widest text-bp-fg/50">Current balance</p>
            <p className="font-sans text-lg font-bold">
              0,02639 ETH <span className="text-bp-fg/40">+</span>
            </p>
            <p className="text-sm text-bp-fg/70 underline decoration-dotted">0,00001 WETH</p>
            <p className="mb-4 text-xs text-bp-fg/40">≈ 48,97 US$ USD</p>

            <div className="space-y-2">
              <button className="w-full rounded border-2 border-bp-fg/20 py-2 text-sm font-bold hover:border-bp-accent hover:text-bp-accent">
                Buy ETH
              </button>
              <button className="w-full rounded border-2 border-bp-fg/20 py-2 text-sm font-bold hover:border-bp-accent hover:text-bp-accent">
                Sign out
              </button>
            </div>
          </div>

          <div className="pixel-corners border-2 border-bp-fg/15 bg-bp-card p-2">
            <p className="rounded bg-white/5 px-3 py-2 text-sm font-bold">Overview</p>
            <p className="mt-3 px-3 text-xs uppercase tracking-widest text-bp-fg/40">Collection</p>
            <ul className="mt-1 text-sm">
              {COLLECTION.map(([label, count]) => (
                <li
                  key={label}
                  className="flex items-center justify-between px-3 py-2 text-bp-fg/80"
                >
                  <span>{label}</span>
                  <span className="text-bp-fg/40">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main column */}
        <div className="space-y-6">
          {/* About */}
          <div className="pixel-corners flex items-start justify-between gap-6 border-2 border-bp-fg/15 bg-bp-card p-6">
            <div>
              <h1 className="mb-3 font-sans text-lg font-bold">About</h1>
              <p className="max-w-xl text-sm leading-relaxed text-bp-fg/80">
                Animator. Designer. Pixel art as therapy. 15 years of craft, one Emmy, one Japan
                residency, zero chill. On-chain since it made sense.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-bp-fg/50">
                <XIcon />
                <FarcasterIcon />
                <GlobeIcon />
                <span>Joined Aug 27, 2025</span>
                <span>·</span>
                <span>
                  From <span className="text-bp-accent">AR</span> Argentina
                </span>
                <span>·</span>
                <span className="underline">Edit</span>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={basepaintArtUrl(FEATURED_CANVAS_DAY)}
              alt={`BasePaint canvas #${FEATURED_CANVAS_DAY}`}
              className="hidden h-28 w-28 shrink-0 rounded object-cover [image-rendering:pixelated] sm:block"
            />
          </div>

          {/* Stats grid */}
          <div className="pixel-corners grid grid-cols-2 divide-x-2 divide-y-2 divide-bp-fg/10 border-2 border-bp-fg/15 bg-bp-card sm:grid-cols-3 sm:divide-y-0">
            {STATS.map(([value, label, highlight]) => (
              <div key={label} className={`p-6 ${highlight ? "bg-bp-accent/[0.04]" : ""}`}>
                <p className="font-sans text-3xl font-bold tabular-nums">{value}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-bp-fg/50">{label}</p>
              </div>
            ))}
          </div>

          {/* NEW — Streak Shield, native to the profile, directly under Longest Streak */}
          <ProfileStreakShieldCard />

          {/* Favorite canvases */}
          <div className="pixel-corners border-2 border-bp-fg/15 bg-bp-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-bp-fg/70">
                Favorite Canvases
              </h2>
              <span className="text-xs text-bp-fg/50 underline">Edit</span>
            </div>
            <p className="py-6 text-center text-sm text-bp-fg/40">
              Star canvases in Artworks to feature them here.
            </p>
          </div>

          {/* Activity */}
          <div className="pixel-corners border-2 border-bp-fg/15 bg-bp-card p-6">
            <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-bp-fg/70">
              Activity
            </h2>
          </div>
        </div>
      </div>

      <p className="mx-auto max-w-6xl px-4 pb-10 pt-2 text-center text-[11px] text-bp-fg/30">
        Concept mockup recreating basepaint.xyz/@joec.base.eth to pitch Streak Shield as a native
        profile feature — not an official BasePaint page. Canvas art is CC0.{" "}
        <Link href="/" className="underline hover:text-bp-accent">
          See the real Streak Shield dashboard →
        </Link>
      </p>
    </div>
  );
}
