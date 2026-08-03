"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "@/lib/useWallet";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/*
        One wallet connection for the whole tree. Without this, each useWallet()
        caller kept its own state and they drifted apart — see lib/useWallet.ts.
      */}
      <WalletProvider>{children}</WalletProvider>
    </QueryClientProvider>
  );
}
