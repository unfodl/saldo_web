import { useCallback, useEffect, useRef, useState } from "react";
import { fetchWalletDetails } from "../api/walletApi";
import { fetchUsdcBalance } from "../api/crossmintApi";
import { ApiError } from "../api/httpClient";
import type { UsdcBalance, WalletDetails } from "../types/wallet";

// Same wallet+balance fetch pattern as UserDashboardPage: wallet address/chain
// comes from bluto, the USDC balance is then read straight from Crossmint
// once that address/chain is known. Extracted here so the /store pay-a-
// provider pages can share it without touching UserDashboardPage.
export function useSaldoWallet(token: string | null, email: string | null) {
  const [wallet, setWallet] = useState<WalletDetails | null>(null);
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);

  const [balance, setBalance] = useState<UsdcBalance | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const hasLoadedRef = useRef(false);

  const loadWallet = useCallback(async () => {
    if (!token || !email) return;
    setIsWalletLoading(true);
    setWalletError(null);
    try {
      const details = await fetchWalletDetails(email, token);
      setWallet(details);
    } catch (err) {
      setWalletError(err instanceof ApiError ? err.message : "No pudimos obtener tu billetera.");
    } finally {
      setIsWalletLoading(false);
    }
  }, [token, email]);

  const loadBalance = useCallback(async (address: string, chain: string) => {
    setIsBalanceLoading(true);
    setBalanceError(null);
    try {
      const usdcBalance = await fetchUsdcBalance(address, chain);
      setBalance(usdcBalance);
    } catch (err) {
      setBalanceError(err instanceof ApiError ? err.message : "No pudimos obtener tu saldo.");
    } finally {
      setIsBalanceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadWallet();
  }, [loadWallet]);

  useEffect(() => {
    if (!wallet) return;
    loadBalance(wallet.address, wallet.chain);
  }, [wallet, loadBalance]);

  const refresh = useCallback(() => {
    if (wallet) loadBalance(wallet.address, wallet.chain);
  }, [wallet, loadBalance]);

  return { wallet, isWalletLoading, walletError, balance, isBalanceLoading, balanceError, refresh };
}
