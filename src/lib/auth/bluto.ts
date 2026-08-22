import { getAdminSession } from "./admin-session";

const DEV_BLUTO_API_URL = "http://localhost:8081/native/api";

function getBlutoBaseUrl(): string {
  const configured = process.env.BLUTO_API_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  if (process.env.NODE_ENV === "production") {
    throw new Error("BLUTO_API_URL is not set");
  }
  return DEV_BLUTO_API_URL;
}

// Mirrors getBlutoBaseUrl()'s "throw if missing" shape, but reads the token
// bluto issued at admin login (saved in the signed saldo_admin_session
// cookie) instead of a static env var.
async function getAdminAccessToken(): Promise<string> {
  const session = await getAdminSession();
  if (!session?.blutoAccessToken) {
    throw new Error("Admin access token is not set — log in again.");
  }
  return session.blutoAccessToken;
}

// bluto's failure responses are a JSON CustomError body (e.g. {"message": "..."}),
// not plain text — extract its message, falling back to the raw body.
function extractErrorMessage(body: string): string {
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed.message === "string") return parsed.message;
  } catch {
    // not JSON — fall through to the raw body
  }
  return body;
}

/**
 * Exchanges an email for a signed JWT from Saldo's own auth service (bluto).
 * Port of the Android app's TokenService.kt — this only proves the caller
 * controls the inbox. It is intentionally not forwarded to Crossmint: store
 * wallets here are signed by a server-side API key, not a per-operator signer.
 */
export async function fetchJwt(email: string): Promise<string> {
  const response = await fetch(`${getBlutoBaseUrl()}/auth/create-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailAddress: email }),
  });

  const body = (await response.text()).trim();

  if (!response.ok) {
    throw new Error(extractErrorMessage(body) || `Auth request failed (${response.status})`);
  }

  // On success the body is the raw JWT string (not wrapped in JSON).
  if (!body) {
    throw new Error("Auth request returned an empty token");
  }

  return body;
}

/**
 * Verifies an email/password pair against bluto's admin login endpoint and
 * returns the access token bluto issues, so it can be saved in this app's own
 * admin session and reused as the Authorization header on later admin calls
 * (e.g. listUsers below).
 */
export async function loginWithPassword(email: string, password: string): Promise<string> {
  const response = await fetch(`${getBlutoBaseUrl()}/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailAddress: email, password }),
  });

  const body = (await response.text()).trim();

  if (!response.ok) {
    throw new Error(extractErrorMessage(body) || `Login request failed (${response.status})`);
  }

  const parsed = body ? JSON.parse(body) : null;
  const token = parsed?.token;
  if (typeof token !== "string" || !token) {
    throw new Error("Login succeeded but bluto did not return an access token.");
  }

  return token;
}

export type BlutoUser = {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
};

/**
 * Fetches the operator/user list from bluto instead of our own Postgres data —
 * bluto is the source of truth for who exists, this app only owns store
 * assignment and payment history. Authenticates with the current admin's own
 * access token (saved at login), not a separate service credential.
 */
export async function listUsers(): Promise<BlutoUser[]> {
  const response = await fetch(`${getBlutoBaseUrl()}/user/list`, {
    method: "GET",
    headers: { Authorization: `Bearer ${await getAdminAccessToken()}` },
  });

  const body = (await response.text()).trim();

  if (!response.ok) {
    throw new Error(extractErrorMessage(body) || `User list request failed (${response.status})`);
  }

  const parsed = body ? JSON.parse(body) : { users: [] };
  return Array.isArray(parsed?.users) ? parsed.users : [];
}
