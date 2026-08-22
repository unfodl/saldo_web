# Saldo Web

Store-operator payments web app (Next.js App Router). Operators log in with their
store email, verified against Saldo's auth service (bluto), then send USDC
payments to companies from the store's Crossmint wallet.

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in the values — see comments there
for what each variable is for. `BLUTO_API_URL` defaults to
`http://localhost:8081/native/api`, so run a local `bluto` instance on port
8081 for login to work in development.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm start` — production build/start
- `npm run lint` — eslint
- `npm test` — vitest
- `npm run wallet:create -- <storeId>` — provision a Crossmint wallet for a store

## Data

Store/Operator/Company/Payment data lives in Postgres via Prisma
(`prisma/schema.prisma`). Login/session verification calls the external bluto
server (`src/lib/auth/bluto.ts`) instead of checking a password locally.
