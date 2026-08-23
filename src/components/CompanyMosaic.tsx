import { Link } from "react-router-dom";
import type { Company, CompanyCategory } from "../types/payment";

export function CompanyMosaic({
  companies,
  category,
  activeCompanyId,
}: {
  companies: Company[];
  category: CompanyCategory;
  activeCompanyId: string | null;
}) {
  if (companies.length === 0) {
    return <p className="text-sm text-ink-4">Próximamente.</p>;
  }

  const ungrouped = companies.filter((c) => !c.group);
  const groups = new Map<string, Company[]>();
  for (const company of companies) {
    if (!company.group) continue;
    const list = groups.get(company.group) ?? [];
    list.push(company);
    groups.set(company.group, list);
  }

  return (
    <div className="flex flex-col gap-8">
      {ungrouped.length > 0 ? (
        <CompanyGrid companies={ungrouped} category={category} activeCompanyId={activeCompanyId} />
      ) : null}

      {Array.from(groups.entries()).map(([groupName, groupCompanies]) => (
        <div key={groupName} className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-forest/60">{groupName}</h2>
          <CompanyGrid companies={groupCompanies} category={category} activeCompanyId={activeCompanyId} />
        </div>
      ))}
    </div>
  );
}

function CompanyGrid({
  companies,
  category,
  activeCompanyId,
}: {
  companies: Company[];
  category: CompanyCategory;
  activeCompanyId: string | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {companies.map((company) => {
        const active = company.id === activeCompanyId;
        return (
          <Link
            key={company.id}
            to={`/store/pay?category=${category}&company=${company.id}`}
            className={`flex aspect-[2/1] items-center justify-center overflow-hidden rounded-2xl border-2 bg-white p-5 transition-colors hover:shadow-md ${
              active ? "border-amber" : "border-forest hover:border-amber/50"
            }`}
          >
            <img
              src={`/logos/${company.logoKey}.png`}
              alt={company.name}
              className="h-full w-full object-contain"
            />
          </Link>
        );
      })}
    </div>
  );
}
