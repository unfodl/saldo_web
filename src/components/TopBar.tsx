"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { logoutAction } from "@/lib/actions/auth";

export function TopBar({ storeName, email }: { storeName: string; email: string }) {
  const pathname = usePathname();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between bg-forest px-6 text-cream">
      <Link href="/dashboard" className="flex items-center gap-3">
        <Logo size={32} />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">{storeName}</span>
          <span className="text-xs text-cream/60">{email}</span>
        </div>
      </Link>

      <nav className="flex items-center gap-5 text-sm">
        <Link
          href="/dashboard"
          className={pathname === "/dashboard" ? "text-amber" : "text-cream/85 hover:text-amber"}
        >
          Inicio
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="text-cream/70 hover:text-amber">
            Salir
          </button>
        </form>
      </nav>
    </header>
  );
}
