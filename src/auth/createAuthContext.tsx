import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { AUTH_STORAGE_KEYS, type AuthKind } from "./session";

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

// sessionStorage, not localStorage: it's cleared when the tab closes, which
// limits how long a stolen token stays valid if the app is ever compromised
// by XSS. A same-origin httpOnly cookie would be stronger, but this SPA talks
// to bluto directly (a different origin) — the browser is the only place
// that can hold the token, so this is the safest practical option available.
export function createAuthContext(kind: AuthKind) {
  const storageKey = AUTH_STORAGE_KEYS[kind];
  const Context = createContext<AuthContextValue | null>(null);

  function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(storageKey));

    const value = useMemo<AuthContextValue>(
      () => ({
        token,
        isAuthenticated: token !== null,
        login: (newToken: string) => {
          sessionStorage.setItem(storageKey, newToken);
          setToken(newToken);
        },
        logout: () => {
          sessionStorage.removeItem(storageKey);
          setToken(null);
        },
      }),
      [token],
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
