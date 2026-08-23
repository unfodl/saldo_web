// TODO: UNVERIFIED — bluto doesn't document a wallet API anywhere we have
// access to. Shape guessed from context (this app sends payments in USDC);
// confirm against the real backend and fix here if it differs.
export type WalletDetails = {
  address: string;
  chain: string;
};

export type SendUsdcPayload = {
  toAddress: string;
  amount: string;
};

export type SendUsdcResult = {
  txHash?: string;
  status?: string;
};

export type UsdcBalance = {
  amount: string;
};
