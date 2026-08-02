import Link from "next/link";
import { ConnectWalletButton } from "./ConnectWalletButton";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b-4 border-bp-header bg-bp-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl leading-none">🛡️</span>
          <span className="font-sans text-lg font-bold tracking-tight text-bp-fg">
            Streak <span className="text-bp-accent">Shield</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-bp-fg/80 hover:text-bp-accent">
            My streak
          </Link>
          <Link href="/leaderboard" className="text-bp-fg/80 hover:text-bp-accent">
            Leaderboard
          </Link>
          <a
            href="https://basepaint.xyz"
            target="_blank"
            rel="noreferrer"
            className="hidden text-bp-fg/60 hover:text-bp-accent sm:inline"
          >
            basepaint.xyz ↗
          </a>
        </nav>

        <ConnectWalletButton />
      </div>
    </header>
  );
}
