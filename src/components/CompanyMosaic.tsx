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

  // Keyed by group name, or null for ungrouped. A Map preserves insertion
  // order, so sections render in the order their group first appears in
  // `companies` — e.g. an "airTime" group at the front of the source array
  // renders above ungrouped entries, not after them.
  const sections = new Map<string | null, Company[]>();
  for (const company of companies) {
    const list = sections.get(company.group) ?? [];
    list.push(company);
    sections.set(company.group, list);
  }

  return (
    <div className="flex flex-col gap-10">
      {Array.from(sections.entries()).map(([groupName, groupCompanies]) =>
        groupName ? (
          <div key={groupName} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-forest/50">{groupName}</h2>
              <div className="h-px flex-1 bg-forest/8" />
            </div>
            <CompanyGrid companies={groupCompanies} category={category} activeCompanyId={activeCompanyId} />
          </div>
        ) : (
          <CompanyGrid key="ungrouped" companies={groupCompanies} category={category} activeCompanyId={activeCompanyId} />
        ),
      )}
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
