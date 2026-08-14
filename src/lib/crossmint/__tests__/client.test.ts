import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createStoreWallet, getUsdcBalance, sendUsdcPayment } from "@/lib/crossmint/client";

const mockCreateWallet = vi.fn();
const mockGetWallet = vi.fn();

vi.mock("@crossmint/wallets-sdk", () => ({
  createCrossmint: vi.fn(() => ({})),
  CrossmintWallets: {
    from: vi.fn(() => ({
      createWallet: mockCreateWallet,
      getWallet: mockGetWallet,
    })),
  },
}));

describe("crossmint client", () => {
  beforeEach(() => {
    vi.stubEnv("CROSSMINT_API_KEY", "sk_staging_test");
    vi.stubEnv("CROSSMINT_SIGNER_SECRET", "test-secret");
    mockCreateWallet.mockReset();
    mockGetWallet.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("createStoreWallet derives the wallet from the server signer secret", async () => {
    mockCreateWallet.mockResolvedValue({ address: "GADDRESS123" });

    const wallet = await createStoreWallet("store-demo");

    expect(wallet).toEqual({ locator: "GADDRESS123", address: "GADDRESS123" });
    expect(mockCreateWallet).toHaveBeenCalledWith({
      chain: "stellar",
      recovery: { type: "server", secret: "test-secret" },
      alias: "store-demo",
    });
  });

  it("getUsdcBalance returns 0 when the wallet holds no USDC", async () => {
    mockGetWallet.mockResolvedValue({
      balances: vi.fn().mockResolvedValue({ usdc: { amount: "0", rawAmount: "0", decimals: 6 } }),
    });

    const balance = await getUsdcBalance("GADDRESS123");
    expect(balance.amount).toBe("0");
  });

  it("getUsdcBalance parses the usdc entry from balances()", async () => {
    mockGetWallet.mockResolvedValue({
      balances: vi.fn().mockResolvedValue({ usdc: { amount: "125.5", rawAmount: "125500000", decimals: 6 } }),
    });

    const balance = await getUsdcBalance("GADDRESS123");
    expect(balance.amount).toBe("125.5");
    expect(balance.decimals).toBe(6);
  });

  it("sendUsdcPayment resolves with transaction details on success", async () => {
    const send = vi.fn().mockResolvedValue({
      transactionId: "tx_1",
      explorerLink: "https://stellar.expert/tx/1",
      hash: "abc123",
    });
    mockGetWallet.mockResolvedValue({ send });

    const result = await sendUsdcPayment({
      walletLocator: "GADDRESS123",
      toAddress: "GDEMO0000000000000000000000000000000000000000000000",
      amountUsdc: "10",
      memo: "ref",
    });

    expect(send).toHaveBeenCalledWith("GDEMO0000000000000000000000000000000000000000000000", "usdc", "10");
    expect(result.transactionId).toBe("tx_1");
    expect(result.txHash).toBe("abc123");
  });

  it("sendUsdcPayment propagates errors from a failed transfer", async () => {
    const send = vi.fn().mockRejectedValue(new Error("Insufficient balance"));
    mockGetWallet.mockResolvedValue({ send });

    await expect(
      sendUsdcPayment({
        walletLocator: "GADDRESS123",
        toAddress: "GDEMO0000000000000000000000000000000000000000000000",
        amountUsdc: "10",
        memo: "ref",
      }),
    ).rejects.toThrow("Insufficient balance");
  });
});
