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

/**
 * User login: exchanges an email + PIN for a signed JWT. Confirmed against
 * the existing saldo_web app — on success the body is the raw JWT string,
 * not wrapped in JSON.
 */
export async function loginUser(emailAddress: string, pin: string): Promise<string> {
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

  return body;
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
