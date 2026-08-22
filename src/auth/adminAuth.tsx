import { createAuthContext } from "./createAuthContext";

export const { AuthProvider: AdminAuthProvider, useAuth: useAdminAuth } = createAuthContext("admin");
