export function crossmintApiKey(): string {
  const key = process.env.CROSSMINT_API_KEY;
  if (!key) {
    throw new Error("CROSSMINT_API_KEY is not set");
  }
  return key;
}

export function crossmintSignerSecret(): string {
  const secret = process.env.CROSSMINT_SIGNER_SECRET;
  if (!secret) {
    throw new Error("CROSSMINT_SIGNER_SECRET is not set");
  }
  return secret;
}

/** Crossmint API keys are prefixed by environment (sk_staging_... / sk_production_...). */
export function isStagingEnvironment(): boolean {
  return crossmintApiKey().startsWith("sk_staging_");
}

/**
 * Reference field cap. Not currently embedded on-chain (see note in
 * crossmint/client.ts), but kept as a sane UI limit and forward-compatible
 * with Stellar's 28-char `text` memo limit if we add memo support later.
 */
export const STELLAR_MEMO_MAX_LENGTH = 28;
