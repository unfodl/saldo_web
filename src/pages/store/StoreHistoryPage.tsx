import { useEffect, useState } from "react";
import { useUserAuth } from "../../auth/userAuth";
import { getPayments } from "../../lib/paymentHistory";
import { Card } from "../../components/Card";
import type { PaymentRecord } from "../../types/payment";

const STATUS_LABEL: Record<PaymentRecord["status"], string> = {
  CONFIRMED: "Confirmado",
  FAILED: "Falló",
};

const STATUS_COLOR: Record<PaymentRecord["status"], string> = {
  CONFIRMED: "text-forest-light",
  FAILED: "text-red-600",
};

export function StoreHistoryPage() {
  const { email } = useUserAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    if (!email) return;
    setPayments(getPayments(email));
  }, [email]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-xl font-bold text-forest">Historial de pagos</h1>

      {payments.length === 0 ? (
        <Card className="bg-white px-5 py-8 text-center text-sm text-ink-4">Aún no hay pagos.</Card>
      ) : (
        <Card className="divide-y divide-forest/8 bg-white">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center gap-4 px-5 py-4">
              <img
                src={`/logos/${payment.companyLogoKey}.png`}
                alt={payment.companyName}
                className="h-11 w-11 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-forest">{payment.companyName}</p>
                <p className="text-sm text-ink-4">{payment.reference}</p>
                <p className="text-xs text-ink-4">
                  {new Date(payment.createdAt).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}
                </p>
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
  );
}
