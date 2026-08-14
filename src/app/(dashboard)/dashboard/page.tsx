import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getUsdcBalance } from "@/lib/crossmint/client";
import { BalanceCard } from "@/components/BalanceCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function DashboardPage() {
  const session = await getSession();
  const store = await db.store.findUnique({ where: { id: session!.storeId } });

  const initialAmount = store?.crossmintWalletLocator
    ? await getUsdcBalance(store.crossmintWalletLocator)
        .then((b) => b.amount)
        .catch(() => null)
    : null;

  const recentPayments = await db.payment.findMany({
    where: { storeId: session!.storeId },
    include: { company: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <BalanceCard initialAmount={initialAmount} hasWallet={Boolean(store?.crossmintWalletLocator)} />

      <Link href="/pay?category=SERVICIOS">
        <Button className="w-full">Pagar a un proveedor</Button>
      </Link>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-forest">Pagos recientes</h2>
          <Link href="/history" className="text-sm text-amber hover:text-amber-dark">
            Ver todo
          </Link>
        </div>
        {recentPayments.length === 0 ? (
          <Card className="bg-white px-5 py-6 text-center text-sm text-ink-4">Aún no hay pagos.</Card>
        ) : (
          <Card className="divide-y divide-forest/8 bg-white">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center gap-4 px-5 py-4">
                <Image
                  src={`/logos/${payment.company.logoKey}.png`}
                  alt={payment.company.name}
                  width={44}
                  height={44}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-forest">{payment.company.name}</p>
                  <p className="text-sm text-ink-4">{payment.reference}</p>
                </div>
                <div className="text-right">
                  <p className="tabular-nums font-semibold text-forest">
                    ${Number(payment.amountUsdc).toFixed(2)}
                  </p>
                  <StatusBadge status={payment.status} />
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    PENDING: "Pendiente",
    SUBMITTED: "Enviado",
    CONFIRMED: "Confirmado",
    FAILED: "Falló",
  };
  const colors: Record<string, string> = {
    PENDING: "text-ink-4",
    SUBMITTED: "text-amber-dark",
    CONFIRMED: "text-forest-light",
    FAILED: "text-red-600",
  };
  return <p className={`text-xs ${colors[status] ?? "text-ink-4"}`}>{labels[status] ?? status}</p>;
}
