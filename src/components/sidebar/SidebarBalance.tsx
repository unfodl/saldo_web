"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

type WalletDetails = {
  address: string;
  isStaging: boolean;
  usdc: { amount: string };
  usdxm: { amount: string };
};

function formatAmount(amount: string | null) {
  if (amount === null) return "—";
  return `$${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-6)}`;
}

/** Mock only — no real credit product/backend behind this yet. */
const MOCK_CREDIT_LIMIT = 1000;

export function SidebarBalance({
  initialAmount,
  hasWallet,
}: {
  initialAmount: string | null;
  hasWallet: boolean;
}) {
  const [manualAmount, setManualAmount] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const amount = manualAmount ?? initialAmount;

  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState<WalletDetails | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [isLoadingDetails, startLoadingDetails] = useTransition();

  const [copied, setCopied] = useState(false);

  const [creditAmount, setCreditAmount] = useState(0);
  const [creditConfirmed, setCreditConfirmed] = useState(false);

  function updateCreditAmount(next: number) {
    const clamped = Math.min(MOCK_CREDIT_LIMIT, Math.max(0, next));
    setCreditAmount(clamped);
    setCreditConfirmed(false);
  }

  function refresh() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/stores/balance", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setManualAmount(data.amount);
      } catch {
        // silently ignore — the displayed balance just stays as-is
      }
    });
  }

  function toggleExpanded() {
    const next = !expanded;
    setExpanded(next);
    if (next && !details) {
      loadDetails();
    }
  }

  function loadDetails() {
    startLoadingDetails(async () => {
      setDetailsError(null);
      try {
        const res = await fetch("/api/stores/wallet", { cache: "no-store" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setDetails(data);
      } catch {
        setDetailsError("No pudimos cargar los detalles de la billetera.");
      }
    });
  }

  function copyAddress() {
    if (!details) return;
    navigator.clipboard.writeText(details.address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (!hasWallet) {
    return (
      <div className="rounded-xl bg-forest/5 px-4 py-3 text-xs text-forest/50">
        Billetera no configurada
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-forest/5 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-forest/50">Saldo USDC</span>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={isPending}
            className="text-xs text-amber-dark hover:text-forest disabled:opacity-50"
          >
            {isPending ? "…" : "↻"}
          </button>
          <button
            onClick={toggleExpanded}
            aria-label={expanded ? "Ocultar detalles" : "Mostrar detalles"}
            className="text-forest/40 hover:text-forest"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
      <p className="tabular-nums text-xl font-semibold text-forest">{formatAmount(amount)}</p>

      {expanded ? (
        <div className="mt-3 flex flex-col gap-3 border-t border-forest/8 pt-3">
          {isLoadingDetails && !details ? (
            <p className="text-xs text-forest/40">Cargando…</p>
          ) : detailsError ? (
            <p className="text-xs text-red-600">{detailsError}</p>
          ) : details ? (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-forest/50">Dirección de la billetera</span>
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-2 text-left font-mono text-xs text-forest ring-1 ring-forest/10 hover:ring-amber/50"
                  title={details.address}
                >
                  <span className="flex-1 truncate">{truncateAddress(details.address)}</span>
                  {copied ? (
                    <Check size={13} className="shrink-0 text-forest-light" />
                  ) : (
                    <Copy size={13} className="shrink-0 text-forest/40" />
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-1.5 border-t border-forest/8 pt-3">
                <span className="text-xs text-forest/50">
                  Línea de crédito disponible · {formatAmount(String(MOCK_CREDIT_LIMIT))}
                </span>
                <input
                  type="range"
                  min={0}
                  max={MOCK_CREDIT_LIMIT}
                  step={10}
                  value={creditAmount}
                  onChange={(e) => updateCreditAmount(Number(e.target.value))}
                  className="w-full accent-amber"
                />
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={MOCK_CREDIT_LIMIT}
                    value={creditAmount}
                    onChange={(e) => updateCreditAmount(Number(e.target.value))}
                    className="w-20 rounded-lg bg-white px-2 py-1.5 text-xs text-forest ring-1 ring-forest/10 focus:outline-none focus:ring-amber"
                  />
                  <button
                    onClick={() => setCreditConfirmed(true)}
                    disabled={creditAmount === 0}
                    className="flex-1 rounded-lg bg-amber px-2 py-1.5 text-xs font-medium text-forest hover:bg-amber-dark disabled:opacity-50"
                  >
                    Confirmar
                  </button>
                </div>
                {creditConfirmed ? (
                  <p className="text-[11px] text-forest-light">
                    Solicitud de {formatAmount(String(creditAmount))} enviada (demo).
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
