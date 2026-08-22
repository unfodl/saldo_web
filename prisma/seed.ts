import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPin } from "../src/lib/auth/pin";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Placeholder Stellar addresses (correct length/format, not real accounts).
// Replace with each company's real USDC-receiving Stellar address before go-live.
const PLACEHOLDER_ADDRESS = (tag: string) =>
  `G${tag.toUpperCase().padEnd(55, "0")}`.slice(0, 56);

const COMPANIES = [
  { name: "CFE", logoKey: "cfe", category: "SERVICIOS" as const, group: null },
  { name: "Telmex", logoKey: "telmex", category: "SERVICIOS" as const, group: null },
  { name: "Sky", logoKey: "sky", category: "SERVICIOS" as const, group: null },
  { name: "Infonavit", logoKey: "infonavit", category: "SERVICIOS" as const, group: null },
  { name: "Dish", logoKey: "dish", category: "SERVICIOS" as const, group: "Compañías de Cable" },
  { name: "Izzi", logoKey: "izzi", category: "SERVICIOS" as const, group: "Compañías de Cable" },
  { name: "Megacable", logoKey: "megacable", category: "SERVICIOS" as const, group: "Compañías de Cable" },
  { name: "Ecogas", logoKey: "ecogas", category: "SERVICIOS" as const, group: "Compañías de Gas" },
  { name: "Maxigas", logoKey: "maxigas", category: "SERVICIOS" as const, group: "Compañías de Gas" },
  { name: "Gas Natural", logoKey: "gasnatural", category: "SERVICIOS" as const, group: "Compañías de Gas" },
  { name: "AT&T", logoKey: "att", category: "RECARGAS" as const, group: null },
  { name: "Telcel", logoKey: "telcel", category: "RECARGAS" as const, group: null },
];

async function main() {
  const store = await db.store.upsert({
    where: { id: "demo-store" },
    update: {},
    create: {
      id: "demo-store",
      name: "Saldo Demo Store",
    },
  });

  await db.operator.upsert({
    where: { email: "info@saldo.mx" },
    update: {},
    create: {
      email: "info@saldo.mx",
      pinHash: await hashPin("1234"),
      role: "OPERATOR",
      storeId: store.id,
    },
  });

  for (const company of COMPANIES) {
    await db.company.upsert({
      where: { id: company.logoKey },
      update: { category: company.category, group: company.group },
      create: {
        id: company.logoKey,
        name: company.name,
        logoKey: company.logoKey,
        category: company.category,
        group: company.group,
        receivingAddress: PLACEHOLDER_ADDRESS(company.logoKey),
      },
    });
  }

  console.log("Seeded demo store, operator (info@saldo.mx / PIN 1234), and companies.");
  console.log(
    "Store wallet not yet provisioned — run `npm run wallet:create -- demo-store` once CROSSMINT_API_KEY is set.",
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
