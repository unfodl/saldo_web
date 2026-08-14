"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <TextField
        label="Correo"
        name="email"
        type="email"
        placeholder="operador@tutienda.com"
        autoComplete="email"
        required
        disabled={isPending}
      />
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Verificando…" : "Entrar"}
      </Button>
    </form>
  );
}
