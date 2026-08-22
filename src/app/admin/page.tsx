import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin-session";
import { adminLogoutAction } from "@/lib/actions/admin";
import { listUsers } from "@/lib/auth/bluto";
import { Logo } from "@/components/Logo";
import { AdminUsersView, type UserRow } from "./AdminUsersView";

// AdminPage is a Server Component, so this runs on the Node server, not in
// the browser — bluto can be called directly here with no CORS concern and
// no need to route through this app's own API (that self-fetch also never
// shows up in browser dev tools, since the browser never makes the request).
async function fetchOperators(): Promise<UserRow[]> {
  try {
    return await listUsers();
  } catch (err) {
    console.error("bluto user list request failed", err);
    return [];
  }
}

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const rows = await fetchOperators();

  return (
    <div className="min-h-full bg-cream">
      <header className="flex items-center justify-between bg-forest px-8 py-4 text-cream">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <div className="leading-tight">
            <p className="text-sm font-semibold">Panel de administración</p>
            <p className="text-xs text-cream/60">{session.email}</p>
          </div>
        </div>
        <form action={adminLogoutAction}>
          <button type="submit" className="text-sm text-cream/70 hover:text-amber">
            Cerrar sesión
          </button>
        </form>
      </header>

      <main className="px-8 py-8">
        <AdminUsersView operators={rows} />
      </main>
    </div>
  );
}
