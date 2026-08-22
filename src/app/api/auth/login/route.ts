import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchJwt } from "@/lib/auth/bluto";
import { createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Ingresa tu correo." }, { status: 400 });
  }

  try {
    // Proves the operator controls this inbox via Saldo's existing auth
    // service. The resulting JWT isn't forwarded anywhere — store wallets
    // are signed by a server-side API key, not a per-operator signer.
    await fetchJwt(email);
  } catch (err) {
    console.error("bluto create-token request failed", err);
    return NextResponse.json(
      { error: "No pudimos verificar tu correo. Intenta de nuevo." },
      { status: 401 },
    );
  }

  const operator = await db.operator.findUnique({ where: { email } });
  if (!operator) {
    return NextResponse.json(
      { error: "Ese correo no está registrado en ninguna tienda. Contacta a un administrador." },
      { status: 404 },
    );
  }

  await createSession({
    operatorId: operator.id,
    storeId: operator.storeId,
    email: operator.email,
    role: operator.role,
  });

  return NextResponse.json({ ok: true });
}
