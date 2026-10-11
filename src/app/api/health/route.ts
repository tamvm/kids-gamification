import { NextResponse } from "next/server";

import { getDb, schema } from "@/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  try {
    // Touch DB to confirm connectivity; do not seed or return inventory.
    getDb().select({ id: schema.profiles.id }).from(schema.profiles).limit(1).all();
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
