import { count } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb, schema } from "@/db";
import { seedIfEmpty } from "@/db/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  try {
    seedIfEmpty();
    const db = getDb();
    const [{ value: profiles }] = db
      .select({ value: count() })
      .from(schema.profiles)
      .all();
    const [{ value: subjects }] = db
      .select({ value: count() })
      .from(schema.subjects)
      .all();

    return NextResponse.json({
      status: "ok",
      database: process.env.DATABASE_PATH ?? "data/app.db",
      profiles,
      subjects,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
