import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authApi";
import { ApiError } from "../../api/httpClient";
import { useUserAuth } from "../../auth/userAuth";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { PinInput } from "../../components/PinInput";
import { Logo } from "../../components/Logo";

export function UserLoginPage() {
  const navigate = useNavigate();
  const { login } = useUserAuth();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const token = await loginUser(trimmedEmail, pin);
      login(token, trimmedEmail);
      navigate("/dashboard", { replace: true });
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
          <h1 className="text-2xl font-bold text-forest">Bienvenido</h1>
          <p className="mt-1 text-sm text-ink-3">Inicia sesión con el correo de tu tienda.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <TextField
            label="Correo"
            name="email"
            type="email"
            placeholder="operador@tutienda.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
          />
          <PinInput name="pin" value={pin} onChange={setPin} disabled={isPending} />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Verificando…" : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
