import { Card } from "./Card";
import type { UsdcBalance, WalletDetails } from "../types/wallet";

export function BalanceCard({
  wallet,
  isWalletLoading,
  walletError,
  balance,
  isBalanceLoading,
  balanceError,
  onRefresh,
}: {
  wallet: WalletDetails | null;
  isWalletLoading: boolean;
  walletError: string | null;
  balance: UsdcBalance | null;
  isBalanceLoading: boolean;
  balanceError: string | null;
  onRefresh: () => void;
}) {
  return (
    <Card className="bg-forest px-6 py-6 text-cream">
      <p className="text-sm text-cream/60">Saldo disponible (USDC · Stellar)</p>

      {isWalletLoading ? (
        <p className="mt-2 text-sm text-cream/70">Cargando…</p>
      ) : walletError ? (
        <p className="mt-2 text-sm text-red-300">{walletError}</p>
      ) : wallet ? (
        <div className="mt-2 flex items-end justify-between">
          <p className="tabular-nums text-4xl font-bold">
            {isBalanceLoading || balanceError
              ? "—"
              : `$${Number(balance?.amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isBalanceLoading}
            className="text-sm text-amber hover:text-amber-dark disabled:opacity-50"
          >
            {isBalanceLoading ? "Actualizando…" : "Actualizar"}
          </button>
        </div>
      ) : (
        <p className="mt-2 text-sm text-cream/70">Esta cuenta todavía no tiene una billetera configurada.</p>
      )}

      {balanceError ? <p className="mt-2 text-sm text-red-300">{balanceError}</p> : null}
    </Card>
  );
}
