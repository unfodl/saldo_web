import type { PaymentRecord } from "../types/payment";

const STORAGE_PREFIX = "saldo_payment_history:";

// No backend endpoint exists for payment history — bluto doesn't have one,
// and this app no longer talks to a database (see prisma.Payment on main).
// History is recorded client-side only, per logged-in user's email, and
// does not sync across devices or browsers.
function storageKey(email: string): string {
  return `${STORAGE_PREFIX}${email.toLowerCase()}`;
}

export function getPayments(email: string): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(storageKey(email));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addPayment(email: string, record: PaymentRecord): void {
  const next = [record, ...getPayments(email)].slice(0, 200);
  try {
    localStorage.setItem(storageKey(email), JSON.stringify(next));
  } catch {
    // localStorage can be unavailable (e.g. private-browsing quota) — the
    // payment itself already succeeded/failed regardless of whether we can
    // persist a local record of it.
  }
}
