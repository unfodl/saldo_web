import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-forest px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl bg-cream px-8 py-10">
        <Logo size={64} />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-forest">Bienvenido</h1>
          <p className="mt-1 text-sm text-ink-3">
            Inicia sesión con el correo de tu tienda para hacer pagos.
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-ink-4">Powered by Crossmint · Stellar</p>
      </div>
    </div>
  );
}
