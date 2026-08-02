"use client";

import { useWallet } from "@/lib/useWallet";

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function ConnectWalletButton() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();

  if (isConnected && address) {
    return (
      <button
        onClick={disconnect}
        className="rounded border-2 border-bp-fg/20 bg-bp-bg px-3 py-1.5 font-mono text-xs text-bp-fg hover:border-bp-accent hover:text-bp-accent"
        title="Disconnect"
      >
        {short(address)}
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="rounded border-2 border-bp-accent bg-bp-accent px-3 py-1.5 font-mono text-xs font-bold text-bp-bg hover:opacity-90 disabled:opacity-50"
    >
      {isConnecting ? "Connecting…" : "Connect wallet"}
    </button>
  );
}
