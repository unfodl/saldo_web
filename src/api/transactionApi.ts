import { ENDPOINTS } from "./config";
import { apiRequest } from "./httpClient";
import type { Transaction } from "../types/transaction";

// Sends the user's email in the body, same as sendToken — bluto identifies
// the requester by email rather than deriving it from the auth token.
export async function fetchTransactions(email: string, token: string): Promise<Transaction[]> {
  const response = await apiRequest<{ data?: Transaction[] } | Transaction[] | null>(ENDPOINTS.transactionList, {
    method: "POST",
    body: { email },
    token,
    authType: "user",
  });
  if (Array.isArray(response)) return response;
  return response?.data ?? [];
}
