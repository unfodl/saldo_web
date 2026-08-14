import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getUsdcBalance } from "@/lib/crossmint/client";
import { TopBar } from "@/components/TopBar";
import { CategoryRail } from "@/components/sidebar/CategoryRail";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const store = await db.store.findUnique({ where: { id: session.storeId } });

  const balance = store?.crossmintWalletLocator
    ? await getUsdcBalance(store.crossmintWalletLocator)
        .then((b) => b.amount)
        .catch(() => null)
    : null;

  return (
    <div className="flex h-screen flex-col">
      <TopBar storeName={store?.name ?? "Saldo"} email={session.email} />
      <div className="flex flex-1 overflow-hidden">
        <CategoryRail initialBalance={balance} hasWallet={Boolean(store?.crossmintWalletLocator)} />
        <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
