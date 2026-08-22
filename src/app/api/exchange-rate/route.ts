import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { convertMxnToUsd } from "@/lib/exchangeRate";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const mxn = Number(request.nextUrl.searchParams.get("mxn"));
  if (!Number.isFinite(mxn) || mxn <= 0) {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }

  try {
    const usd = await convertMxnToUsd(mxn);
    return NextResponse.json({ usd });
  } catch {
    return NextResponse.json({ error: "exchange_rate_unavailable" }, { status: 502 });
  }
}
