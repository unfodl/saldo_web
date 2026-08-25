import { ENDPOINTS } from "./config";
import { apiRequest } from "./httpClient";
import type { SendTokenPayload, SendUsdcResult, WalletDetails } from "../types/wallet";

// TODO: UNVERIFIED — see ENDPOINTS.walletDetails in ./config for context.
export async function fetchWalletDetails(email: string, token: string): Promise<WalletDetails> {
  const response = await apiRequest<{ data?: WalletDetails } | WalletDetails>(
    `${ENDPOINTS.walletDetails}?emailAddress=${encodeURIComponent(email)}`,
    { method: "GET", token, authType: "user" },
  );
  return (response as { data?: WalletDetails })?.data ?? (response as WalletDetails);
}

// Sends USDC server-side — the backend holds the Crossmint credentials and
// does the actual wallet.send(), so the browser never needs a secret key.
export async function sendToken(payload: SendTokenPayload, token: string): Promise<SendUsdcResult> {
  const response = await apiRequest<{ data?: SendUsdcResult } | SendUsdcResult | null>(ENDPOINTS.sendToken, {
    method: "POST",
    body: payload,
    token,
    authType: "user",
  });
  if (!response) return {};
  return (response as { data?: SendUsdcResult }).data ?? (response as SendUsdcResult);
}
