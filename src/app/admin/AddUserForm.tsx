"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { PinInput } from "@/components/PinInput";

export function AddUserForm({ onSuccess }: { onSuccess: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const res = await fetch("/api/admin/operators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phoneNumber, emailAddress, pin }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "No pudimos crear el usuario. Intenta de nuevo.");
        setIsPending(false);
        return;
      }

      onSuccess();
    } catch {
      setError("No pudimos crear el usuario. Intenta de nuevo.");
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
      <TextField
        label="Correo"
        name="emailAddress"
        type="email"
        placeholder="usuario@tutienda.com"
        autoComplete="email"
        required
        value={emailAddress}
        onChange={(e) => setEmailAddress(e.target.value)}
        disabled={isPending}
      />
      <PinInput name="pin" value={pin} onChange={setPin} disabled={isPending} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando…" : "Agregar usuario"}
      </Button>
    </form>
  );
}
