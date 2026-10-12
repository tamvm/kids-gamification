import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb, schema } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const rows = db
    .select({
      id: schema.profiles.id,
      name: schema.profiles.name,
      avatarKey: schema.profiles.avatarKey,
      ageBand: schema.profiles.ageBand,
      energy: schema.profiles.energy,
      coins: schema.profiles.coins,
      streak: schema.profiles.streak,
    })
    .from(schema.profiles)
    .orderBy(asc(schema.profiles.name))
    .all();

  return NextResponse.json({ profiles: rows });
}
