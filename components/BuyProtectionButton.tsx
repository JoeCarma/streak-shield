"use client";

import { useMemo, useState } from "react";
import { formatEther } from "viem";
import { useQuery } from "@tanstack/react-query";
import { publicClient, base } from "@/lib/wagmi";
import { useWallet } from "@/lib/useWallet";
import { BASEPAINT_ABI, BASEPAINT_ADDRESS } from "@/lib/basepaint";
import { canPurchaseShield } from "@/lib/streak";
import { addPurchase } from "@/lib/shieldStore";
import { PurchaseEvent } from "@/lib/types";

type Status = "idle" | "awaiting-signature" | "mining" | "done" | "error";

export function BuyProtectionButton({
  shieldsHeld,
  purchases,
  onPurchased,
}: {
  shieldsHeld: number;
  purchases: PurchaseEvent[];
  onPurchased: () => void;
}) {
  const { address, getWalletClient } = useWallet();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: onchainToday } = useQuery({
    queryKey: ["basepaint-today"],
    queryFn: () =>
      publicClient.readContract({
        address: BASEPAINT_ADDRESS,
        abi: BASEPAINT_ABI,
        functionName: "today",
      }),
    refetchInterval: 60_000,
  });

  const { data: price } = useQuery({
    queryKey: ["basepaint-price"],
    queryFn: () =>
      publicClient.readContract({
        address: BASEPAINT_ADDRESS,
        abi: BASEPAINT_ABI,
        functionName: "openEditionPrice",
      }),
    refetchInterval: 60_000,
  });

  const mintDay = onchainToday !== undefined ? onchainToday - 1n : undefined;

  const eligibility = useMemo(
    () => canPurchaseShield(shieldsHeld, purchases),
    [shieldsHeld, purchases]
  );

  async function handleBuy() {
    if (!eligibility.allowed || mintDay === undefined || price === undefined || !address) return;
    const walletClient = getWalletClient();
    if (!walletClient) return;

    setErrorMsg(null);
    setStatus("awaiting-signature");
    try {
      const hash = await walletClient.writeContract({
        address: BASEPAINT_ADDRESS,
        abi: BASEPAINT_ABI,
        functionName: "mint",
        args: [mintDay, 1n],
        value: price,
        chain: base,
        account: address,
      });
      setStatus("mining");
      await publicClient.waitForTransactionReceipt({ hash });
      addPurchase(address, { day: Number(mintDay), timestamp: Date.now(), txHash: hash });
      setStatus("done");
      onPurchased();
    } catch (err: any) {
      console.error("buy protection failed", err);
      setErrorMsg(err?.shortMessage ?? err?.message ?? "Transaction failed.");
      setStatus("error");
    }
  }

  const disabled =
    !eligibility.allowed ||
    status === "awaiting-signature" ||
    status === "mining" ||
    mintDay === undefined ||
    price === undefined ||
    !address;

  return (
    <div>
      <button
        onClick={handleBuy}
        disabled={disabled}
        className="w-full rounded border-2 border-bp-accent bg-transparent px-4 py-2.5 font-mono text-sm font-bold text-bp-accent transition hover:bg-bp-accent hover:text-bp-bg disabled:cursor-not-allowed disabled:border-bp-fg/20 disabled:text-bp-fg/30 disabled:hover:bg-transparent"
      >
        {status === "awaiting-signature"
          ? "Confirm in wallet…"
          : status === "mining"
          ? "Minting…"
          : status === "done"
          ? "Shield credited ✓"
          : price !== undefined
          ? `Buy Protection — Ξ${formatEther(price)}`
          : "Buy Protection"}
      </button>

      <p className="mt-2 text-xs text-bp-fg/50">
        {price !== undefined
          ? `Same price as minting canvas #${mintDay !== undefined ? Number(mintDay) : "…"} — funds go to that canvas's artist pool.`
          : "Loading live mint price…"}
      </p>

      {!eligibility.allowed && (
        <p className="mt-1 text-xs text-bp-accent/80">
          {eligibility.reason}
          {eligibility.nextEligibleAt && (
            <>
              {" "}
              Next purchase available{" "}
              {new Date(eligibility.nextEligibleAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              .
            </>
          )}
        </p>
      )}
      {errorMsg && <p className="mt-1 text-xs text-red-300">{errorMsg}</p>}
    </div>
  );
}
