import { ENDPOINTS } from "./config";
import { apiRequest } from "./httpClient";
import type { AdminDetails } from "../types/admin";

// TODO: UNVERIFIED — see ENDPOINTS.adminDetails in ./config for context.
export async function fetchAdminDetails(token: string): Promise<AdminDetails> {
  const response = await apiRequest<{ data?: AdminDetails } | AdminDetails>(ENDPOINTS.adminDetails, {
    method: "GET",
    token,
    authType: "admin",
  });
  return (response as { data?: AdminDetails })?.data ?? (response as AdminDetails);
}
