import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../../api/authApi";
import { useUserAuth } from "../../auth/userAuth";
import { useSaldoWallet } from "../../hooks/useSaldoWallet";
import { sendUsdcPayment } from "../../lib/crossmint/client";
import { addPayment } from "../../lib/paymentHistory";
import { validateAmount, validatePin, validateReference } from "../../lib/validation";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { PinInput } from "../../components/PinInput";
import { TextField } from "../../components/TextField";
import type { Company, CompanyCategory, PaymentRecord } from "../../types/payment";

type Step = "details" | "confirm";

type SuccessState = {
  reference: string;
  amount: string;
  status: PaymentRecord["status"];
  txHash?: string;
};

export function PaymentPanel({ company, category }: { company: Company; category: CompanyCategory }) {
  const { token, email } = useUserAuth();
  const { wallet, balance, refresh } = useSaldoWallet(token, email);
  const availableBalance = Number(balance?.amount ?? 0);

  const [step, setStep] = useState<Step>("details");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  function handleDetailsSubmit(e: FormEvent) {
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
    let txHash: string | undefined;
    let status: PaymentRecord["status"] = "CONFIRMED";
    let failureReason: string | undefined;
    try {
      // Sent straight through Crossmint's wallet.send(), not bluto — bluto's
      // /wallet/send was an unverified guess at an endpoint it may not even
      // implement; this talks to the wallet directly.
      const result = await sendUsdcPayment({
        walletAddress: wallet.address,
        toAddress: company.receivingAddress,
        amountUsdc: amount,
      });
      txHash = result.txHash;
    } catch (err) {
      status = "FAILED";
      failureReason = err instanceof Error ? err.message : "Error desconocido";
    }

    addPayment(email, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: company.id,
      companyName: company.name,
      companyLogoKey: company.logoKey,
      reference: trimmedReference,
      amount,
      status,
      txHash,
      failureReason,
      createdAt: new Date().toISOString(),
    });
    refresh();

    setIsPending(false);
    setSuccess({ reference: trimmedReference, amount, status, txHash });
  }

  const logo = <img src={`/logos/${company.logoKey}.png`} alt={company.name} className="w-2/5 rounded-2xl object-cover" />;

  if (success) {
    const failed = success.status === "FAILED";
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
        {logo}
        <h1 className="text-xl font-bold text-forest">{failed ? "El pago no se pudo completar" : "¡Pago enviado!"}</h1>
        <Card className="w-full divide-y divide-forest/8 bg-white px-5 text-left">
          <SummaryRow label="Proveedor" value={company.name} />
          <SummaryRow label="Referencia" value={success.reference} />
          <SummaryRow label="Monto" value={`$${Number(success.amount).toFixed(2)} USDC`} />
          <SummaryRow label="Estado" value={failed ? "Falló" : "Confirmado"} />
          {success.txHash ? <SummaryRow label="Transacción" value={success.txHash} mono /> : null}
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
      {logo}
      <h1 className="text-xl font-bold text-forest">{company.name}</h1>

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

          <form onSubmit={handleConfirm} className="flex w-full flex-col items-center gap-6">
            <PinInput value={pin} onChange={setPin} name="pin" disabled={isPending} />

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

function SummaryRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-ink-3">{label}</span>
      <span className={`font-medium text-forest ${mono ? "truncate pl-4 font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
