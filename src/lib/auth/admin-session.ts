import { cookies } from "next/headers";
import { signSessionToken, verifySessionToken } from "./jwt-cookie";

const ADMIN_SESSION_COOKIE = "saldo_admin_session";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h shift

export type AdminSessionPayload = {
  email: string;
  blutoAccessToken: string;
};

export async function createAdminSession(payload: AdminSessionPayload) {
  const token = await signSessionToken({ ...payload }, ADMIN_SESSION_TTL_SECONDS);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminSessionCookie(token);
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function verifyAdminSessionCookie(token: string): Promise<AdminSessionPayload | null> {
  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const { email, blutoAccessToken } = payload as Record<string, unknown>;
  if (typeof email !== "string" || typeof blutoAccessToken !== "string") return null;
  return { email, blutoAccessToken };
}

export const ADMIN_SESSION_COOKIE_NAME = ADMIN_SESSION_COOKIE;
