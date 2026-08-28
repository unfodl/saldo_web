import { useState, type FormEvent } from "react";
import { sendToken } from "../../api/walletApi";
import { ApiError } from "../../api/httpClient";
import { useUserAuth } from "../../auth/userAuth";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import type { SendUsdcResult } from "../../types/wallet";

export function SendUsdcForm({ onSuccess }: { onSuccess: (result: SendUsdcResult) => void }) {
  const { token, email } = useUserAuth();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token || !email) {
      setError("Tu sesión expiró. Vuelve a iniciar sesión.");
      return;
    }

    const trimmedAddress = toAddress.trim();
    const amountValue = Number(amount);
    if (!trimmedAddress) {
      setError("Ingresa la dirección de destino.");
      return;
    }
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError("Ingresa un monto válido.");
      return;
    }

    setIsPending(true);
    try {
      // Sent server-side via /transaction/send-token — see
      // src/api/walletApi.ts. NOTE: that endpoint takes only {email, amountUsdc},
      // no destination, so `trimmedAddress` above isn't actually sent
      // anywhere right now; this form still needs a real arbitrary-recipient
      // endpoint before it can do what its "Dirección de destino" field implies.
      const result = await sendToken({ email, amountUsdc: amount }, token);
      onSuccess({ txHash: result.txHash, status: result.status ?? "CONFIRMED" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No pudimos enviar el USDC. Intenta de nuevo.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextField
        label="Dirección de destino"
        name="toAddress"
        placeholder="Dirección de la billetera destino"
        required
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        disabled={isPending}
      />
      <TextField
        label="Monto (USDC)"
        name="amount"
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        placeholder="0.00"
        required
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={isPending}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Enviando…" : "Enviar"}
      </Button>
    </form>
  );
}
