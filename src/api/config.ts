// Base URL of bluto, the same backend saldo_web's Next.js app talks to.
// Set VITE_BLUTO_API_URL in .env.local (dev) / .env.production (prod) — see
// .env.example. vite.config.ts refuses to run a production build unless this
// is set to a non-localhost URL.
export const BLUTO_API_URL = (import.meta.env.VITE_BLUTO_API_URL ?? "http://localhost:8081/native/api").replace(
  /\/+$/,
  "",
);

// Endpoints confirmed against the existing saldo_web app / its bluto server logs.
export const CONFIRMED_ENDPOINTS = {
  userLogin: "/auth/create-token",
  adminLogin: "/auth/admin/login",
  userList: "/user/list",
  // Sends USDC server-side — added on the backend to replace the client-side
  // Crossmint wallets-sdk approach (blocked by the SDK's own signer
  // restrictions in a browser; see git history of src/lib/crossmint/client.ts).
  sendToken: "/transaction/send-token",
  transactionList: "/transaction/list",
  // Returns the wallet's USDC balance as a plain numeric string in `data`
  // (e.g. `{ data: "25.4" }`) — replaces the earlier client-side Crossmint
  // balances call now that bluto exposes this directly.
  walletBalance: "/wallet/balance",
};

// TODO: UNVERIFIED — bluto doesn't document a create-user endpoint anywhere we
// have access to. This guesses a REST-standard path/shape; confirm against the
// real backend and fix here (this is the only place it's referenced).
export const UNVERIFIED_ENDPOINTS = {
  createUser: "/user/create",
  userDetails: "/user/details",
  updateUser: "/user/update",
  deleteUser: "/user/delete",
  // Guessed to mirror adminLogin's /auth/admin/login path; confirm against
  // the real backend and fix here if the path or response shape differs.
  adminDetails: "/auth/admin/details",
  // Guessed wallet endpoint — bluto doesn't document a wallet API anywhere
  // we have access to. Confirm against the real backend and fix here.
  walletDetails: "/wallet/details",
  // Guessed MXN-to-USD exchange-rate proxy — see src/lib/exchangeRate.ts for
  // why this needs to go through bluto rather than saldo.mx directly.
  exchangeRate: "/transaction/exchange-rate",
};

export const ENDPOINTS = { ...CONFIRMED_ENDPOINTS, ...UNVERIFIED_ENDPOINTS };
