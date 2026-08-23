import { ENDPOINTS } from "./config";
import { apiRequest } from "./httpClient";
import type { AppUser } from "../types/user";

// TODO: UNVERIFIED — see ENDPOINTS.userDetails in ./config for context.
export async function fetchCurrentUser(email: string, token: string): Promise<AppUser> {
  const response = await apiRequest<{ user?: AppUser } | AppUser>(
    `${ENDPOINTS.userDetails}?emailAddress=${encodeURIComponent(email)}`,
    { method: "GET", token, authType: "user" },
  );
  return (response as { user?: AppUser })?.user ?? (response as AppUser);
}
