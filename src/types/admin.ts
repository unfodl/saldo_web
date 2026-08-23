// TODO: UNVERIFIED — bluto doesn't document an admin-details response shape
// anywhere we have access to. Guessed to mirror AppUser; confirm against the
// real GET /auth/admin/details response and fix here if it differs.
export type AdminDetails = {
  firstName?: string;
  lastName?: string;
  emailAddress: string;
};
