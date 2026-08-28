import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../../api/authApi";
import { ApiError } from "../../api/httpClient";
import { sendToken } from "../../api/walletApi";
import { useUserAuth } from "../../auth/userAuth";
import { useSaldoWallet } from "../../hooks/useSaldoWallet";
import { convertMxnToUsdc } from "../../lib/exchangeRate";
import { validateAmount, validateMxnAmount, validatePin, validateReference } from "../../lib/validation";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { PinInput } from "../../components/PinInput";
import { TextField } from "../../components/TextField";
import type { Company, CompanyCategory } from "../../types/payment";

type Step = "details" | "confirm";

type PaymentStatus = "CONFIRMED" | "FAILED";

type SuccessState = {
  reference: string;
  amountMxn: string;
  amountUsdc: string;
  status: PaymentStatus;
  txHash?: string;
  failureReason?: string;
};

export function PaymentPanel({ company, category }: { company: Company; category: CompanyCategory }) {
  const { token, email } = useUserAuth();
  const { wallet, balance, refresh } = useSaldoWallet(token, email);
  const availableBalance = Number(balance?.amount ?? 0);

  const [step, setStep] = useState<Step>("details");
  const [reference, setReference] = useState("");
  const [amountMxn, setAmountMxn] = useState("");
  const [amountUsd, setAmountUsd] = useState<number | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  async function handleDetailsSubmit(e: FormEvent) {
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
    if (!token) {
      setDetailsError("Tu sesión expiró. Vuelve a iniciar sesión.");
      return;
    }

    setDetailsError(null);
    setIsConverting(true);
    try {
      // Same MXN-to-USDC conversion the old Next.js app used: the operator
      // types the peso amount, we resolve it to USDC via Saldo's exchange
      // rate before checking it against the wallet's USDC balance.
      const usd = await convertMxnToUsdc(Number(amountMxn), token);

      const usdCheck = validateAmount(String(usd), availableBalance);
      if (!usdCheck.ok) {
        setDetailsError(usdCheck.error);
        return;
      }

      setAmountUsd(usd);
      setStep("confirm");
    } catch {
      setDetailsError("No pudimos obtener el tipo de cambio. Intenta de nuevo.");
    } finally {
      setIsConverting(false);
    }
  }

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    setPinError(null);

    const pinCheck = validatePin(pin);
    if (!pinCheck.ok) {
      setPinError(pinCheck.error);
      return;
    }
    if (!token || !email) {
      setPinError("Tu sesión expiró. Vuelve a iniciar sesión.");
      return;
    }
    if (!wallet) {
      setPinError("Esta cuenta todavía no tiene una billetera configurada.");
      return;
    }
    if (amountUsd === null) {
      setPinError("No pudimos calcular el monto en USDC. Vuelve a intentarlo.");
      return;
    }

    setIsPending(true);

    // bluto already holds the PIN — there's no local PIN hash to check
    // against anymore (that lived in Prisma's Operator table), so this
    // re-runs bluto's own login check instead of duplicating verification.
    try {
      await loginUser(email, pin);
    } catch {
      setPinError("PIN incorrecto.");
      setIsPending(false);
      return;
    }

    const trimmedReference = reference.trim();
    const amountUsdc = amountUsd.toFixed(6);
    let txHash: string | undefined;
    let status: PaymentStatus = "CONFIRMED";
    let failureReason: string | undefined;
    try {
      // Sent server-side: the backend holds the Crossmint wallet credentials
      // and does the actual transfer, identifying the sender by email.
      // RECARGAS providers recharge a phone number, so the reference the
      // user typed is sent as `phone` there instead of `reference`.
      const result = await sendToken(
        {
          email,
          amountMxn,
          amountUsdc,
          company: { name: company.name, code: company.code },
          type: category === "RECARGAS" ? "recharge" : "service",
          ...(category === "RECARGAS" ? { phone: trimmedReference } : { reference: trimmedReference }),
        },
        token,
      );
      txHash = result.txHash;
    } catch (err) {
      status = "FAILED";
      failureReason = err instanceof ApiError ? err.message : "Error desconocido";
    }

    refresh();

    setIsPending(false);
    setSuccess({ reference: trimmedReference, amountMxn, amountUsdc, status, txHash, failureReason });
  }

  if (success) {
    const failed = success.status === "FAILED";
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
        <StatusIcon failed={failed} />
        <div>
          <h1 className="text-2xl font-bold text-forest">{failed ? "El pago no se pudo completar" : "¡Pago enviado!"}</h1>
          <p className="mt-1 text-sm text-ink-4">
            {failed ? "Intenta de nuevo en unos minutos." : `Tu pago a ${company.name} fue procesado correctamente.`}
          </p>
        </div>

        <Card className="w-full overflow-hidden bg-white text-left shadow-sm">
          <CompanyHeader company={company} caption={failed ? "Pago fallido" : "Pago confirmado"} />
          <div className="divide-y divide-forest/8 px-5">
            <SummaryRow label="Referencia" value={success.reference} />
            <SummaryRow label="Monto" value={`$${Number(success.amountMxn).toFixed(2)} MXN`} />
            <SummaryRow label="Pagado" value={`$${Number(success.amountUsdc).toFixed(2)} USDC`} />
            <SummaryRow label="Estado" value={failed ? "Falló" : "Confirmado"} />
            {success.txHash ? <SummaryRow label="Transacción" value={success.txHash} mono /> : null}
            {success.failureReason ? <SummaryRow label="Motivo" value={success.failureReason} /> : null}
          </div>
        </Card>

        <div className="flex w-full flex-col gap-3">
          <Link to={`/store/pay?category=${category}`}>
            <Button className="w-full">Hacer otro pago</Button>
          </Link>
          <Link to="/store/history">
            <Button variant="outline" className="w-full">
              Ver historial
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
      <Card className="w-full bg-white shadow-sm">
        <CompanyHeader company={company} caption="Vas a pagar a" />
      </Card>

      <StepIndicator step={step} />

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
      ) : (
        <div className="flex w-full flex-col items-center gap-6">
          <Card className="w-full divide-y divide-forest/8 bg-white px-5 shadow-sm">
            <SummaryRow label="Referencia" value={reference} />
            <SummaryRow label="Monto" value={`$${Number(amountMxn).toFixed(2)} MXN`} />
            <SummaryRow label="Equivalente" value={`≈ $${(amountUsd ?? 0).toFixed(2)} USDC`} />
          </Card>

          <form onSubmit={handleConfirm} className="flex w-full flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-ink-3">Ingresa tu PIN para confirmar</p>
              <PinInput value={pin} onChange={setPin} name="pin" disabled={isPending} />
            </div>

            {pinError ? <p className="text-sm text-red-600">{pinError}</p> : null}

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

function CompanyHeader({ company, caption }: { company: Company; caption: string }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cream-muted/60 p-2 ring-1 ring-forest/8">
        <img src={`/logos/${company.logoKey}.png`} alt={company.name} className="h-full w-full object-contain" />
      </div>
      <div>
        <p className="text-xs text-ink-4">{caption}</p>
        <p className="text-lg font-bold text-forest">{company.name}</p>
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "details", label: "Detalles" },
    { key: "confirm", label: "Confirmar" },
  ];
  const activeIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="flex w-full items-center">
      {steps.map((s, i) => {
        const isDone = i < activeIndex;
        const isActive = i === activeIndex;
        return (
          <div key={s.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${isDone ? "bg-forest text-cream" : isActive ? "bg-amber text-forest" : "bg-forest/10 text-forest/40"
                  }`}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${isActive ? "text-forest" : "text-forest/40"}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 ? <div className={`mx-3 h-px flex-1 ${isDone ? "bg-forest/40" : "bg-forest/10"}`} /> : null}
          </div>
        );
      })}
    </div>
  );
}

function StatusIcon({ failed }: { failed: boolean }) {
  return (
    <div className={`flex h-16 w-16 items-center justify-center rounded-full ${failed ? "bg-red-100" : "bg-forest/10"}`}>
      {failed ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-red-600"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-forest"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
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
