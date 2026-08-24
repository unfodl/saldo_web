import { CrossmintWallets, createCrossmint } from "@crossmint/wallets-sdk";
import { CROSSMINT_API_KEY, CROSSMINT_SIGNER_SECRET } from "../../api/crossmintConfig";

// ⚠️ Runs in the browser with a secret recovery signer — see the warning on
// CROSSMINT_SIGNER_SECRET in src/api/crossmintConfig.ts before touching this.
let walletsClient: CrossmintWallets | null = null;

function getWalletsClient(): CrossmintWallets {
  if (!walletsClient) {
    const crossmint = createCrossmint({ apiKey: CROSSMINT_API_KEY });
    walletsClient = CrossmintWallets.from(crossmint);
  }
  return walletsClient;
}

export type SendUsdcResult = {
  transactionId: string;
  explorerLink?: string;
  txHash?: string;
};

/**
 * Sends USDC on Stellar straight through Crossmint's wallet.send() — ported
 * from the old Next.js app's src/lib/crossmint/client.ts (sendUsdcPayment),
 * adapted to run client-side instead of in a server action. Resolves only
 * once the transfer is confirmed on-chain (the SDK polls internally) and
 * throws on failure.
 */
export async function sendUsdcPayment(params: {
  walletAddress: string;
  toAddress: string;
  amountUsdc: string;
}): Promise<SendUsdcResult> {
  const wallet = await getWalletsClient().getWallet(params.walletAddress, { chain: "stellar" });

  // getWallet() returns the wallet but doesn't hand it signing authority —
  // a "server" recovery signer needs its secret supplied explicitly before
  // send() will work.
  // TODO: UNVERIFIED against real Crossmint staging (ported from an app that
  // never confirmed this path against production either — see the original
  // file's notes on the "api-key" signer type). If this throws a permission
  // error, CROSSMINT_API_KEY may need to be an sk_ secret key rather than the
  // ck_ publishable key used for balance reads.
  await wallet.useSigner({ type: "server", secret: CROSSMINT_SIGNER_SECRET });

  const tx = await wallet.send(params.toAddress, "usdc", params.amountUsdc);

  return { transactionId: tx.transactionId, explorerLink: tx.explorerLink, txHash: tx.hash };
}
