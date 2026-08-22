import Image from "next/image";
import Link from "next/link";

type MosaicCompany = {
  id: string;
  name: string;
  logoKey: string;
  group: string | null;
};

export function CompanyMosaic({
  companies,
  category,
  activeCompanyId,
}: {
  companies: MosaicCompany[];
  category: string;
  activeCompanyId: string | null;
}) {
  if (companies.length === 0) {
    return <p className="text-sm text-ink-4">Próximamente.</p>;
  }

  const ungrouped = companies.filter((c) => !c.group);
  const groups = new Map<string, MosaicCompany[]>();
  for (const company of companies) {
    if (!company.group) continue;
    const list = groups.get(company.group) ?? [];
    list.push(company);
    groups.set(company.group, list);
  }

  return (
    <div className="flex flex-col gap-8">
      {ungrouped.length > 0 ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-forest/60">Los más usados</h2>
          <CompanyGrid companies={ungrouped} category={category} activeCompanyId={activeCompanyId} />
        </div>
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
  companies: MosaicCompany[];
  category: string;
  activeCompanyId: string | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {companies.map((company) => {
        const active = company.id === activeCompanyId;
        return (
          <Link
            key={company.id}
            href={`/pay?category=${category}&company=${company.id}`}
            className={`flex aspect-[2/1] items-center justify-center overflow-hidden rounded-2xl bg-white p-5 transition-all hover:shadow-md ${
              active ? "border-4 border-amber" : "border-2 border-forest hover:border-4 hover:border-amber-dark"
            }`}
          >
            <Image
              src={`/logos/${company.logoKey}.png`}
              alt={company.name}
              width={160}
              height={80}
              className="h-full w-full object-contain"
            />
          </Link>
        );
      })}
    </div>
  );
}
