import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { fundStoreWalletStaging, getWalletBalances } from "@/lib/crossmint/client";
import { isStagingEnvironment } from "@/lib/crossmint/config";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isStagingEnvironment()) {
    return NextResponse.json({ error: "staging_only" }, { status: 403 });
  }

  const store = await db.store.findUnique({ where: { id: session.storeId } });
  if (!store?.crossmintWalletAddress) {
    return NextResponse.json({ error: "wallet_not_provisioned" }, { status: 409 });
  }

  const body = await request.json().catch(() => null);
  const amount = Number(body?.amount);
  if (!Number.isFinite(amount) || amount < 1 || amount > 100) {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }

  try {
    await fundStoreWalletStaging(store.crossmintWalletAddress, amount);
    const balances = await getWalletBalances(store.crossmintWalletAddress);
    return NextResponse.json(balances);
  } catch {
    return NextResponse.json({ error: "fund_failed" }, { status: 502 });
  }
}
