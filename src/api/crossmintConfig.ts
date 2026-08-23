// Client-side PUBLISHABLE Crossmint API key (ck_staging_.../ck_production_...)
// — safe to expose to the browser, unlike the sk_ secret key the old
// Next.js app used server-side. Set VITE_CROSSMINT_API_KEY — see .env.example.
export const CROSSMINT_API_KEY = import.meta.env.VITE_CROSSMINT_API_KEY ?? "";

// Crossmint hosts staging and production on separate domains; inferred from
// the key prefix, mirroring the old Next.js app's isStagingEnvironment().
export const CROSSMINT_API_BASE_URL = CROSSMINT_API_KEY.startsWith("ck_production_")
  ? "https://www.crossmint.com/api"
  : "https://staging.crossmint.com/api";
