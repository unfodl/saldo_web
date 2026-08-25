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
export type SendTokenPayload = {
  email: string;
  amount: string;
};

export type SendUsdcResult = {
  txHash?: string;
  status?: string;
};

export type UsdcBalance = {
  amount: string;
};
