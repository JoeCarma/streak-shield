"use client";

import { createContext, createElement, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createWalletClient, custom, type WalletClient } from "viem";
import { base } from "viem/chains";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const BASE_CHAIN_ID_HEX = "0x2105"; // 8453

type WalletState = {
  address: `0x${string}` | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
};

/**
 * Minimal EIP-1193 wallet connection — no wagmi. Covers MetaMask, Coinbase
 * Wallet's extension, and any other injected Base-compatible wallet.
 * See lib/wagmi.ts for the rationale (dependency weight).
 *
 * Deliberately NOT exported: connection state has to be shared across the tree,
 * not duplicated per caller. Use `useWallet()` (backed by WalletProvider).
 * An earlier version exported this directly, so every consumer held its own
 * copy — clicking "Connect wallet" updated the button but left sibling
 * components (the profile's Streak Shield card) stuck on their disconnected
 * state until a route change remounted them.
 */
function useWalletState() {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
  });

  useEffect(() => {
    const eth = typeof window !== "undefined" ? window.ethereum : undefined;
    if (!eth) return;

    eth
      .request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts?.[0]) {
          setState((s) => ({ ...s, address: accounts[0] as `0x${string}`, isConnected: true }));
        }
      })
      .catch(() => {});

    eth
      .request({ method: "eth_chainId" })
      .then((id: string) => setState((s) => ({ ...s, chainId: parseInt(id, 16) })))
      .catch(() => {});

    function handleAccountsChanged(accounts: string[]) {
      setState((s) => ({
        ...s,
        address: (accounts?.[0] as `0x${string}`) ?? null,
        isConnected: Boolean(accounts?.[0]),
      }));
    }
    function handleChainChanged(id: string) {
      setState((s) => ({ ...s, chainId: parseInt(id, 16) }));
    }

    eth.on?.("accountsChanged", handleAccountsChanged);
    eth.on?.("chainChanged", handleChainChanged);

    return () => {
      eth.removeListener?.("accountsChanged", handleAccountsChanged);
      eth.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    const eth = typeof window !== "undefined" ? window.ethereum : undefined;
    if (!eth) {
      window.open("https://ethereum.org/en/wallets/find-wallet/", "_blank");
      return;
    }
    setState((s) => ({ ...s, isConnecting: true }));
    try {
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });

      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: BASE_CHAIN_ID_HEX }],
        });
      } catch (switchError: any) {
        if (switchError?.code === 4902) {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: BASE_CHAIN_ID_HEX,
                chainName: "Base",
                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"],
              },
            ],
          });
        }
      }

      const chainIdHex: string = await eth.request({ method: "eth_chainId" });
      setState({
        address: (accounts[0] as `0x${string}`) ?? null,
        isConnected: Boolean(accounts[0]),
        isConnecting: false,
        chainId: parseInt(chainIdHex, 16),
      });
    } catch (err) {
      console.error("wallet connect failed", err);
      setState((s) => ({ ...s, isConnecting: false }));
    }
  }, []);

  const disconnect = useCallback(() => {
    // Injected wallets don't expose a programmatic disconnect — just clear local state.
    setState({ address: null, isConnected: false, isConnecting: false, chainId: null });
  }, []);

  const getWalletClient = useCallback((): WalletClient | null => {
    const eth = typeof window !== "undefined" ? window.ethereum : undefined;
    if (!eth || !state.address) return null;
    return createWalletClient({
      account: state.address,
      chain: base,
      transport: custom(eth),
    });
  }, [state.address]);

  return { ...state, connect, disconnect, getWalletClient };
}

type WalletContextValue = ReturnType<typeof useWalletState>;

const WalletContext = createContext<WalletContextValue | null>(null);

/**
 * Holds the single wallet connection for the whole app. Mounted once in
 * app/providers.tsx so that connecting anywhere updates everywhere — the
 * header button and the page content are always describing the same wallet.
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const value = useWalletState();
  return createElement(WalletContext.Provider, { value }, children);
}

/** Read the shared wallet connection. Must be used under <WalletProvider>. */
export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within <WalletProvider> (see app/providers.tsx)");
  }
  return ctx;
}
