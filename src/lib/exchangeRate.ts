import { ENDPOINTS } from "../api/config";
import { apiRequest } from "../api/httpClient";

// Converts a MXN amount to its USDC equivalent. Calling saldo.mx's exchange
// endpoint directly from the browser is blocked by CORS (confirmed: it
// sends no Access-Control-Allow-Origin header), the same reason sendToken
// proxies Crossmint through bluto instead of calling it client-side — see
// api/walletApi.ts. So this goes through a bluto endpoint that (per the old
// Next.js app's server-side route) calls saldo.mx's own
// /Saldos/api/ripplev3/exchangeUSD/{mxn} and forwards its `USD` field.
//
// Confirmed shape: bluto's /transaction/exchange-rate returns
// `{ statusCode, message, data: { result, MXN, USD, EU } }`, with USD as a
// numeric string. That `USD` field is actually the USDC amount the wallet
// gets charged, not a separate USD value — treat it as such.
export async function convertMxnToUsdc(mxnAmount: number, token: string): Promise<number> {
  const response = await apiRequest<{ data?: { USD?: string | number } } | null>(
    `${ENDPOINTS.exchangeRate}?mxnAmount=${encodeURIComponent(mxnAmount)}`,
    { method: "GET", token, authType: "user" },
  );
  const usdc = Number(response?.data?.USD);
  if (!Number.isFinite(usdc)) {
    throw new Error("Unexpected exchange rate response");
  }
  return usdc;
}
