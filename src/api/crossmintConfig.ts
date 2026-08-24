// Client-side PUBLISHABLE Crossmint API key (ck_staging_.../ck_production_...)
// — safe to expose to the browser, unlike the sk_ secret key the old
// Next.js app used server-side. Set VITE_CROSSMINT_API_KEY — see .env.example.
export const CROSSMINT_API_KEY = import.meta.env.VITE_CROSSMINT_API_KEY ?? "";

// Crossmint hosts staging and production on separate domains; inferred from
// the key prefix, mirroring the old Next.js app's isStagingEnvironment().
export const CROSSMINT_API_BASE_URL = CROSSMINT_API_KEY.startsWith("ck_production_")
  ? "https://www.crossmint.com/api"
  : "https://staging.crossmint.com/api";

// ⚠️ SECRET, shipped to the browser on purpose (explicit product decision —
// see src/lib/crossmint/client.ts). The old Next.js app kept this server-side
// only; this app has no server, so wallet.send() has to run client-side and
// this secret ends up in the public JS bundle. Anyone can extract it from dev
// tools and use it to move funds out of the wallet it recovers. Only okay for
// a locked-down internal/staging tool with a low-value wallet — do not reuse
// this pattern for a real user-facing product without a server in between.
// Set VITE_CROSSMINT_SIGNER_SECRET — see .env.example.
export const CROSSMINT_SIGNER_SECRET = import.meta.env.VITE_CROSSMINT_SIGNER_SECRET ?? "";
