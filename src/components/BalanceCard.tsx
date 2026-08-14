"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";

export function BalanceCard({
  initialAmount,
  hasWallet,
}: {
  initialAmount: string | null;
  hasWallet: boolean;
}) {
  const [amount, setAmount] = useState(initialAmount);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function refresh() {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/stores/balance", { cache: "no-store" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setAmount(data.amount);
      } catch {
        setError("No pudimos actualizar el saldo.");
      }
    });
  }

  return (
    <Card className="bg-forest px-6 py-6 text-cream">
      <p className="text-sm text-cream/60">Saldo disponible (USDC · Stellar)</p>
      {hasWallet ? (
        <div className="mt-2 flex items-end justify-between">
          <p className="tabular-nums text-4xl font-bold">
            {amount === null ? "—" : `$${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
          <button
            onClick={refresh}
            disabled={isPending}
            className="text-sm text-amber hover:text-amber-dark disabled:opacity-50"
          >
            {isPending ? "Actualizando…" : "Actualizar"}
          </button>
        </div>
      ) : (
        <p className="mt-2 text-sm text-cream/70">
          Esta tienda todavía no tiene una billetera configurada.
        </p>
      )}
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
    </Card>
  );
}
