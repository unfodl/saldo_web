import { Link } from "react-router-dom";
import { useUserAuth } from "../../auth/userAuth";
import { useSaldoWallet } from "../../hooks/useSaldoWallet";
import { useTransactionHistory } from "../../hooks/useTransactionHistory";
import { BalanceCard } from "../../components/BalanceCard";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { TransactionRow } from "../../components/TransactionRow";

export function StoreOverviewPage() {
  const { token, email } = useUserAuth();
  const wallet = useSaldoWallet(token, email);
  const { transactions, isLoading } = useTransactionHistory(token, email);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <BalanceCard
        wallet={wallet.wallet}
        isWalletLoading={wallet.isWalletLoading}
        walletError={wallet.walletError}
        balance={wallet.balance}
        isBalanceLoading={wallet.isBalanceLoading}
        balanceError={wallet.balanceError}
        onRefresh={wallet.refresh}
      />

      <Link to="/store/pay?category=SERVICIOS">
        <Button className="w-full">Pagar a un proveedor</Button>
      </Link>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-forest">Pagos recientes</h2>
          <Link to="/store/history" className="text-sm text-amber hover:text-amber-dark">
            Ver todo
          </Link>
        </div>
        {isLoading ? (
          <Card className="bg-white px-5 py-6 text-center text-sm text-ink-4">Cargando…</Card>
        ) : recentTransactions.length === 0 ? (
          <Card className="bg-white px-5 py-6 text-center text-sm text-ink-4">Aún no hay pagos.</Card>
        ) : (
          <Card className="divide-y divide-forest/8 bg-white">
            {recentTransactions.map((transaction) => (
              <TransactionRow key={transaction._id} transaction={transaction} />
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
