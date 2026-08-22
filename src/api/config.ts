// Base URL of bluto, the same backend saldo_web's Next.js app talks to.
// Set VITE_BLUTO_API_URL in .env.local — see .env.example.
export const BLUTO_API_URL = (import.meta.env.VITE_BLUTO_API_URL ?? "http://localhost:8081/native/api").replace(
  /\/+$/,
  "",
);

// Endpoints confirmed against the existing saldo_web app / its bluto server logs.
export const CONFIRMED_ENDPOINTS = {
  userLogin: "/auth/create-token",
  adminLogin: "/auth/admin/login",
  userList: "/user/list",
};

// TODO: UNVERIFIED — bluto doesn't document a create-user endpoint anywhere we
// have access to. This guesses a REST-standard path/shape; confirm against the
// real backend and fix here (this is the only place it's referenced).
export const UNVERIFIED_ENDPOINTS = {
  createUser: "/user/create",
  userDetails: "/user/details",
  updateUser: "/user/update",
  deleteUser: "/user/delete",
};

export const ENDPOINTS = { ...CONFIRMED_ENDPOINTS, ...UNVERIFIED_ENDPOINTS };
