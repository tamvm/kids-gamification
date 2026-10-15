import { asc } from "drizzle-orm";
import Link from "next/link";

import { getDb, schema } from "@/db";

export const dynamic = "force-dynamic";

export default function Home() {
  const db = getDb();
  const profiles = db
    .select({
      id: schema.profiles.id,
      name: schema.profiles.name,
      ageBand: schema.profiles.ageBand,
      energy: schema.profiles.energy,
      coins: schema.profiles.coins,
    })
    .from(schema.profiles)
    .orderBy(asc(schema.profiles.name))
    .all();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-8 px-6 py-12">
      <div className="space-y-4 text-center sm:text-left">
        <p className="font-display text-sm font-semibold tracking-wide text-ink/70 uppercase">
          Family learning portal
        </p>
        <h1 className="font-display text-5xl leading-tight font-semibold text-ink sm:text-6xl">
          Kids Quest
        </h1>
        <p className="max-w-xl text-lg text-ink/85">
          Answer questions to earn energy. Explore the map. Pick up coins for the
          shop. Math, writing, and chess — each explorer has their own adventure.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-ink">
          Choose your explorer
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          {profiles.map((profile) => (
            <Link
              key={profile.id}
              href={`/play/${profile.id}`}
              className="flex flex-1 flex-col rounded-2xl border-2 border-ink/15 bg-cream/70 px-6 py-4 text-left shadow-sm transition hover:border-ink/30 hover:bg-cream"
            >
              <span className="font-display text-xl font-semibold text-ink">
                {profile.name}
              </span>
              <span className="text-sm text-ink/70 capitalize">
                {profile.ageBand} explorer
              </span>
              <span className="mt-2 text-sm text-ink/80">
                {profile.energy} energy · {profile.coins} coins
              </span>
            </Link>
          ))}
        </div>
      </section>

      <dl className="grid gap-3 rounded-3xl bg-cream/75 p-6 text-left shadow-sm backdrop-blur-sm sm:grid-cols-3">
        <div>
          <dt className="font-display text-sm font-semibold text-energy">
            Energy
          </dt>
          <dd className="text-sm text-ink/80">From correct answers → move</dd>
        </div>
        <div>
          <dt className="font-display text-sm font-semibold text-coin">Coins</dt>
          <dd className="text-sm text-ink/80">Map pickups → shop later</dd>
        </div>
        <div>
          <dt className="font-display text-sm font-semibold text-ink">
            Profiles
          </dt>
          <dd className="text-sm text-ink/80">Little &amp; Big Explorers</dd>
        </div>
      </dl>
    </main>
  );
}
