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
    <div className="flex flex-col gap-10">
      {ungrouped.length > 0 ? (
        <CompanyGrid companies={ungrouped} category={category} activeCompanyId={activeCompanyId} />
      ) : null}

      {Array.from(groups.entries()).map(([groupName, groupCompanies]) => (
        <div key={groupName} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-forest/50">{groupName}</h2>
            <div className="h-px flex-1 bg-forest/8" />
          </div>
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
            className={`group flex flex-col items-center gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg ${
              active ? "shadow-lg ring-2 ring-amber" : "ring-forest/8 hover:ring-amber/40"
            }`}
          >
            <div className="flex aspect-[2/1] w-full items-center justify-center overflow-hidden rounded-xl bg-cream-muted/60 p-3">
              <img
                src={`/logos/${company.logoKey}.png`}
                alt={company.name}
                className="h-full w-full object-contain transition-transform duration-150 group-hover:scale-105"
              />
            </div>
            <span className="text-sm font-medium text-forest/80">{company.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
