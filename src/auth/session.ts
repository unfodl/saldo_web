export type AuthKind = "admin" | "user";

export const AUTH_STORAGE_KEYS: Record<AuthKind, string> = {
  admin: "saldo_admin_token",
  user: "saldo_user_token",
};

export const AUTH_LOGIN_PATHS: Record<AuthKind, string> = {
  admin: "/admin/login",
  user: "/login",
};

// Called by apiRequest when bluto answers with 401: the stored token is no
// longer valid (expired/revoked), so drop it and send the browser to the
// matching login page. A full navigation (not react-router) because this
// runs outside the component tree, in the fetch layer.
export function handleUnauthorized(kind: AuthKind) {
  sessionStorage.removeItem(AUTH_STORAGE_KEYS[kind]);
  const loginPath = AUTH_LOGIN_PATHS[kind];
  if (window.location.pathname !== loginPath) {
    window.location.assign(loginPath);
  }
}
