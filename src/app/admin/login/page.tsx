import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin-session";
import { Logo } from "@/components/Logo";
import { AdminLoginForm } from "./AdminLoginForm";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-forest px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl bg-cream px-8 py-10">
        <Logo size={64} />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-forest">Panel de administración</h1>
          <p className="mt-1 text-sm text-ink-3">
            Inicia sesión con tu correo y contraseña de administrador.
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
