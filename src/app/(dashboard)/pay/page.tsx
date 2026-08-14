import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { getUsdcBalance } from "@/lib/crossmint/client";
import { CompanyMosaic } from "@/components/CompanyMosaic";
import { PaymentPanel } from "./PaymentPanel";

const CATEGORY_LABEL: Record<string, string> = {
  SERVICIOS: "Servicios",
  RECARGAS: "Recargas",
};

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; company?: string }>;
}) {
  const { category: rawCategory, company: companyId } = await searchParams;
  const category = rawCategory === "RECARGAS" ? "RECARGAS" : "SERVICIOS";

  const session = await getSession();
  const [companies, store] = await Promise.all([
    db.company.findMany({ where: { active: true, category }, orderBy: { name: "asc" } }),
    db.store.findUnique({ where: { id: session!.storeId } }),
  ]);

  const selectedCompany = companyId ? (companies.find((c) => c.id === companyId) ?? null) : null;

  if (selectedCompany) {
    const availableBalance = store?.crossmintWalletLocator
      ? await getUsdcBalance(store.crossmintWalletLocator)
          .then((b) => Number(b.amount))
          .catch(() => 0)
      : 0;

    return (
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Link
            href={`/pay?category=${category}`}
            className="inline-flex w-fit items-center gap-1.5 text-sm text-forest/60 hover:text-forest"
          >
            <ArrowLeft size={16} />
            Volver
          </Link>
          <nav className="flex items-center gap-1.5 text-xs text-forest/50">
            <Link href={`/pay?category=${category}`} className="hover:text-forest">
              {CATEGORY_LABEL[category]}
            </Link>
            <ChevronRight size={12} />
            <span className="text-forest">{selectedCompany.name}</span>
          </nav>
        </div>

        <PaymentPanel
          key={selectedCompany.id}
          companyId={selectedCompany.id}
          companyName={selectedCompany.name}
          companyLogoKey={selectedCompany.logoKey}
          availableBalance={availableBalance}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <h1 className="text-xl font-bold text-forest">{CATEGORY_LABEL[category]}</h1>
      <CompanyMosaic companies={companies} category={category} activeCompanyId={null} />
    </div>
  );
}
