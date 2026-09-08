import { BLUTO_API_URL, ENDPOINTS } from "./config";
import {
  getStoredRefreshToken,
  handleUnauthorized,
  storeRefreshedTokens,
  type AuthKind,
} from "../auth/session";

export class ApiError extends Error {
  status: number;
  // bluto's 401 body carries a `code` (TOKEN_EXPIRED, INVALID_TOKEN, ...) —
  // see REFRESH_TOKEN.md. Only set when the server actually sent one.
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  // Which login session this call is authenticated with — used to redirect
  // to the matching login page on a 401, and to decide whether a
  // TOKEN_EXPIRED can be silently refreshed (only "user" sessions have a
  // refresh token; see REFRESH_TOKEN.md). Omit for unauthenticated requests.
  authType?: AuthKind;
};

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function parseErrorBody(rawBody: string): { message: string; code?: string } {
  const parsed = safeJsonParse(rawBody) as { message?: unknown; code?: unknown } | null;
  const message = parsed && typeof parsed.message === "string" ? parsed.message : rawBody;
  const code = parsed && typeof parsed.code === "string" ? parsed.code : undefined;
  return { message, code };
}

// Refresh calls are deduped behind a single in-flight promise per AuthKind —
// otherwise several requests hitting TOKEN_EXPIRED at once would each kick
// off their own refresh, racing bluto's refresh-token rotation and
// invalidating each other's result. See REFRESH_TOKEN.md.
const refreshPromises: Partial<Record<AuthKind, Promise<string>>> = {};

async function refreshAccessToken(kind: AuthKind): Promise<string> {
  const inFlight = refreshPromises[kind];
  if (inFlight) return inFlight;

  const promise = (async () => {
    const refreshToken = getStoredRefreshToken(kind);
    if (!refreshToken) {
      throw new ApiError("No hay token de actualización disponible.", 401, "REFRESH_TOKEN_REQUIRED");
    }

    const response = await fetch(`${BLUTO_API_URL}${ENDPOINTS.refreshToken}`, {
      method: "POST",
      headers: { "X-Refresh-Token": refreshToken },
    });
    const rawBody = (await response.text()).trim();

    if (!response.ok) {
      const { message, code } = parseErrorBody(rawBody);
      throw new ApiError(message || `Refresh failed (${response.status})`, response.status, code);
    }
    if (!rawBody) {
      throw new ApiError("El servidor no devolvió un token.", response.status);
    }

    const newAccessToken = rawBody;
    const newRefreshToken = response.headers.get("X-Refresh-Token");
    storeRefreshedTokens(kind, newAccessToken, newRefreshToken);
    return newAccessToken;
  })();

  refreshPromises[kind] = promise;
  try {
    return await promise;
  } finally {
    delete refreshPromises[kind];
  }
}

// JSON request helper for bluto endpoints that speak JSON both ways. bluto's
// create-token endpoint does not (its success body is a raw JWT string), so
// that one call is handled directly in authApi.ts instead of through this.
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return doRequest<T>(path, options, false);
}

async function doRequest<T>(path: string, options: RequestOptions, isRetry: boolean): Promise<T> {
  const { method = "GET", body, token, authType } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  // Applies uniformly to both admin and user authenticated requests.
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BLUTO_API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const rawBody = (await response.text()).trim();

  if (!response.ok) {
    const { message, code } = parseErrorBody(rawBody);

    // A user session's access token expiring mid-use is recoverable: refresh
    // it once and retry the original request. `!isRetry` stops an infinite
    // loop if the refreshed token somehow still comes back expired. Admin
    // sessions and any other 401 code go straight to a forced logout.
    if (response.status === 401 && authType === "user" && code === "TOKEN_EXPIRED" && !isRetry) {
      try {
        const newToken = await refreshAccessToken(authType);
        return doRequest<T>(path, { ...options, token: newToken }, true);
      } catch {
        handleUnauthorized(authType);
        throw new ApiError("Tu sesión expiró. Vuelve a iniciar sesión.", 401, "REFRESH_TOKEN_INVALID");
      }
    }

    if (response.status === 401 && authType) handleUnauthorized(authType);
    throw new ApiError(message || `Request failed (${response.status})`, response.status, code);
  }

  return (rawBody ? safeJsonParse(rawBody) : null) as T;
}
