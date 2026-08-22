import { STELLAR_MEMO_MAX_LENGTH } from "@/lib/crossmint/config";

export type ValidationResult = { ok: true } | { ok: false; error: string };

export function validateReference(reference: string): ValidationResult {
  const trimmed = reference.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: "Ingresa una referencia." };
  }
  if (trimmed.length > STELLAR_MEMO_MAX_LENGTH) {
    return {
      ok: false,
      error: `La referencia no puede tener más de ${STELLAR_MEMO_MAX_LENGTH} caracteres.`,
    };
  }
  return { ok: true };
}

export function validateAmount(amount: string, availableBalance: number): ValidationResult {
  const value = Number(amount);
  if (!amount || Number.isNaN(value)) {
    return { ok: false, error: "Ingresa un monto válido." };
  }
  if (value <= 0) {
    return { ok: false, error: "El monto debe ser mayor a 0." };
  }
  if (Math.round(value * 1e6) / 1e6 !== value) {
    return { ok: false, error: "El monto admite hasta 6 decimales." };
  }
  if (value > availableBalance) {
    return { ok: false, error: "El monto excede el saldo disponible." };
  }
  return { ok: true };
}

export function validatePin(pin: string): ValidationResult {
  if (!/^\d{4}$/.test(pin)) {
    return { ok: false, error: "El PIN debe tener 4 dígitos." };
  }
  return { ok: true };
}

export function validateFirstName(firstName: string): ValidationResult {
  if (firstName.trim().length === 0) {
    return { ok: false, error: "Ingresa un nombre." };
  }
  return { ok: true };
}

export function validateLastName(lastName: string): ValidationResult {
  if (lastName.trim().length === 0) {
    return { ok: false, error: "Ingresa un apellido." };
  }
  return { ok: true };
}

export function validatePhone(phone: string): ValidationResult {
  if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
    return { ok: false, error: "Ingresa un teléfono de 10 dígitos." };
  }
  return { ok: true };
}
