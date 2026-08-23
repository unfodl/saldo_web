import { Link, useSearchParams } from "react-router-dom";
import { CATEGORY_LABEL, COMPANIES } from "../../data/companies";
import { CompanyMosaic } from "../../components/CompanyMosaic";
import { PaymentPanel } from "./PaymentPanel";
import type { CompanyCategory } from "../../types/payment";

export function StorePayPage() {
  const [searchParams] = useSearchParams();
  const category: CompanyCategory = searchParams.get("category") === "RECARGAS" ? "RECARGAS" : "SERVICIOS";
  const companyId = searchParams.get("company");

  const companies = COMPANIES.filter((c) => c.category === category);
  const selectedCompany = companyId ? companies.find((c) => c.id === companyId) ?? null : null;

  if (selectedCompany) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Link
            to={`/store/pay?category=${category}`}
            className="inline-flex w-fit items-center gap-1.5 text-sm text-forest/60 hover:text-forest"
          >
            ← Volver
          </Link>
          <nav className="flex items-center gap-1.5 text-xs text-forest/50">
            <Link to={`/store/pay?category=${category}`} className="hover:text-forest">
              {CATEGORY_LABEL[category]}
            </Link>
            <span>›</span>
            <span className="text-forest">{selectedCompany.name}</span>
          </nav>
        </div>

        <PaymentPanel key={selectedCompany.id} company={selectedCompany} category={category} />
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
