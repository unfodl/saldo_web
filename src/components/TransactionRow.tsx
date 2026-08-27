import { useState } from "react";
import { COMPANIES } from "../data/companies";
import type { Transaction } from "../types/transaction";

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  SALDO_SUCCESS: { label: "Confirmado", className: "bg-forest/10 text-forest-light" },
};

function statusMeta(status: string) {
  if (STATUS_STYLE[status]) return STATUS_STYLE[status];
  if (/fail|error|reject/i.test(status)) return { label: status, className: "bg-red-100 text-red-600" };
  if (/pending|process/i.test(status)) return { label: status, className: "bg-amber/20 text-amber-dark" };
  return { label: status, className: "bg-forest/10 text-forest-light" };
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}

function DetailRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-xs text-ink-4">{label}</span>
      <span className={`text-right text-xs text-forest ${mono ? "break-all font-mono" : ""}`}>{value}</span>
    </div>
  );
}

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusMeta(transaction.status);
  const companyName = transaction.metadata?.company ?? transaction.type;
  const company = COMPANIES.find((c) => c.name.toLowerCase() === companyName?.toLowerCase());
  const reference = transaction.metadata?.reference;
  const saldoResponse = transaction.saldo?.response;

  return (
    <div className="px-5 py-4">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-4 text-left"
      >
        {company ? (
          <img src={`/logos/${company.logoKey}.png`} alt={companyName} className="h-11 w-11 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cream-muted/60 text-sm font-semibold text-forest ring-1 ring-forest/8">
            {companyName?.slice(0, 2).toUpperCase() ?? "?"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-forest">{companyName}</p>
          {reference ? <p className="truncate text-sm text-ink-4">{reference}</p> : null}
          <p className="text-xs text-ink-4">{formatDate(transaction.createdAt)}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="tabular-nums font-semibold text-forest">
            {Number(transaction.amount).toFixed(2)} {transaction.currency}
          </p>
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${status.className}`}>{status.label}</span>
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 shrink-0 text-ink-4 transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {expanded ? (
        <div className="mt-3 divide-y divide-forest/8 rounded-xl bg-cream-muted/40 px-4">
          <DetailRow label="ID de transacción" value={transaction.transactionId} mono />
          <DetailRow label="Cadena" value={transaction.chain} />
          <DetailRow label="Billetera" value={transaction.walletAddress} mono />
          <DetailRow label="Tipo" value={transaction.type} />
          {transaction.metadata?.amountService ? (
            <DetailRow
              label="Monto del servicio"
              value={`${transaction.metadata.amountService} ${transaction.metadata.currency ?? ""}`.trim()}
            />
          ) : null}
          {saldoResponse ? (
            <>
              <DetailRow label="Pagado" value={saldoResponse.paid ? `${saldoResponse.paid} ${saldoResponse.currency ?? ""}`.trim() : undefined} />
              <DetailRow label="Comisión" value={saldoResponse.amount} />
              <DetailRow label="Resultado" value={saldoResponse.result} />
            </>
          ) : null}
          <DetailRow label="Hash" value={transaction.crossmint?.hash} mono />
          {transaction.crossmint?.explorerLink ? (
            <div className="flex items-center justify-between gap-4 py-2">
              <span className="text-xs text-ink-4">Explorador</span>
              <a
                href={transaction.crossmint.explorerLink}
                target="_blank"
                rel="noreferrer"
                className="truncate text-right text-xs text-amber hover:text-amber-dark"
              >
                Ver transacción
              </a>
            </div>
          ) : null}
          <DetailRow label="Actualizado" value={formatDate(transaction.updatedAt)} />
        </div>
      ) : null}
    </div>
  );
}
