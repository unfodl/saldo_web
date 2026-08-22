import { useState, type FormEvent } from "react";
import { updateUser } from "../../api/usersApi";
import { ApiError } from "../../api/httpClient";
import { useAdminAuth } from "../../auth/adminAuth";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { Toggle } from "../../components/Toggle";
import type { AppUser } from "../../types/user";

export function EditUserForm({ user, onSuccess }: { user: AppUser; onSuccess: () => void }) {
  const { token } = useAdminAuth();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
  const [isActive, setIsActive] = useState(user.status === "ACTIVE");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Tu sesión expiró. Vuelve a iniciar sesión.");
      return;
    }

    setIsPending(true);
    try {
      await updateUser(
        {
          _id: user._id,
          firstName,
          lastName,
          phoneNumber,
          status: isActive ? "ACTIVE" : "INACTIVE",
        },
        token,
      );
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No pudimos actualizar el usuario. Intenta de nuevo.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextField
        label="Nombre"
        name="firstName"
        placeholder="Nombre"
        autoComplete="given-name"
        required
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        disabled={isPending}
      />
      <TextField
        label="Apellido"
        name="lastName"
        placeholder="Apellido"
        autoComplete="family-name"
        required
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        disabled={isPending}
      />
      <TextField
        label="Teléfono"
        name="phoneNumber"
        type="tel"
        placeholder="55 1234 5678"
        autoComplete="tel"
        required
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        disabled={isPending}
      />
      <TextField label="Correo" name="emailAddress" value={user.emailAddress} disabled readOnly />
      <Toggle
        label={isActive ? "Usuario activo" : "Usuario inactivo"}
        checked={isActive}
        onChange={setIsActive}
        disabled={isPending}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
