# Streak Shield

A capped, slow-refilling "shield" mechanic layered on top of [BasePaint](https://basepaint.xyz) painting
streaks — forgives an occasional missed day without letting anyone buy their way out of actually
showing up. Built for the BasePaint AI Hackathon.

This is a **derivative app**, not a change to BasePaint itself: it reads BasePaint's public
indexer and calls BasePaint's own `mint()` function directly. It never touches pixel allocation,
mint pricing, or artist payouts, and it never holds a treasury.

## Run it

```bash
npm install
cp .env.example .env.local   # optional: override the Base RPC URL
npm run dev
```

Open http://localhost:3000, connect an injected wallet (MetaMask, Coinbase Wallet's browser
extension, or any other Base-compatible injected wallet) on **Base mainnet**, and your streak
loads straight from BasePaint's public GraphQL indexer — no signup, no backend.

Wallet connection is a small direct EIP-1193 (`window.ethereum`) integration via viem
(`lib/useWallet.ts`) rather than `wagmi` — wagmi's connector bundle pulls in WalletConnect, Safe,
and React Native/Expo dependencies regardless of which connector you use, which made installs
too slow for this build window. Trade-off: no WalletConnect/mobile QR support yet; that's a
natural place to reach for wagmi later if this grows past a hackathon demo.

## How it works

**Streak.** `lib/graphql.ts` pulls every `Contribution` (day the wallet painted) for the connected
address from `https://graphql.basepaint.xyz`. `lib/streak.ts` replays that history forward,
day-by-day, applying the shield rules from the spec:

- max 2 shields held at once
- 1 purchase per rolling 30-day window
- +1 free shield every 30-day streak milestone, up to the cap
- a missed day auto-consumes the oldest shield; with none available, the streak resets

This has to be a forward replay, not a backward walk from today, because shield state is
path-dependent — you can't know how many shields were available on day 400 without knowing the
full history of misses/earns/purchases before it.

BasePaint's indexer (`basepaint-ponder`) already tracks its own `Account.streak` — that's the
*unshielded* number (breaks on any missed day, no concept of shields) and is what the leaderboard
sorts by and what the dashboard shows as "what BasePaint's own counter would say" for comparison.

**Shields.** For the ~6-day build window, shield state is tracked off-chain
(`lib/shieldStore.ts`, a per-wallet localStorage ledger of purchase events), exactly the MVP path
called out in the spec. It's honest about being a convenience layer, not a trustless primitive —
see `contracts/StreakShield.sol` for the on-chain version sketched out as a stretch goal, and the
limitation noted below.

**Buying a shield** (`components/BuyProtectionButton.tsx`) is a real mint: it calls BasePaint's
own `mint(day, count)` on the core contract (`0xBa5e05cb26b78eDa3A2f8e3b3814726305dcAc83`) for the
canvas currently in its 24h sale window, at BasePaint's live `openEditionPrice()`. Funds land in
that canvas's real artist earnings pool — there's no separate treasury. The app just listens for
the mint transaction to confirm and then credits a shield, subject to the cap and rolling-window
rules enforced in `lib/streak.ts#canPurchaseShield`.

**Leaderboard** (`app/leaderboard/page.tsx`) is a simple public page sorted by BasePaint's raw
streak — the gap called out in the spec: streaks are already visible informally in BasePaint's
chat, but there's no public leaderboard today.

**Notifications.** No Farcaster bot, no email, no Telegram — those all need their own
opt-in/infra and a cold-mention bot account risks getting spam-flagged this week. Instead there's
a zero-infra in-app banner (`components/LowShieldBanner.tsx`) that shows once a connected wallet
is down to 1 or 0 shields. Honest limitation: it only reaches people who open the app that day.

## File map

```
app/page.tsx                  dashboard: streak, shields, banner, buy button, shield history
app/leaderboard/page.tsx       public leaderboard sorted by raw streak
lib/basepaint.ts               day math, BasePaint contract address/ABI, mint-day helper
lib/graphql.ts                 queries against graphql.basepaint.xyz (Account, Contribution)
lib/streak.ts                  the forward-replay streak/shield simulation engine
lib/shieldStore.ts             localStorage shield-purchase ledger (MVP off-chain path)
lib/shieldRules.ts             the tuned constants (cap, window, milestone interval)
lib/wagmi.ts                   viem public client for Base mainnet reads
lib/useWallet.ts               minimal EIP-1193 wallet connection (no wagmi, see above)
components/BuyProtectionButton.tsx   real on-chain mint + shield credit
contracts/StreakShield.sol     on-chain stretch goal, documented, not deployed
```

## Why this balance beats a simpler "buy shields" model

Hard cap of 2, hard purchase limit of 1/month: the most a payer can do is go from 0→1 shield in a
given month, since reaching the cap of 2 requires either hitting a 30-day milestone or buying
across two separate months. A dedicated painter earns shields at the same rate a payer buys them —
paying doesn't get you ahead, it just gets you a shield sooner if you haven't hit the milestone
yet. Money buys convenience for occasional lapses, never invincibility or a higher tier than an
active player already has.

## Judging criteria

- **Usefulness** — solves a real retention problem (miss a day, feel like you've "lost," stop
  coming back) without touching BasePaint's core economics.
- **Craft** — the capped-cap + capped-purchase-rate combination is a tuned balance, not just
  "streak freeze but smaller"; `lib/streak.ts` implements it as one deterministic simulation
  rather than bolted-on special cases.
- **Originality** — "buying protection" = minting the current canvas at its live price, funds
  landing in the real artist pool, is a reuse of BasePaint's existing mint mechanism rather than a
  bolted-on treasury or token.
- **Staying power** — free milestone earning plus a paid option priced identically to a mint gives
  both non-payers and casual payers a reason to keep a streak alive; the low-shield banner nudges
  action before a streak actually breaks.

## Known limitations (honest, not hidden)

- Shield state lives in the connecting browser's localStorage, not on-chain — switch devices and
  the app has to re-derive what it can (raw painted-day history) but won't see past purchases.
  `contracts/StreakShield.sol` is the intended fix, not shipped this week.
- No push/social notification — only reaches people who open the app.
- Leaderboard ranks BasePaint's raw streak, not the shielded one, since shield state isn't shared
  infrastructure yet.
