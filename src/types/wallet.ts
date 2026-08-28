// TODO: UNVERIFIED — bluto doesn't document a wallet API anywhere we have
// access to. Shape guessed from context (this app sends payments in USDC);
// confirm against the real backend and fix here if it differs.
export type WalletDetails = {
  address: string;
  chain: string;
};

// Body for the backend's /transaction/send-token endpoint — it identifies
// the sender by email (not an on-chain address) and has no destination
// field, so it's specific to the pay-a-provider/recharge flow, not a
// generic send-to-any-address transfer.
//
// TODO: UNVERIFIED field names for companyCode/transactionType/reference/
// phone — the backend team described these by concept ("company code,
// transaction type (recharge or service), reference or phone which
// applicable"), not by exact key. Confirm against the real endpoint and fix
// here if it expects different names.
export type TransactionType = "recharge" | "service";

export type SendTokenPayload = {
  email: string;
  amountUsdc: string;
  amountMxn?: string;
  company?:{ name: string; code: string};
  type?: TransactionType;
  // Only one of these is sent per request — RECARGAS companies get `phone`,
  // everything else gets `reference` (see PaymentPanel.tsx).
  reference?: string;
  phone?: string;
};

export type SendUsdcResult = {
  txHash?: string;
  status?: string;
};

export type UsdcBalance = {
  amount: string;
};
