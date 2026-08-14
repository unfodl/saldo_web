import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getUsdcBalance } from "@/lib/crossmint/client";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const store = await db.store.findUnique({ where: { id: session.storeId } });
  if (!store?.crossmintWalletLocator) {
    return NextResponse.json({ error: "wallet_not_provisioned" }, { status: 409 });
  }

  try {
    const balance = await getUsdcBalance(store.crossmintWalletLocator);
    return NextResponse.json(balance);
  } catch {
    return NextResponse.json({ error: "balance_unavailable" }, { status: 502 });
  }
}
