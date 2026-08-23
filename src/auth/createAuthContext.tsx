import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { AUTH_EMAIL_STORAGE_KEYS, AUTH_STORAGE_KEYS, type AuthKind } from "./session";

type AuthContextValue = {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  login: (token: string, email: string) => void;
  logout: () => void;
};

// sessionStorage, not localStorage: it's cleared when the tab closes, which
// limits how long a stolen token stays valid if the app is ever compromised
// by XSS. A same-origin httpOnly cookie would be stronger, but this SPA talks
// to bluto directly (a different origin) — the browser is the only place
// that can hold the token, so this is the safest practical option available.
export function createAuthContext(kind: AuthKind) {
  const storageKey = AUTH_STORAGE_KEYS[kind];
  const emailStorageKey = AUTH_EMAIL_STORAGE_KEYS[kind];
  const Context = createContext<AuthContextValue | null>(null);

  function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(storageKey));
    const [email, setEmail] = useState<string | null>(() => sessionStorage.getItem(emailStorageKey));

    const value = useMemo<AuthContextValue>(
      () => ({
        token,
        email,
        isAuthenticated: token !== null,
        login: (newToken: string, newEmail: string) => {
          sessionStorage.setItem(storageKey, newToken);
          sessionStorage.setItem(emailStorageKey, newEmail);
          setToken(newToken);
          setEmail(newEmail);
        },
        logout: () => {
          sessionStorage.removeItem(storageKey);
          sessionStorage.removeItem(emailStorageKey);
          setToken(null);
          setEmail(null);
        },
      }),
      [token, email],
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useAuth(): AuthContextValue {
    const ctx = useContext(Context);
    if (!ctx) {
      throw new Error("useAuth must be used within its matching AuthProvider");
    }
    return ctx;
  }

  return { AuthProvider, useAuth };
}
