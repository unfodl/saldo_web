# Saldo Admin (admin-web)

A standalone React SPA (Vite + TypeScript + Tailwind) for admin user-management
and store-operator login. Unlike `saldo_web` (the Next.js app one level up),
this app has **no server of its own** — it calls bluto directly from the
browser and holds its own auth tokens client-side.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in VITE_BLUTO_API_URL if not using the default
npm run dev
```

## Structure

```
src/
  api/          fetch wrappers for bluto: config (base URL + endpoint paths),
                httpClient (generic JSON request helper), authApi, usersApi
  auth/         token-based auth context (one instance for admin, one for
                regular users) + route guards
  components/   shared UI (Button, TextField, Card, Modal, PinInput, Logo) —
                ported from saldo_web's design system
  pages/
    admin/      AdminLoginPage, AdminDashboardPage, AddUserForm
    user/       UserLoginPage, UserDashboardPage
  routes/       React Router route tree
  types/        shared request/response shapes
```

Layered by concern (api / auth / components / pages), not by feature — the
app is small enough that this stays flat and easy to navigate.

## Auth model

On successful login (admin or user), the token bluto returns is kept in
**sessionStorage** (cleared when the tab closes) and attached as
`Authorization: Bearer <token>` on every subsequent admin/user API call. A
real httpOnly cookie would be more resistant to XSS, but that requires the
token to be set by a same-origin server — this app talks to bluto directly
(a different origin), so the browser is the only place that can hold it.

## ⚠️ Unverified backend assumptions

Three things here are **guesses**, not confirmed against bluto's real behavior
— fix them in one place if they don't match:

1. **`src/api/config.ts` → `UNVERIFIED_ENDPOINTS.createUser`** — bluto has no
   documented "create user" endpoint anywhere accessible to this app. This
   guesses `POST /user/create` with `{ firstName, lastName, emailAddress, phoneNumber, pin }`.
2. **`src/api/authApi.ts` → `loginAdmin`** — the existing `saldo_web` app
   never reads bluto's admin-login response body; it only checks
   `response.ok`, because bluto's JWT there comes back as a cookie on
   bluto's own domain (unusable cross-origin by a plain SPA). This assumes
   bluto *also* returns `{ token: "..." }` in the JSON body. If it only sets
   that cookie, admin login will otherwise succeed but throw "no access
   token" — confirm the real shape and adjust.
3. **`src/api/config.ts` → `UNVERIFIED_ENDPOINTS.exchangeRate`**, used by
   `src/lib/exchangeRate.ts` — the pay-a-provider flow needs a MXN-to-USD
   rate. Calling saldo.mx's own exchange endpoint
   (`/Saldos/api/ripplev3/exchangeUSD/{mxn}`) directly from the browser is
   blocked by CORS (it sends no `Access-Control-Allow-Origin`), so this
   guesses a bluto passthrough at `GET /transaction/exchange-rate?mxn=`
   returning `{ usd: number }`. bluto needs to actually implement this
   (proxying saldo.mx's endpoint server-side) for the payment flow to work;
   confirm the real path/shape and adjust here if it differs.

Also: calling bluto directly from the browser (rather than proxying through
a same-origin server, as `saldo_web` does) requires bluto to send CORS
headers allowing this app's origin. If requests fail with a CORS error in
the browser console, that's a bluto-side config change, not a bug here.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — typecheck (`tsc -b`) + production build
- `npm run lint` — oxlint
- `npm run preview` — preview the production build locally
