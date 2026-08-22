// bluto returns/expects these upper-cased (confirmed by testing against the
// real backend) — not the lower-case "active"/"inactive" this used to assume.
export type UserStatus = "ACTIVE" | "INACTIVE";

export type AppUser = {
  _id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  status: UserStatus;
};

export type CreateUserPayload = {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  pin: string;
};

export type UpdateUserPayload = {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  status: UserStatus;
};
