// Viem clients for reading/writing to Base mainnet.
//
// Note: this app doesn't use the `wagmi` package. Wagmi's connector bundle
// (`@wagmi/connectors`) unconditionally pulls in WalletConnect, Safe, and
// React Native/Expo dependencies regardless of which connector you actually
// use, which made installs far too slow for a ~6-day hackathon build. A
// direct `window.ethereum` (EIP-1193) connection via viem covers MetaMask,
// Coinbase Wallet's extension, and any other injected Base-compatible
// wallet with a fraction of the dependency weight. See lib/useWallet.ts.
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org";

export const publicClient = createPublicClient({
  chain: base,
  transport: http(rpcUrl),
});

export { base };
