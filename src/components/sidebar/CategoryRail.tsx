"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { History, Smartphone, ReceiptText } from "lucide-react";
import { SidebarBalance } from "./SidebarBalance";

const CATEGORIES = [
  { id: "RECARGAS", label: "Recargas", icon: Smartphone },
  { id: "SERVICIOS", label: "Servicios", icon: ReceiptText },
] as const;

export function CategoryRail({
  initialBalance,
  hasWallet,
}: {
  initialBalance: string | null;
  hasWallet: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = pathname === "/pay" ? searchParams.get("category") ?? "SERVICIOS" : null;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col justify-between border-r border-forest/10 bg-white text-forest">
      <div className="flex flex-col gap-1 px-3 py-6">
        <Link
          href="/history"
          className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
            pathname === "/history" ? "bg-amber text-forest font-medium" : "text-forest/70 hover:bg-forest/5"
          }`}
        >
          <History size={18} />
          Historial
        </Link>

        <div className="mx-1 my-3 h-px bg-forest/8" />

        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-forest/40">Pagar</p>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <Link
              key={cat.id}
              href={`/pay?category=${cat.id}`}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
                isActive ? "bg-amber text-forest font-medium" : "text-forest/70 hover:bg-forest/5"
              }`}
            >
              <cat.icon size={14} />
              {cat.label}
            </Link>
          );
        })}
      </div>

      <div className="px-3 pb-6">
        <SidebarBalance initialAmount={initialBalance} hasWallet={hasWallet} />
      </div>
    </aside>
  );
}
