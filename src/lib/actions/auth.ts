"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { fetchJwt } from "@/lib/auth/bluto";
import { createSession, destroySession } from "@/lib/auth/session";

export type LoginState = { error: string } | undefined;

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    return { error: "Ingresa tu correo." };
  }

  try {
    // Proves the operator controls this inbox via Saldo's existing auth
    // service. The resulting JWT isn't forwarded anywhere — store wallets
    // are signed by a server-side API key, not a per-operator signer.
    await fetchJwt(email);
  } catch {
    return { error: "No pudimos verificar tu correo. Intenta de nuevo." };
  }

  const operator = await db.operator.findUnique({ where: { email } });
  if (!operator) {
    return { error: "Ese correo no está registrado en ninguna tienda. Contacta a un administrador." };
  }

  await createSession({
    operatorId: operator.id,
    storeId: operator.storeId,
    email: operator.email,
    role: operator.role,
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
