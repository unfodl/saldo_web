import { BLUTO_API_URL, ENDPOINTS } from "./config";
import { ApiError } from "./httpClient";

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// bluto's failure responses are a JSON body (e.g. {"message": "..."}), not
// plain text — extract its message, falling back to the raw body.
function extractErrorMessage(rawBody: string): string {
  const parsed = safeJsonParse(rawBody) as { message?: unknown } | null;
  if (parsed && typeof parsed.message === "string") return parsed.message;
  return rawBody;
}

export type LoginResult = {
  accessToken: string;
  // null when bluto doesn't send one — e.g. the re-verification login inside
  // PaymentPanel's PIN confirm step still works, it just can't be silently
  // refreshed later (that call's result is discarded anyway).
  refreshToken: string | null;
  // Access token lifetime in seconds, from X-Token-Expires-In. Not currently
  // used (the app only refreshes reactively on a 401), but available for a
  // future proactive-refresh optimization — see REFRESH_TOKEN.md.
  expiresIn: number | null;
};

/**
 * User login: exchanges an email + PIN for a signed JWT. Confirmed against
 * the existing saldo_web app — on success the body is the raw JWT string,
 * not wrapped in JSON. The refresh token and the access token's lifetime
 * travel on response headers instead (X-Refresh-Token / X-Token-Expires-In):
 * create-token's body has to stay a bare JWT string for Crossmint's BYOA
 * integration, which reads it as plain text — see REFRESH_TOKEN.md.
 */
export async function loginUser(emailAddress: string, pin: string): Promise<LoginResult> {
  const response = await fetch(`${BLUTO_API_URL}${ENDPOINTS.userLogin}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailAddress, pin }),
  });

  const body = (await response.text()).trim();

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(body) || `Login request failed (${response.status})`, response.status);
  }
  if (!body) {
    throw new ApiError("El servidor no devolvió un token.", response.status);
  }

  const refreshToken = response.headers.get("X-Refresh-Token");
  const expiresInHeader = response.headers.get("X-Token-Expires-In");
  const expiresIn = expiresInHeader !== null ? Number(expiresInHeader) : null;

  return {
    accessToken: body,
    refreshToken,
    expiresIn: expiresIn !== null && Number.isFinite(expiresIn) ? expiresIn : null,
  };
}

/**
 * Admin login: email + password against bluto's shared admin credentials.
 *
 * TODO: UNVERIFIED — the existing saldo_web Next.js app never reads this
 * response body; it only checks `response.ok` and mints its own session,
 * because bluto's JWT there comes back as a cookie on bluto's own domain
 * (unusable cross-origin by a plain SPA). This function assumes bluto ALSO
 * returns `{ token: "..." }` in the JSON body so the browser has something to
 * store and send as a bearer token. If bluto only sets that cookie, this will
 * throw "no access token" on an otherwise-successful login — confirm the real
 * response shape against bluto and fix here.
 */
export async function loginAdmin(emailAddress: string, password: string): Promise<string> {
  const response = await fetch(`${BLUTO_API_URL}${ENDPOINTS.adminLogin}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailAddress, password }),
  });

  const body = (await response.text()).trim();

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(body) || `Login request failed (${response.status})`, response.status);
  }

  const parsed = safeJsonParse(body) as { token?: unknown } | null;
  const token = parsed?.token;
  if (typeof token !== "string" || !token) {
    throw new ApiError("El servidor no devolvió un token de acceso.", response.status);
  }

  return token;
}
