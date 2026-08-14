import Image from "next/image";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  SUBMITTED: "Enviado",
  CONFIRMED: "Confirmado",
  FAILED: "Falló",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-ink-4",
  SUBMITTED: "text-amber-dark",
  CONFIRMED: "text-forest-light",
  FAILED: "text-red-600",
};

export default async function HistoryPage() {
  const session = await getSession();
  const payments = await db.payment.findMany({
    where: { storeId: session!.storeId },
    include: { company: true, operator: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-xl font-bold text-forest">Historial de pagos</h1>

      {payments.length === 0 ? (
        <Card className="bg-white px-5 py-8 text-center text-sm text-ink-4">Aún no hay pagos.</Card>
      ) : (
        <Card className="divide-y divide-forest/8 bg-white">
          {payments.map((payment) => (
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
                <p className="text-xs text-ink-4">
                  {payment.operator.email} ·{" "}
                  {payment.createdAt.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <div className="text-right">
                <p className="tabular-nums font-semibold text-forest">
                  ${Number(payment.amountUsdc).toFixed(2)}
                </p>
                <p className={`text-xs ${STATUS_COLOR[payment.status] ?? "text-ink-4"}`}>
                  {STATUS_LABEL[payment.status] ?? payment.status}
                </p>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
