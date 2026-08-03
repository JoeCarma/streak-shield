import type { Metadata } from "next";
import Link from "next/link";
import { ProfileStreakShieldCard } from "@/components/ProfileStreakShieldCard";
import { XIcon, FarcasterIcon, InstagramIcon } from "@/components/SocialIcons";
import { basepaintArtUrl } from "@/lib/basepaint";

export const metadata: Metadata = {
  title: "joec.base.eth — Streak Shield profile concept",
  description:
    "Mockup of what Streak Shield would look like built natively into a BasePaint profile page, instead of living in a separate app.",
};

const STATS: [string, string][] = [
  ["107.058", "Pixels Painted"],
  ["277", "Canvases Painted"],
  ["12", "Canvases Collected"],
  ["130", "Longest Streak"],
  ["107", "Days Voted"],
  ["38", "Themes Proposed"],
];

const COLLECTION: [string, number][] = [
  ["Brushes", 1],
  ["Artworks", 12],
  ["Works In Progress", 2],
  ["Future Art", 0],
  ["Animations", 0],
  ["Masterpieces", 2],
  ["Cursors", 0],
];

const CONTRIBUTIONS: [string, number][] = [
  ["Pixels", 277],
  ["Earnings", 0],
  ["Themes", 38],
];

const NAV_TABS = ["PAINT", "MINT", "VIEW", "VOTE", "HACK", "···"];

/** Starred canvases, matching the real profile. Art is CC0. */
const FAVORITE_CANVASES: { day: number; title: string }[] = [
  { day: 851, title: "The Monster Skewers" },
  { day: 952, title: "Japanese Gachapon" },
  { day: 805, title: "Japan Megamania" },
  { day: 187, title: "Manga" },
  { day: 980, title: "The ape, the bull and the ugly." },
];

type ActivityEntry =
  | { kind: "painted"; pixels: number; day: number; when: string }
  | { kind: "voted"; day: number; when: string }
  | { kind: "earned"; eth: string; day: number; when: string };

/** Recent activity, mirroring the real profile's feed. */
const ACTIVITY: ActivityEntry[] = [
  { kind: "painted", pixels: 140, day: 1089, when: "15 hours ago" },
  { kind: "painted", pixels: 243, day: 1089, when: "15 hours ago" },
  { kind: "painted", pixels: 91, day: 1089, when: "22 hours ago" },
  { kind: "painted", pixels: 282, day: 1089, when: "22 hours ago" },
  { kind: "painted", pixels: 73, day: 1089, when: "yesterday" },
  { kind: "painted", pixels: 29, day: 1089, when: "yesterday" },
  { kind: "painted", pixels: 29, day: 1089, when: "yesterday" },
  { kind: "voted", day: 1090, when: "yesterday" },
  { kind: "earned", eth: "0.00106", day: 1086, when: "yesterday" },
  { kind: "earned", eth: "0.00097", day: 1087, when: "yesterday" },
];

const HANDLE = "joec.base.eth";

/*
 * The avatar (public/avatar.png) and the brush NFT shown beside the About text
 * (public/brush.png) are the account's real assets. Favourite-canvas thumbnails
 * come straight from BasePaint's CC0 art endpoint — see
 * lib/basepaint.ts#basepaintArtUrl.
 */

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
      {/*
        Top nav — a recreation of basepaint.xyz's own header (not Streak
        Shield's). Structurally it's two black-outlined clusters floating on the
        BasePaint Blue bar: the logo + section tabs on the left, and the
        counters + wallet chip on the right. The chunky black outlines and the
        darker-blue-on-lighter-blue label treatment are what give it its look,
        so they're matched rather than approximated with generic borders.
      */}
      <div className="bg-[#073EB1] bg-[radial-gradient(130%_200%_at_22%_0%,#1450D8_0%,#0A42BC_40%,#062F8C_100%)]">
        {/* The nav bar runs edge-to-edge on the live site — only the page
            content below it is width-constrained. */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          {/*
            Left cluster: logo tile + section tabs. The buttons carry no border
            of their own — the black shell showing through the gaps is what
            draws the outlines, which is how the live site does it. Button
            styling below mirrors basepaint.xyz's own markup: bg #014BE5,
            white uppercase Viga at text-sm, rounded-md, py-2 px-4.
          */}
          <div className="flex items-center gap-[5px] rounded-lg bg-black p-[5px]">
            {/*
              White BasePaint mark on the same blue as the tabs, used as-is per
              the brand guidelines (no recoloring, no redrawing). Served from
              public/ so the repo stays self-contained.
            */}
            <span className="flex items-center rounded-md bg-[#014BE5] px-5 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/basepaint-logo-white.svg"
                alt="BasePaint"
                className="h-[22px] w-auto"
              />
            </span>

            <nav className="flex items-center gap-[5px] font-viga text-sm uppercase">
              {NAV_TABS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="flex items-center justify-center rounded-md bg-[#014BE5] px-4 py-2 text-center text-[#0B3BB0] transition-colors hover:text-white active:pb-1.5 active:pt-2.5"
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right cluster: counters + wallet, one black pill */}
          <div className="flex items-center gap-4 rounded-lg bg-black px-4 py-3 text-sm font-bold text-bp-accent">
            <span className="whitespace-nowrap">💧 0013</span>
            <span className="whitespace-nowrap">🔥 01</span>
            <span className="whitespace-nowrap">💎 000000</span>
            <span className="flex items-center gap-2 whitespace-nowrap">
              <span className="inline-block h-3 w-4 rounded-[2px] bg-bp-accent" />
              joec.base.eth
            </span>
          </div>
        </div>
      </div>

      {/*
        Content is width-capped and centred, unlike the nav. Measured against
        the live profile: the content column sits at roughly 80% of a wide
        viewport with generous side margins — that breathing room is a big part
        of why the real page doesn't feel cramped.
      */}
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[270px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-lg border-2 border-bp-fg/15 bg-bp-card p-5">
            <div className="mb-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/avatar.png"
                alt="joec.base.eth"
                className="h-14 w-14 shrink-0 rounded-lg [image-rendering:pixelated]"
              />
              <div>
                <p className="font-sans text-lg font-bold">joec.base.eth</p>
                <p className="text-xs text-bp-fg/50">0x1F3f...D4bf</p>
              </div>
            </div>

            <p className="mb-2 text-sm text-bp-fg/50">Current balance</p>
            <p className="font-sans text-lg font-bold">
              0,02379 ETH <span className="text-bp-fg/40">+</span>
            </p>
            <p className="font-sans text-lg font-bold underline decoration-bp-fg/40 decoration-dotted underline-offset-4">
              0,00001 WETH
            </p>
            <p className="mb-4 mt-1 text-xs text-indigo-300/70">≈ 44,31 US$ USD</p>

            <div className="space-y-2">
              <button className="w-full rounded border-2 border-bp-fg/20 py-2 text-sm font-bold hover:border-bp-accent hover:text-bp-accent">
                Buy ETH
              </button>
              <button className="w-full rounded border-2 border-bp-fg/20 py-2 text-sm font-bold hover:border-bp-accent hover:text-bp-accent">
                Sign out
              </button>
            </div>
          </div>

          <div className="rounded-lg border-2 border-bp-fg/15 bg-bp-card p-2">
            <p className="rounded bg-white/5 px-3 py-2 text-sm font-bold">Overview</p>

            <p className="mt-3 px-3 text-xs uppercase tracking-widest text-bp-fg/40">Collection</p>
            <ul className="mt-1 text-sm">
              {COLLECTION.map(([label, count]) => (
                <li
                  key={label}
                  className="flex cursor-pointer items-center justify-between rounded px-3 py-2 text-bp-fg/80 hover:bg-white/5 hover:text-bp-fg"
                >
                  <span>{label}</span>
                  <span className="text-bp-fg/40">{count}</span>
                </li>
              ))}
            </ul>

            <p className="mt-3 px-3 text-xs uppercase tracking-widest text-bp-fg/40">
              Contributions
            </p>
            <ul className="mt-1 text-sm">
              {CONTRIBUTIONS.map(([label, count]) => (
                <li
                  key={label}
                  className="flex cursor-pointer items-center justify-between rounded px-3 py-2 text-bp-fg/80 hover:bg-white/5 hover:text-bp-fg"
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
          <div className="rounded-lg flex items-start justify-between gap-6 border-2 border-bp-fg/15 bg-bp-card p-6">
            <div>
              <h1 className="mb-3 font-sans text-lg font-bold">About</h1>
              <p className="max-w-xl text-sm leading-relaxed text-bp-fg/80">
                Animator. Designer. Pixel art as therapy. 15 years of craft, one Emmy, one Japan
                residency, zero chill. On-chain since it made sense.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-bp-fg/50">
                <XIcon />
                <InstagramIcon />
                <FarcasterIcon />
                <span>Joined Aug 27, 2025</span>
                <span>·</span>
                <span>
                  From <span className="text-[10px] text-bp-fg/70">AR</span> Argentina
                </span>
                <span>·</span>
                <span className="underline">Edit</span>
              </div>
            </div>
            {/* The account's brush NFT, as shown on the real profile. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brush.png"
              alt="BasePaint brush #3545"
              className="hidden h-28 w-auto shrink-0 rounded sm:block"
            />
          </div>

          {/* Stats grid */}
          <div className="rounded-lg grid grid-cols-2 divide-x-2 divide-y-2 divide-bp-fg/10 border-2 border-bp-fg/15 bg-bp-card sm:grid-cols-3 sm:divide-y-0">
            {STATS.map(([value, label]) => (
              <div key={label} className="bg-bp-accent/[0.04] p-6">
                <p className="font-sans text-3xl font-bold tabular-nums">{value}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-bp-fg/50">{label}</p>
              </div>
            ))}
          </div>

          {/* NEW — Streak Shield, native to the profile, directly under Longest Streak */}
          <ProfileStreakShieldCard />

          {/* Favorite canvases */}
          <div className="rounded-lg border-2 border-bp-fg/15 bg-bp-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-bp-fg/70">
                Favorite Canvases
              </h2>
              <span className="cursor-pointer text-xs text-bp-fg/50 underline hover:text-bp-accent">
                Edit
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {FAVORITE_CANVASES.map(({ day, title }) => (
                <div key={day} className="group cursor-pointer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={basepaintArtUrl(day)}
                    alt={`${title} — BasePaint canvas #${day}`}
                    className="aspect-square w-full rounded border-2 border-bp-fg/10 object-cover [image-rendering:pixelated] group-hover:border-bp-accent/60"
                  />
                  <p className="mt-2 text-sm font-bold">Day #{day}</p>
                  <p className="text-sm leading-snug text-bp-fg/50">{title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-lg border-2 border-bp-fg/15 bg-bp-card p-6">
            <h2 className="mb-2 font-sans text-sm font-bold uppercase tracking-widest text-bp-fg/70">
              Activity
            </h2>

            <ul className="divide-y divide-bp-fg/10 text-sm">
              {ACTIVITY.map((entry, i) => (
                <li
                  key={i}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3"
                >
                  <span className="text-bp-fg/70">
                    <span className="text-bp-accent">{HANDLE}</span>{" "}
                    {entry.kind === "painted" && (
                      <>
                        painted <span className="text-emerald-400">{entry.pixels} px</span>{" "}
                        <span className="text-bp-fg/40">on Day #{entry.day}</span>
                      </>
                    )}
                    {entry.kind === "voted" && (
                      <>
                        voted <span className="text-bp-fg/40">on Day #{entry.day}</span>
                      </>
                    )}
                    {entry.kind === "earned" && (
                      <>
                        earned <span className="text-emerald-400">{entry.eth} ETH</span>{" "}
                        <span className="text-bp-fg/40">from Day #{entry.day}</span>
                      </>
                    )}
                  </span>
                  <span className="shrink-0 text-bp-fg/35">{entry.when}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex justify-center">
              <button
                type="button"
                className="rounded border-2 border-bp-fg/20 px-5 py-2 text-xs font-bold uppercase tracking-widest text-bp-fg/70 hover:border-bp-accent hover:text-bp-accent"
              >
                Load more
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="mx-auto max-w-[1280px] px-4 pb-10 pt-2 text-center text-[11px] text-bp-fg/30">
        Concept mockup recreating basepaint.xyz/@joec.base.eth to pitch Streak Shield as a native
        profile feature — not an official BasePaint page. Canvas art is CC0.{" "}
        <Link href="/" className="underline hover:text-bp-accent">
          See the real Streak Shield dashboard →
        </Link>
      </p>
    </div>
  );
}
