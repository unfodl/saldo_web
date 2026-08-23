import { CROSSMINT_API_BASE_URL, CROSSMINT_API_KEY } from "./crossmintConfig";
import { ApiError } from "./httpClient";
import type { UsdcBalance } from "../types/wallet";

// Calls Crossmint's wallet-balances REST endpoint directly from the browser
// with a publishable API key (no bluto round-trip — balance is read straight
// from Crossmint, unlike wallet address/chain which still come from bluto).
// Assumes `chain` is already a Crossmint chain slug (e.g. "base", "polygon",
// "stellar") as returned by bluto's wallet-details call; confirm and fix here
// if bluto returns a display name instead.
//
// Confirmed against a real response (2026-08): the body is a plain array of
// token balance objects — [{ symbol, name, decimals, amount, rawAmount,
// chains }, ...] — not the { usdc, tokens } shape the docs' React SDK example
// implies (that shape is what wallet.balances() returns client-side after
// the SDK reshapes this same array; the raw REST endpoint doesn't).
export async function fetchUsdcBalance(address: string, chain: string): Promise<UsdcBalance> {
  const url = `${CROSSMINT_API_BASE_URL}/2025-06-09/wallets/${encodeURIComponent(address)}/balances?tokens=usdc&chains=${encodeURIComponent(chain)}`;

  const response = await fetch(url, {
    headers: { "X-API-KEY": CROSSMINT_API_KEY },
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new ApiError(`No pudimos obtener el saldo de Crossmint (${response.status}).`, response.status);
  }

  const body = rawBody ? JSON.parse(rawBody) : null;
  const balances = Array.isArray(body) ? body : (body?.tokens ?? (body?.usdc ? [body.usdc] : []));
  const usdc = balances.find((t: { symbol?: string }) => t?.symbol?.toLowerCase() === "usdc");
  return { amount: usdc?.amount ?? "0" };
}
