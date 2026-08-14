import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getWalletBalances } from "@/lib/crossmint/client";
import { isStagingEnvironment } from "@/lib/crossmint/config";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const store = await db.store.findUnique({ where: { id: session.storeId } });
  if (!store?.crossmintWalletAddress) {
    return NextResponse.json({ error: "wallet_not_provisioned" }, { status: 409 });
  }

  try {
    const balances = await getWalletBalances(store.crossmintWalletAddress);
    return NextResponse.json({
      address: store.crossmintWalletAddress,
      isStaging: isStagingEnvironment(),
      ...balances,
    });
  } catch {
    return NextResponse.json({ error: "balance_unavailable" }, { status: 502 });
  }
}
