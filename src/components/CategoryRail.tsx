import { Link, useLocation, useSearchParams } from "react-router-dom";
import type { CompanyCategory } from "../types/payment";

const CATEGORIES: { id: CompanyCategory; label: string }[] = [
  { id: "RECARGAS", label: "Recargas" },
  { id: "SERVICIOS", label: "Servicios" },
];

export function CategoryRail() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const activeCategory = pathname === "/store/pay" ? searchParams.get("category") ?? "SERVICIOS" : null;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col gap-1 border-r border-forest/10 bg-white px-3 py-6 text-forest">
      <Link
        to="/store/history"
        className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
          pathname === "/store/history" ? "bg-amber font-medium text-forest" : "text-forest/70 hover:bg-forest/5"
        }`}
      >
        Historial
      </Link>

      <div className="mx-1 my-3 h-px bg-forest/8" />

      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-forest/40">Pagar</p>
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <Link
            key={cat.id}
            to={`/store/pay?category=${cat.id}`}
            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
              isActive ? "bg-amber font-medium text-forest" : "text-forest/70 hover:bg-forest/5"
            }`}
          >
            {cat.label}
          </Link>
        );
      })}
    </aside>
  );
}
