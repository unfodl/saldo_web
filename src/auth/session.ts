export type AuthKind = "admin" | "user";

export const AUTH_STORAGE_KEYS: Record<AuthKind, string> = {
  admin: "saldo_admin_token",
  user: "saldo_user_token",
};

// Only the user auth flow (bluto's /auth/create-token) issues a refresh
// token — see REFRESH_TOKEN.md. The admin key exists for symmetry but is
// never written to.
export const AUTH_REFRESH_STORAGE_KEYS: Record<AuthKind, string> = {
  admin: "saldo_admin_refresh_token",
  user: "saldo_user_refresh_token",
};

export const AUTH_EMAIL_STORAGE_KEYS: Record<AuthKind, string> = {
  admin: "saldo_admin_email",
  user: "saldo_user_email",
};

export const AUTH_LOGIN_PATHS: Record<AuthKind, string> = {
  admin: "/admin/login",
  user: "/login",
};

export function getStoredRefreshToken(kind: AuthKind): string | null {
  return sessionStorage.getItem(AUTH_REFRESH_STORAGE_KEYS[kind]);
}

// Called after a successful silent refresh (see httpClient.ts). Only updates
// storage — the access token that's mid-request retries with the new value
// directly, and any component still holding the old one from React state
// self-heals on its next call (that 401 triggers exactly one more refresh,
// reading whatever's newest here).
export function storeRefreshedTokens(kind: AuthKind, accessToken: string, refreshToken: string | null) {
  sessionStorage.setItem(AUTH_STORAGE_KEYS[kind], accessToken);
  if (refreshToken) sessionStorage.setItem(AUTH_REFRESH_STORAGE_KEYS[kind], refreshToken);
}

// Called by apiRequest when bluto answers with 401 and either there's no
// refresh token to try or the refresh itself failed: the session is over, so
// drop everything and send the browser to the matching login page. A full
// navigation (not react-router) because this runs outside the component
// tree, in the fetch layer.
export function handleUnauthorized(kind: AuthKind) {
  sessionStorage.removeItem(AUTH_STORAGE_KEYS[kind]);
  sessionStorage.removeItem(AUTH_REFRESH_STORAGE_KEYS[kind]);
  const loginPath = AUTH_LOGIN_PATHS[kind];
  if (window.location.pathname !== loginPath) {
    window.location.assign(loginPath);
  }
}
