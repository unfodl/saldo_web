"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { verifyPin } from "@/lib/auth/pin";
import { validatePin, validateReference, validateMxnAmount, validateAmount } from "@/lib/validation";
import { getUsdcBalance, sendUsdcPayment } from "@/lib/crossmint/client";
import { convertMxnToUsd } from "@/lib/exchangeRate";

/**
 * All payments currently settle to this single Stellar address rather than
 * each company's (placeholder, non-real) receivingAddress — see chat request
 * to route confirmed payments here directly.
 */
const FIXED_RECEIVING_ADDRESS = "GDNKY6A6ZCTRL3DEF65ERLOFHSVLIHF5BYPTOEDP5CE2RQ5R3PLQ2MMH";

export type PaymentState =
  | { status: "error"; error: string }
  | {
      status: "success";
      paymentId: string;
      companyName: string;
      reference: string;
      amountMxn: string;
      amountUsdc: string;
      paymentStatus: string;
      txHash?: string;
    }
  | undefined;

export async function submitPaymentAction(
  _prevState: PaymentState,
  formData: FormData,
): Promise<PaymentState> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const companyId = String(formData.get("companyId") ?? "");
  const reference = String(formData.get("reference") ?? "");
  const amountMxn = String(formData.get("amountMxn") ?? "");
  const pin = String(formData.get("pin") ?? "");

  const pinFormatCheck = validatePin(pin);
  if (!pinFormatCheck.ok) return { status: "error", error: pinFormatCheck.error };

  const referenceCheck = validateReference(reference);
  if (!referenceCheck.ok) return { status: "error", error: referenceCheck.error };

  const mxnCheck = validateMxnAmount(amountMxn);
  if (!mxnCheck.ok) return { status: "error", error: mxnCheck.error };

  const [operator, company, store] = await Promise.all([
    db.operator.findUnique({ where: { id: session.operatorId } }),
    db.company.findUnique({ where: { id: companyId } }),
    db.store.findUnique({ where: { id: session.storeId } }),
  ]);

  if (!operator || !company || !store) {
    return { status: "error", error: "No encontramos la información necesaria para procesar el pago." };
  }

  const pinValid = await verifyPin(pin, operator.pinHash);
  if (!pinValid) {
    return { status: "error", error: "PIN incorrecto." };
  }

  if (!store.crossmintWalletLocator) {
    return { status: "error", error: "Esta tienda todavía no tiene una billetera configurada." };
  }

  // Recompute the USD/USDC amount server-side — never trust a client-provided conversion.
  const usdAmount = await convertMxnToUsd(Number(amountMxn)).catch(() => null);
  if (usdAmount === null) {
    return { status: "error", error: "No pudimos obtener el tipo de cambio. Intenta de nuevo." };
  }
  const amountUsdc = usdAmount.toFixed(6);

  const balance = await getUsdcBalance(store.crossmintWalletLocator).catch(() => null);
  if (!balance) {
    return { status: "error", error: "No pudimos consultar el saldo disponible. Intenta de nuevo." };
  }

  const amountCheck = validateAmount(amountUsdc, Number(balance.amount));
  if (!amountCheck.ok) return { status: "error", error: amountCheck.error };

  const payment = await db.payment.create({
    data: {
      storeId: store.id,
      operatorId: operator.id,
      companyId: company.id,
      reference: reference.trim(),
      amountMxn,
      amountUsdc,
      status: "PENDING",
    },
  });

  let result;
  try {
    result = await sendUsdcPayment({
      walletLocator: store.crossmintWalletLocator,
      toAddress: FIXED_RECEIVING_ADDRESS,
      amountUsdc,
      memo: reference.trim(),
    });
  } catch (err) {
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        failureReason: err instanceof Error ? err.message : "Error desconocido",
      },
    });
    return { status: "error", error: "No pudimos procesar el pago. Intenta de nuevo." };
  }

  // wallet.send() only resolves once the transfer is confirmed on-chain.
  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: "CONFIRMED",
      crossmintTransactionId: result.transactionId,
      txHash: result.txHash,
    },
  });

  return {
    status: "success",
    paymentId: payment.id,
    companyName: company.name,
    reference: reference.trim(),
    amountMxn,
    amountUsdc,
    paymentStatus: "CONFIRMED",
    txHash: result.txHash,
  };
}
