import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUserAuth } from "../../auth/userAuth";
import { useSaldoWallet } from "../../hooks/useSaldoWallet";
import { getPayments } from "../../lib/paymentHistory";
import { BalanceCard } from "../../components/BalanceCard";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import type { PaymentRecord } from "../../types/payment";

const STATUS_LABEL: Record<PaymentRecord["status"], string> = {
  CONFIRMED: "Confirmado",
  FAILED: "Falló",
};

const STATUS_COLOR: Record<PaymentRecord["status"], string> = {
  CONFIRMED: "text-forest-light",
  FAILED: "text-red-600",
};

export function StoreOverviewPage() {
  const { token, email } = useUserAuth();
  const wallet = useSaldoWallet(token, email);
  const [recentPayments, setRecentPayments] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    if (!email) return;
    setRecentPayments(getPayments(email).slice(0, 5));
  }, [email]);

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
        {recentPayments.length === 0 ? (
          <Card className="bg-white px-5 py-6 text-center text-sm text-ink-4">Aún no hay pagos.</Card>
        ) : (
          <Card className="divide-y divide-forest/8 bg-white">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center gap-4 px-5 py-4">
                <img
                  src={`/logos/${payment.companyLogoKey}.png`}
                  alt={payment.companyName}
                  className="h-11 w-11 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-forest">{payment.companyName}</p>
                  <p className="text-sm text-ink-4">{payment.reference}</p>
                </div>
                <div className="text-right">
                  <p className="tabular-nums font-semibold text-forest">${Number(payment.amount).toFixed(2)}</p>
                  <p className={`text-xs ${STATUS_COLOR[payment.status]}`}>{STATUS_LABEL[payment.status]}</p>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
