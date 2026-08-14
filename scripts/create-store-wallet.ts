/**
 * Provisions a Crossmint Stellar smart wallet (server signer, derived from
 * CROSSMINT_SIGNER_SECRET) for a store and records the address on the Store row.
 *
 * Usage: npm run wallet:create -- <storeId>
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createStoreWallet } from "../src/lib/crossmint/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const storeId = process.argv[2];
  if (!storeId) {
    console.error("Usage: npm run wallet:create -- <storeId>");
    process.exit(1);
  }

  const store = await db.store.findUnique({ where: { id: storeId } });
  if (!store) {
    console.error(`No store found with id "${storeId}"`);
    process.exit(1);
  }

  if (store.crossmintWalletLocator) {
    console.log(`Store "${store.name}" already has a wallet: ${store.crossmintWalletLocator}`);
    return;
  }

  const alias = `store-${store.id}`;
  console.log(`Creating Stellar smart wallet for "${store.name}" (alias: ${alias})...`);
  const wallet = await createStoreWallet(alias);

  await db.store.update({
    where: { id: store.id },
    data: {
      crossmintWalletLocator: wallet.locator,
      crossmintWalletAddress: wallet.address,
    },
  });

  console.log(`Wallet created. Locator: ${wallet.locator}, address: ${wallet.address}`);
  console.log("Fund this address with USDC on Stellar before taking real payments.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
