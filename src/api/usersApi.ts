import { ENDPOINTS } from "./config";
import { apiRequest } from "./httpClient";
import type { AppUser, CreateUserPayload, UpdateUserPayload } from "../types/user";

export async function fetchUserList(token: string): Promise<AppUser[]> {
  const data = await apiRequest<{ users?: AppUser[] }>(ENDPOINTS.userList, {
    method: "GET",
    token,
    authType: "admin",
  });
  return Array.isArray(data?.users) ? data.users : [];
}

// TODO: UNVERIFIED — see ENDPOINTS.createUser in ./config for context.
export async function createUser(payload: CreateUserPayload, token: string): Promise<void> {
  await apiRequest(ENDPOINTS.createUser, {
    method: "POST",
    body: payload,
    token,
    authType: "admin",
  });
}

// TODO: UNVERIFIED — bluto doesn't document a user-details endpoint anywhere
// we have access to. Guesses _id as the lookup key; confirm against the real
// backend.
export async function fetchUserDetails(id: string, token: string): Promise<AppUser> {
  const data = await apiRequest<{ user?: AppUser } | AppUser>(
    `${ENDPOINTS.userDetails}?_id=${encodeURIComponent(id)}`,
    { method: "GET", token, authType: "admin" },
  );
  return (data as { user?: AppUser })?.user ?? (data as AppUser);
}

// TODO: UNVERIFIED — see ENDPOINTS.updateUser in ./config for context.
export async function updateUser(payload: UpdateUserPayload, token: string): Promise<void> {
  await apiRequest(ENDPOINTS.updateUser, {
    method: "PUT",
    body: payload,
    token,
    authType: "admin",
  });
}

// TODO: UNVERIFIED — see ENDPOINTS.deleteUser in ./config for context.
export async function deleteUser(id: string, token: string): Promise<void> {
  await apiRequest(ENDPOINTS.deleteUser, {
    method: "DELETE",
    body: { _id: id },
    token,
    authType: "admin",
  });
}
