import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../api/authApi";
import { ApiError } from "../../api/httpClient";
import { useAdminAuth } from "../../auth/adminAuth";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { Logo } from "../../components/Logo";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const token = await loginAdmin(email.trim().toLowerCase(), password);
      login(token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No pudimos iniciar sesión. Intenta de nuevo.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-forest px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl bg-cream px-8 py-10">
        <Logo size={64} />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-forest">Panel de administración</h1>
          <p className="mt-1 text-sm text-ink-3">Inicia sesión con tu correo y contraseña de administrador.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <TextField
            label="Correo"
            name="email"
            type="email"
            placeholder="admin@saldo.mx"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
          />
          <TextField
            label="Contraseña"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Verificando…" : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
