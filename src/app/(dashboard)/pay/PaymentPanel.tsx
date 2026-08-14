"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PinInput } from "@/components/PinInput";
import { validateReference, validateAmount } from "@/lib/validation";
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
  const [amount, setAmount] = useState("");
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [state, formAction, isPending] = useActionState(submitPaymentAction, undefined);

  useEffect(() => {
    if (state?.status === "success") {
      router.refresh();
    }
  }, [state, router]);

  function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();

    const refCheck = validateReference(reference);
    if (!refCheck.ok) {
      setDetailsError(refCheck.error);
      return;
    }

    const amountCheck = validateAmount(amount, availableBalance);
    if (!amountCheck.ok) {
      setDetailsError(amountCheck.error);
      return;
    }

    setDetailsError(null);
    setStep("confirm");
  }

  const logo = (
    <Image
      src={`/logos/${companyLogoKey}.png`}
      alt={companyName}
      width={180}
      height={90}
      className="w-2/5 rounded-2xl object-cover"
    />
  );

  if (state?.status === "success") {
    const failed = state.paymentStatus === "FAILED";
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
        {logo}
        <h1 className="text-xl font-bold text-forest">
          {failed ? "El pago no se pudo completar" : "¡Pago enviado!"}
        </h1>
        <Card className="w-full divide-y divide-forest/8 bg-white px-5 text-left">
          <SummaryRow label="Proveedor" value={state.companyName} />
          <SummaryRow label="Referencia" value={state.reference} />
          <SummaryRow label="Monto" value={`$${Number(state.amount).toFixed(2)} USDC`} />
          <SummaryRow label="Estado" value={STATUS_LABEL[state.paymentStatus] ?? state.paymentStatus} />
          {state.txHash ? <SummaryRow label="Transacción" value={state.txHash} mono /> : null}
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
    <div className="mx-auto flex max-w-md flex-col items-center gap-6">
      {logo}
      <h1 className="text-xl font-bold text-forest">{companyName}</h1>

      {step === "details" ? (
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
            label="Monto (USDC)"
            name="amount"
            placeholder="0.00"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          {detailsError ? <p className="text-sm text-red-600">{detailsError}</p> : null}
          <Button type="submit">Continuar</Button>
        </form>
      ) : (
        <div className="flex w-full flex-col items-center gap-6">
          <Card className="w-full divide-y divide-forest/8 bg-white px-5">
            <SummaryRow label="Referencia" value={reference} />
            <SummaryRow label="Monto" value={`$${Number(amount).toFixed(2)} USDC`} />
          </Card>

          <form action={formAction} className="flex w-full flex-col items-center gap-6">
            <input type="hidden" name="companyId" value={companyId} />
            <input type="hidden" name="reference" value={reference} />
            <input type="hidden" name="amount" value={amount} />
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
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-ink-3">{label}</span>
      <span className={`font-medium text-forest ${mono ? "truncate pl-4 font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
