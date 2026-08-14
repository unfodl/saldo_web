import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "saldo_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h shift

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  operatorId: string;
  storeId: string;
  email: string;
  role: "OPERATOR" | "MANAGER";
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const { operatorId, storeId, email, role } = payload as Record<string, unknown>;
    if (
      typeof operatorId !== "string" ||
      typeof storeId !== "string" ||
      typeof email !== "string" ||
      (role !== "OPERATOR" && role !== "MANAGER")
    ) {
      return null;
    }
    return { operatorId, storeId, email, role };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function verifySessionCookie(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const { operatorId, storeId, email, role } = payload as Record<string, unknown>;
    if (
      typeof operatorId !== "string" ||
      typeof storeId !== "string" ||
      typeof email !== "string" ||
      (role !== "OPERATOR" && role !== "MANAGER")
    ) {
      return null;
    }
    return { operatorId, storeId, email, role };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
