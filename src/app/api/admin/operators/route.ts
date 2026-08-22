import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/admin-session";
import { hashPin } from "@/lib/auth/pin";
import { listUsers } from "@/lib/auth/bluto";
import { validateFirstName, validateLastName, validatePhone, validatePin } from "@/lib/validation";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const users = await listUsers();
    return NextResponse.json({ users });
  } catch (err) {
    console.error("bluto user list request failed", err);
    return NextResponse.json({ error: "No pudimos obtener la lista de usuarios." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const firstName = String(body?.firstName ?? "").trim();
  const lastName = String(body?.lastName ?? "").trim();
  const phoneNumber = String(body?.phoneNumber ?? "").trim();
  const emailAddress = String(body?.emailAddress ?? "")
    .trim()
    .toLowerCase();
  const pin = String(body?.pin ?? "");

  const firstNameCheck = validateFirstName(firstName);
  if (!firstNameCheck.ok) {
    return NextResponse.json({ error: firstNameCheck.error }, { status: 400 });
  }

  const lastNameCheck = validateLastName(lastName);
  if (!lastNameCheck.ok) {
    return NextResponse.json({ error: lastNameCheck.error }, { status: 400 });
  }

  const phoneCheck = validatePhone(phoneNumber);
  if (!phoneCheck.ok) {
    return NextResponse.json({ error: phoneCheck.error }, { status: 400 });
  }

  if (!emailAddress || !emailAddress.includes("@")) {
    return NextResponse.json({ error: "Ingresa un correo válido." }, { status: 400 });
  }

  const pinCheck = validatePin(pin);
  if (!pinCheck.ok) {
    return NextResponse.json({ error: pinCheck.error }, { status: 400 });
  }

  const store = await db.store.findFirst();
  if (!store) {
    return NextResponse.json({ error: "No hay ninguna tienda configurada todavía." }, { status: 409 });
  }

  try {
    const operator = await db.operator.create({
      data: {
        firstName,
        lastName,
        phone: phoneNumber,
        email: emailAddress,
        pinHash: await hashPin(pin),
        storeId: store.id,
      },
    });
    return NextResponse.json({ id: operator.id });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un usuario con ese correo." }, { status: 409 });
    }
    console.error("create operator failed", err);
    return NextResponse.json({ error: "No pudimos crear el usuario. Intenta de nuevo." }, { status: 500 });
  }
}
