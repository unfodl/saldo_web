const CREATE_TOKEN_URL = "https://bluto-oqj1.onrender.com/native/api/auth/create-token";

/**
 * Exchanges an email for a signed JWT from Saldo's own auth service (bluto).
 * Port of the Android app's TokenService.kt — this only proves the caller
 * controls the inbox. It is intentionally not forwarded to Crossmint: store
 * wallets here are signed by a server-side API key, not a per-operator signer.
 */
export async function fetchJwt(email: string): Promise<string> {
  const response = await fetch(CREATE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailAddress: email }),
  });

  const body = (await response.text()).trim();

  if (!response.ok) {
    throw new Error(body || `Auth request failed (${response.status})`);
  }

  return body;
}
