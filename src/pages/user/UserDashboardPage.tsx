import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../../api/userApi";
import { fetchWalletDetails } from "../../api/walletApi";
import { fetchUsdcBalance } from "../../api/crossmintApi";
import { ApiError } from "../../api/httpClient";
import { useUserAuth } from "../../auth/userAuth";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Logo } from "../../components/Logo";
import { Modal } from "../../components/Modal";
import { SendUsdcForm } from "./SendUsdcForm";
import type { AppUser } from "../../types/user";
import type { SendUsdcResult, UsdcBalance, WalletDetails } from "../../types/wallet";

function truncateAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 4)}......${address.slice(-4)}`;
}

export function UserDashboardPage() {
  const navigate = useNavigate();
  const { token, email, logout } = useUserAuth();

  const [profile, setProfile] = useState<AppUser | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [wallet, setWallet] = useState<WalletDetails | null>(null);
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);

  const [balance, setBalance] = useState<UsdcBalance | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  const [isAddressCopied, setIsAddressCopied] = useState(false);

  const hasLoadedRef = useRef(false);

  const loadProfile = useCallback(async () => {
    if (!token || !email) return;
    setIsProfileLoading(true);
    setProfileError(null);
    try {
      const details = await fetchCurrentUser(email, token);
      setProfile(details);
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "No pudimos obtener tus datos.");
    } finally {
      setIsProfileLoading(false);
    }
  }, [token, email]);

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

  // Fetched straight from Crossmint (not bluto) once the wallet's address and
  // chain are known — see src/api/crossmintApi.ts.
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

  // Re-fetched on every mount of this page — i.e. right after login (which
  // navigates here) and again on any full page reload/refresh.
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadProfile();
    loadWallet();
  }, [loadProfile, loadWallet]);

  // The balance depends on the wallet's address/chain, so it fetches once
  // those come back from loadWallet above rather than in parallel with it.
  useEffect(() => {
    if (!wallet) return;
    loadBalance(wallet.address, wallet.chain);
  }, [wallet, loadBalance]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function handleSendSuccess(result: SendUsdcResult) {
    setIsSendModalOpen(false);
    setSendSuccess(result.txHash ? `Envío confirmado (tx: ${result.txHash})` : "Envío confirmado.");
  }

  async function handleCopyAddress(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      setIsAddressCopied(true);
      setTimeout(() => setIsAddressCopied(false), 1500);
    } catch {
      // Clipboard API can be unavailable (e.g. insecure context) — nothing to
      // recover from here, the user can still select and copy manually.
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between bg-forest px-8 py-4 text-cream">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <p className="text-sm font-semibold">Mi cuenta</p>
        </div>
        <button type="button" onClick={handleLogout} className="text-sm text-cream/70 hover:text-amber">
          Cerrar sesión
        </button>
      </header>

      <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-8">
        <Card className="bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-forest">Datos de la cuenta</h2>
          {isProfileLoading ? (
            <p className="text-sm text-ink-4">Cargando…</p>
          ) : profileError ? (
            <p className="text-sm text-red-600">{profileError}</p>
          ) : profile ? (
            <dl className="flex flex-col gap-3">
              <div>
                <dt className="text-xs font-medium uppercase text-ink-4">Nombre</dt>
                <dd className="text-forest">{[profile.firstName, profile.lastName].filter(Boolean).join(" ") || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-ink-4">Correo</dt>
                <dd className="text-forest">{profile.emailAddress}</dd>
              </div>
            </dl>
          ) : null}
        </Card>

        <Card className="bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-forest">Billetera</h2>
          {isWalletLoading ? (
            <p className="text-sm text-ink-4">Cargando…</p>
          ) : walletError ? (
            <p className="text-sm text-red-600">{walletError}</p>
          ) : wallet ? (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-medium uppercase text-ink-4">Saldo</p>
                {isBalanceLoading ? (
                  <p className="text-sm text-ink-4">Cargando…</p>
                ) : balanceError ? (
                  <p className="text-sm text-red-600">{balanceError}</p>
                ) : (
                  <p className="text-2xl font-bold text-forest">
                    {balance?.amount ?? "0"} <span className="text-sm font-medium text-ink-3">USDC</span>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-forest/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-forest">{truncateAddress(wallet.address)}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyAddress(wallet.address)}
                    aria-label="Copiar dirección"
                    title="Copiar dirección"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-forest/10 hover:text-forest"
                  >
                    {isAddressCopied ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
                <span className="inline-flex items-center rounded-full bg-forest/10 px-3 py-1 text-xs font-medium text-forest">
                  {wallet.chain}
                </span>
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="flex items-center justify-between bg-white p-6">
          <div>
            <h2 className="text-lg font-semibold text-forest">Enviar USDC</h2>
            {sendSuccess ? <p className="mt-1 text-sm text-forest">{sendSuccess}</p> : null}
          </div>
          <Button
            onClick={() => {
              setSendSuccess(null);
              setIsSendModalOpen(true);
            }}
          >
            Enviar USDC
          </Button>
        </Card>
      </main>

      <Modal open={isSendModalOpen} onClose={() => setIsSendModalOpen(false)} title="Enviar USDC">
        <SendUsdcForm onSuccess={handleSendSuccess} />
      </Modal>
    </div>
  );
}
