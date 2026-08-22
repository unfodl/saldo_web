import { CrossmintWallets, createCrossmint } from "@crossmint/wallets-sdk";
import { crossmintApiKey, crossmintSignerSecret } from "./config";

let walletsClient: CrossmintWallets | null = null;

/**
 * Lazily-created singleton. Uses a "server" recovery signer: we hold
 * CROSSMINT_SIGNER_SECRET locally and the SDK derives/signs with it
 * in-process — the secret is never sent to Crossmint. This is the
 * generally-available custodial path for backend-controlled wallets;
 * the alternative `type: "api-key"` signer exists in the SDK's types but
 * requires Crossmint to manually enable it per-project (we hit
 * "not enabled for this project" testing it against real staging).
 */
function getWalletsClient(): CrossmintWallets {
  if (!walletsClient) {
    const crossmint = createCrossmint({ apiKey: crossmintApiKey() });
    walletsClient = CrossmintWallets.from(crossmint);
  }
  return walletsClient;
}

export type CreatedWallet = {
  locator: string;
  address: string;
};

/**
 * Creates a Stellar smart wallet for a store. Used once per store via
 * scripts/create-store-wallet.ts, not from end-user request flows.
 */
export async function createStoreWallet(alias: string): Promise<CreatedWallet> {
  const wallet = await getWalletsClient().createWallet({
    chain: "stellar",
    recovery: { type: "server", secret: crossmintSignerSecret() },
    alias,
  });

  return { locator: wallet.address, address: wallet.address };
}

export type UsdcBalance = {
  amount: string;
  rawAmount: string;
  decimals: number;
};

export async function getUsdcBalance(walletAddress: string): Promise<UsdcBalance> {
  const wallet = await getWalletsClient().getWallet(walletAddress, { chain: "stellar" });
  const balances = await wallet.balances();

  return {
    amount: balances.usdc.amount,
    rawAmount: balances.usdc.rawAmount ?? "0",
    decimals: balances.usdc.decimals ?? 6,
  };
}

export type WalletBalances = {
  usdc: UsdcBalance;
  usdxm: UsdcBalance;
};

/** USDC + USDXM (Crossmint's staging test token) together, for the wallet detail panel. */
export async function getWalletBalances(walletAddress: string): Promise<WalletBalances> {
  const wallet = await getWalletsClient().getWallet(walletAddress, { chain: "stellar" });
  const balances = await wallet.balances(["usdxm"]);
  const usdxmToken = balances.tokens.find((t) => t.symbol.toLowerCase() === "usdxm");

  return {
    usdc: {
      amount: balances.usdc.amount,
      rawAmount: balances.usdc.rawAmount ?? "0",
      decimals: balances.usdc.decimals ?? 6,
    },
    usdxm: {
      amount: usdxmToken?.amount ?? "0",
      rawAmount: usdxmToken?.rawAmount ?? "0",
      decimals: usdxmToken?.decimals ?? 6,
    },
  };
}

/**
 * Mints Crossmint's staging test token (USDXM) into a wallet — staging only,
 * 1-100 per call. This is not real USDC; Crossmint doesn't offer a
 * programmatic USDC faucet, so getting actual testnet USDC into a wallet
 * requires an external Stellar testnet faucet + swap.
 */
export async function fundStoreWalletStaging(walletAddress: string, amount: number): Promise<void> {
  const wallet = await getWalletsClient().getWallet(walletAddress, { chain: "stellar" });
  await wallet.stagingFund(amount);
}

export type SendPaymentResult = {
  transactionId: string;
  explorerLink?: string;
  txHash?: string;
};

/**
 * Sends USDC on Stellar from a store's wallet to a company's receiving
 * address. Resolves only once the transfer is confirmed (the SDK polls
 * internally) and throws on failure.
 *
 * NOTE: no on-chain memo/reference yet. The high-level `wallet.send()`
 * token-transfer call doesn't accept one — embedding the operator's
 * reference as a real Stellar memo would require dropping to
 * `StellarWallet.sendTransaction()` with a raw contract-call against the
 * USDC Stellar Asset Contract address, which needs to be confirmed per
 * network before relying on it. The reference is still recorded in our
 * own Payment table regardless.
 */
export async function sendUsdcPayment(params: {
  walletLocator: string;
  toAddress: string;
  amountUsdc: string;
  memo: string;
}): Promise<SendPaymentResult> {
  const wallet = await getWalletsClient().getWallet(params.walletLocator, { chain: "stellar" });
  // A freshly-fetched wallet has no signer attached yet — the secret is never
  // stored by Crossmint, so it must be supplied again before any signing op.
  await wallet.useSigner({ type: "server", secret: crossmintSignerSecret() });
  const tx = await wallet.send(params.toAddress, "usdc", params.amountUsdc);

  return {
    transactionId: tx.transactionId,
    explorerLink: tx.explorerLink,
    txHash: tx.hash,
  };
}
