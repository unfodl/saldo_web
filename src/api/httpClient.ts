import { BLUTO_API_URL } from "./config";
import { handleUnauthorized, type AuthKind } from "../auth/session";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  // Which login session this call is authenticated with — used to redirect
  // to the matching login page on a 401. Omit for unauthenticated requests.
  authType?: AuthKind;
};

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractErrorMessage(rawBody: string): string {
  const parsed = safeJsonParse(rawBody) as { message?: unknown } | null;
  if (parsed && typeof parsed.message === "string") return parsed.message;
  return rawBody;
}

// JSON request helper for bluto endpoints that speak JSON both ways. bluto's
// create-token endpoint does not (its success body is a raw JWT string), so
// that one call is handled directly in authApi.ts instead of through this.
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
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
    if (response.status === 401 && authType) handleUnauthorized(authType);
    throw new ApiError(extractErrorMessage(rawBody) || `Request failed (${response.status})`, response.status);
  }

  return (rawBody ? safeJsonParse(rawBody) : null) as T;
}
