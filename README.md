# Saldo Web

A web app for store operators to pay billers (CFE, Telmex, Sky, Infonavit, cable, gas) and phone recharges (AT&T, Telcel) without leaving the browser. Each store holds an **embedded, non-custodial-to-Crossmint Stellar wallet** funded in USDC — operators log in, enter a bill amount in MXN, and the app converts it to USDC and settles the payment on Stellar directly from that wallet, no external wallet app or crypto knowledge required.

## How it works

- **Login**: operator email is verified against Saldo's own auth service; a PIN gates the actual payment step.
- **Pay flow**: pick a category (Servicios / Recargas) → pick a company → enter a reference + MXN amount → confirm with PIN. The MXN amount is converted to USD/USDC live via Saldo's exchange rate API and shown before confirming.
- **Wallet**: each store has one Crossmint smart wallet on Stellar, signed server-side (a "server signer" derived from a secret only this app holds — Crossmint itself never sees it). Operators never manage keys.
- **History**: every payment attempt (success or failure) is logged with both the MXN amount entered and the USDC amount actually transferred, plus a link to the transaction on Stellar Expert.

## Stack

Next.js (App Router) + TypeScript + Tailwind, Postgres via Prisma, Crossmint's `@crossmint/wallets-sdk` for the Stellar wallet, bcrypt-hashed PINs, signed session cookies.

## Running it locally

1. **Env vars** — copy `.env.example` to `.env` and fill in `DATABASE_URL`, `CROSSMINT_API_KEY`, and `CROSSMINT_SIGNER_SECRET` (generate the latter with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
2. **Database** — point `DATABASE_URL` at a Postgres instance, then:
   ```bash
   npm install
   npx prisma migrate dev
   npm run db:seed
   ```
3. **Provision the store's wallet** (one-time, needs a real Crossmint key):
   ```bash
   npm run wallet:create -- demo-store
   ```
4. **Run the app**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) and log in as the operator created by the seed script (see `prisma/seed.ts`).

## Tests

```bash
npm run test
```
