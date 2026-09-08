import { useCallback, useEffect, useRef, useState } from "react";
import { fetchWalletBalance, fetchWalletDetails } from "../api/walletApi";
import { ApiError } from "../api/httpClient";
import type { UsdcBalance, WalletDetails } from "../types/wallet";

// Same wallet+balance fetch pattern as UserDashboardPage: wallet address/
// chain and the USDC balance both come from bluto, fetched independently of
// each other. Extracted here so the /store pay-a-provider pages can share it
// without touching UserDashboardPage.
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

  const loadBalance = useCallback(async () => {
    if (!token || !email) return;
    setIsBalanceLoading(true);
    setBalanceError(null);
    try {
      const usdcBalance = await fetchWalletBalance(email, token);
      setBalance(usdcBalance);
    } catch (err) {
      setBalanceError(err instanceof ApiError ? err.message : "No pudimos obtener tu saldo.");
    } finally {
      setIsBalanceLoading(false);
    }
  }, [token, email]);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadWallet();
    loadBalance();
  }, [loadWallet, loadBalance]);

  const refresh = useCallback(() => {
    loadBalance();
  }, [loadBalance]);

  return { wallet, isWalletLoading, walletError, balance, isBalanceLoading, balanceError, refresh };
}
