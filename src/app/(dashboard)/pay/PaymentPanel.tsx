"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PinInput } from "@/components/PinInput";
import { validateReference, validateMxnAmount, validateAmount } from "@/lib/validation";
import { submitPaymentAction } from "@/lib/actions/payments";

type Step = "details" | "confirm";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  SUBMITTED: "Enviado a la red",
  CONFIRMED: "Confirmado",
  FAILED: "Falló",
};

export function PaymentPanel({
  companyId,
  companyName,
  companyLogoKey,
  availableBalance,
}: {
  companyId: string;
  companyName: string;
  companyLogoKey: string;
  availableBalance: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [reference, setReference] = useState("");
  const [amountMxn, setAmountMxn] = useState("");
  const [amountUsd, setAmountUsd] = useState<number | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [pin, setPin] = useState("");
  const [state, formAction, isPending] = useActionState(submitPaymentAction, undefined);

  useEffect(() => {
    if (state?.status === "success") {
      router.refresh();
    }
  }, [state, router]);

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();

    const refCheck = validateReference(reference);
    if (!refCheck.ok) {
      setDetailsError(refCheck.error);
      return;
    }

    const mxnCheck = validateMxnAmount(amountMxn);
    if (!mxnCheck.ok) {
      setDetailsError(mxnCheck.error);
      return;
    }

    setDetailsError(null);
    setIsConverting(true);
    try {
      const res = await fetch(`/api/exchange-rate?mxn=${encodeURIComponent(amountMxn)}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();

      const usdCheck = validateAmount(String(data.usd), availableBalance);
      if (!usdCheck.ok) {
        setDetailsError(usdCheck.error);
        return;
      }

      setAmountUsd(data.usd);
      setStep("confirm");
    } catch {
      setDetailsError("No pudimos obtener el tipo de cambio. Intenta de nuevo.");
    } finally {
      setIsConverting(false);
    }
  }

  const header = (
    <div className="flex items-center gap-4">
      <Image
        src={`/logos/${companyLogoKey}.png`}
        alt={companyName}
        width={96}
        height={48}
        className="rounded-xl border-2 border-forest bg-white object-contain p-1"
      />
      <h1 className="text-xl font-bold text-forest">{companyName}</h1>
    </div>
  );

  if (state?.status === "success") {
    const failed = state.paymentStatus === "FAILED";
    return (
      <div className="flex w-full max-w-md flex-col items-start gap-6">
        {header}
        <h2 className="text-lg font-semibold text-forest">
          {failed ? "El pago no se pudo completar" : "¡Pago enviado!"}
        </h2>
        <Card className="w-full divide-y divide-forest/8 bg-white p-6">
          <SummaryRow label="Proveedor" value={state.companyName} />
          <SummaryRow label="Referencia" value={state.reference} />
          <SummaryRow label="Monto" value={`$${Number(state.amountMxn).toFixed(2)} MXN`} />
          <SummaryRow label="Pagado" value={`$${Number(state.amountUsdc).toFixed(2)} USDC`} />
          <SummaryRow label="Estado" value={STATUS_LABEL[state.paymentStatus] ?? state.paymentStatus} />
          {state.txHash ? (
            <SummaryRow
              label="Transacción"
              value={state.txHash}
              mono
              href={`https://stellar.expert/explorer/testnet/tx/${state.txHash}`}
            />
          ) : null}
        </Card>
        <div className="flex w-full flex-col gap-3">
          <Link href="/pay">
            <Button className="w-full">Hacer otro pago</Button>
          </Link>
          <Link href="/history">
            <Button variant="outline" className="w-full">
              Ver historial
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-start gap-6">
      {header}

      {step === "details" ? (
        <Card className="w-full bg-white p-6">
          <form onSubmit={handleDetailsSubmit} className="flex w-full flex-col gap-4">
            <TextField
              label="Referencia"
              name="reference"
              placeholder="Número de cuenta o referencia"
              maxLength={28}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              required
            />
            <TextField
              label="Monto a pagar (MXN)"
              name="amountMxn"
              placeholder="0.00"
              inputMode="decimal"
              value={amountMxn}
              onChange={(e) => setAmountMxn(e.target.value)}
              required
            />
            {detailsError ? <p className="text-sm text-red-600">{detailsError}</p> : null}
            <Button type="submit" disabled={isConverting}>
              {isConverting ? "Calculando…" : "Continuar"}
            </Button>
          </form>
        </Card>
      ) : (
        <div className="flex w-full flex-col items-start gap-6">
          <Card className="w-full divide-y divide-forest/8 bg-white p-6">
            <SummaryRow label="Referencia" value={reference} />
            <SummaryRow label="Monto" value={`$${Number(amountMxn).toFixed(2)} MXN`} />
            <SummaryRow label="Equivalente" value={`≈ $${(amountUsd ?? 0).toFixed(2)} USDC`} />
          </Card>

          <Card className="w-full bg-white p-6">
            <form action={formAction} className="flex w-full flex-col items-start gap-6">
              <input type="hidden" name="companyId" value={companyId} />
              <input type="hidden" name="reference" value={reference} />
              <input type="hidden" name="amountMxn" value={amountMxn} />
              <input type="hidden" name="pin" value={pin} />

              <PinInput value={pin} onChange={setPin} name="pin-display" disabled={isPending} />

              {state?.status === "error" ? <p className="text-sm text-red-600">{state.error}</p> : null}

              <div className="flex w-full flex-col gap-3">
                <Button type="submit" disabled={pin.length !== 4 || isPending} className="w-full">
                  {isPending ? "Procesando…" : "Confirmar y pagar"}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("details")}>
                  Editar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  mono,
  href,
}: {
  label: string;
  value: string;
  mono?: boolean;
  href?: string;
}) {
  const valueClassName = `font-medium text-forest ${mono ? "truncate pl-4 font-mono text-xs" : ""}`;
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-ink-3">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${valueClassName} text-amber-dark underline hover:text-forest`}
        >
          {value}
        </a>
      ) : (
        <span className={valueClassName}>{value}</span>
      )}
    </div>
  );
}
