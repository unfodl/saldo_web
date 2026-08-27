import { useUserAuth } from "../../auth/userAuth";
import { useTransactionHistory } from "../../hooks/useTransactionHistory";
import { Card } from "../../components/Card";
import { TransactionRow } from "../../components/TransactionRow";

export function StoreHistoryPage() {
  const { token, email } = useUserAuth();
  const { transactions, isLoading, error } = useTransactionHistory(token, email);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-xl font-bold text-forest">Historial de pagos</h1>

      {isLoading ? (
        <Card className="bg-white px-5 py-8 text-center text-sm text-ink-4">Cargando historial…</Card>
      ) : error ? (
        <Card className="bg-white px-5 py-8 text-center text-sm text-red-600">{error}</Card>
      ) : transactions.length === 0 ? (
        <Card className="bg-white px-5 py-8 text-center text-sm text-ink-4">Aún no hay pagos.</Card>
      ) : (
        <Card className="divide-y divide-forest/8 bg-white">
          {transactions.map((transaction) => (
            <TransactionRow key={transaction._id} transaction={transaction} />
          ))}
        </Card>
      )}
    </div>
  );
}
