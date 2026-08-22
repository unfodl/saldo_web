import { createAuthContext } from "./createAuthContext";

export const { AuthProvider: UserAuthProvider, useAuth: useUserAuth } = createAuthContext("user");
