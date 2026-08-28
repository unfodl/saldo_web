import { useState, type ReactNode } from "react";
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

// Timestamps from bluto are UTC ISO strings (e.g. "2026-08-27T23:39:05.557Z").
// Pinned to America/Mexico_City rather than the viewer's device timezone so
// dates read consistently as the business's local time, and rendered in
// 24h format to avoid "p.m." ambiguity.
const DATE_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Mexico_City",
});

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return DATE_FORMATTER.format(date).replace(",", " ·");
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

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="py-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-4/70">{title}</p>
      <div className="divide-y divide-forest/8">{children}</div>
    </div>
  );
}

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusMeta(transaction.status);
  const company = COMPANIES.find((c) => c.code === transaction.company?.code);
  const companyName = transaction?.company?.name ?? transaction.type;
  const phone = transaction.metadata?.phone;
  const reference = transaction.metadata?.reference ?? phone;
  const saldoResponse = transaction.saldo?.response;
  const saldoError = transaction.saldo?.error;

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
            {Number(transaction.amountUsdc).toFixed(2)} {transaction.currency}
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
          <DetailSection title="Transacción">
            <DetailRow label="ID de transacción" value={transaction.transactionId} mono />
            <DetailRow label="Cadena" value={transaction.chain} />
            <DetailRow label="Billetera" value={transaction.walletAddress} mono />
            <DetailRow label="Tipo" value={transaction.type} />
            <DetailRow label={phone ? "Teléfono" : "Referencia"} value={reference} />
            <DetailRow label="Monto MXN" value={transaction.amountMxn ? `$${Number(transaction.amountMxn).toFixed(2)} MXN` : undefined} />
            {transaction.metadata?.amountService ? (
              <DetailRow
                label="Monto del servicio"
                value={`${transaction.metadata.amountService} ${transaction.metadata.currency ?? ""}`.trim()}
              />
            ) : null}
            <DetailRow label="Actualizado" value={formatDate(transaction.updatedAt)} />
          </DetailSection>

          {saldoResponse || saldoError ? (
            <DetailSection title="Respuesta de Saldo">
              {saldoError ? (
                <DetailRow label="Error" value={saldoError} />
              ) : (
                <>
                  <DetailRow label="Resultado" value={saldoResponse?.result} />
                  <DetailRow
                    label="Pagado"
                    value={saldoResponse?.paid ? `${saldoResponse.paid} ${saldoResponse.currency ?? ""}`.trim() : undefined}
                  />
                  <DetailRow label="Comisión" value={saldoResponse?.amount} />
                </>
              )}
              <DetailRow label="Consultado" value={formatDate(transaction.saldo?.calledAt ?? "")} />
            </DetailSection>
          ) : null}

          {transaction.crossmint ? (
            <DetailSection title="Respuesta de Crossmint">
              <DetailRow label="ID de transacción" value={transaction.crossmint.response?.transactionId} mono />
              <DetailRow label="Hash" value={transaction.crossmint.response?.hash} mono />
              <DetailRow label="Reportado" value={formatDate(transaction.crossmint.reportedAt ?? "")} />
              {transaction.crossmint.response?.explorerLink ? (
                <div className="flex items-center justify-between gap-4 py-2">
                  <span className="text-xs text-ink-4">Explorador</span>
                  <a
                    href={transaction.crossmint.response.explorerLink}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-forest/10 px-3 py-1 text-xs font-medium text-forest-light hover:bg-forest/20"
                  >
                    Ver en explorador ↗
                  </a>
                </div>
              ) : null}
            </DetailSection>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
