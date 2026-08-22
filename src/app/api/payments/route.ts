import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { verifyPin } from "@/lib/auth/pin";
import { validatePin, validateReference, validateAmount } from "@/lib/validation";
import { getUsdcBalance, sendUsdcPayment } from "@/lib/crossmint/client";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const companyId = String(body?.companyId ?? "");
  const reference = String(body?.reference ?? "");
  const amount = String(body?.amount ?? "");
  const pin = String(body?.pin ?? "");

  const pinFormatCheck = validatePin(pin);
  if (!pinFormatCheck.ok) {
    return NextResponse.json({ error: pinFormatCheck.error }, { status: 400 });
  }

  const referenceCheck = validateReference(reference);
  if (!referenceCheck.ok) {
    return NextResponse.json({ error: referenceCheck.error }, { status: 400 });
  }

  const [operator, company, store] = await Promise.all([
    db.operator.findUnique({ where: { id: session.operatorId } }),
    db.company.findUnique({ where: { id: companyId } }),
    db.store.findUnique({ where: { id: session.storeId } }),
  ]);

  if (!operator || !company || !store) {
    return NextResponse.json(
      { error: "No encontramos la información necesaria para procesar el pago." },
      { status: 404 },
    );
  }

  const pinValid = await verifyPin(pin, operator.pinHash);
  if (!pinValid) {
    return NextResponse.json({ error: "PIN incorrecto." }, { status: 401 });
  }

  if (!store.crossmintWalletLocator) {
    return NextResponse.json(
      { error: "Esta tienda todavía no tiene una billetera configurada." },
      { status: 409 },
    );
  }

  const balance = await getUsdcBalance(store.crossmintWalletLocator).catch(() => null);
  if (!balance) {
    return NextResponse.json(
      { error: "No pudimos consultar el saldo disponible. Intenta de nuevo." },
      { status: 502 },
    );
  }

  const amountCheck = validateAmount(amount, Number(balance.amount));
  if (!amountCheck.ok) {
    return NextResponse.json({ error: amountCheck.error }, { status: 400 });
  }

  const payment = await db.payment.create({
    data: {
      storeId: store.id,
      operatorId: operator.id,
      companyId: company.id,
      reference: reference.trim(),
      amountUsdc: amount,
      status: "PENDING",
    },
  });

  let result;
  try {
    result = await sendUsdcPayment({
      walletLocator: store.crossmintWalletLocator,
      toAddress: company.receivingAddress,
      amountUsdc: amount,
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
    return NextResponse.json({ error: "No pudimos procesar el pago. Intenta de nuevo." }, { status: 502 });
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

  return NextResponse.json({
    paymentId: payment.id,
    companyName: company.name,
    reference: reference.trim(),
    amount,
    paymentStatus: "CONFIRMED",
    txHash: result.txHash,
  });
}
