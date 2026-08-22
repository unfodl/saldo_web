import { NextResponse } from "next/server";
import { loginWithPassword } from "@/lib/auth/bluto";
import { createAdminSession } from "@/lib/auth/admin-session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Ingresa tu correo y contraseña." }, { status: 400 });
  }

  let blutoAccessToken: string;
  try {
    blutoAccessToken = await loginWithPassword(email, password);
  } catch (err) {
    console.error("bluto admin login failed", err);
    return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
  }

  await createAdminSession({ email, blutoAccessToken });
  return NextResponse.json({ ok: true });
}
