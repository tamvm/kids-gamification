import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getDb, schema } from "@/db";

type Props = {
  params: Promise<{ profileId: string }>;
};

export default async function PlayProfilePage({ params }: Props) {
  const { profileId } = await params;
  const db = getDb();
  const profile = db
    .select({
      id: schema.profiles.id,
      name: schema.profiles.name,
      energy: schema.profiles.energy,
      coins: schema.profiles.coins,
      streak: schema.profiles.streak,
    })
    .from(schema.profiles)
    .where(eq(schema.profiles.id, profileId))
    .get();

  if (!profile) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <div className="space-y-2">
        <Link
          href="/"
          className="font-display text-sm font-semibold text-ink/60 hover:text-ink"
        >
          ← Choose explorer
        </Link>
        <h1 className="font-display text-4xl font-semibold text-ink">
          {profile.name}
        </h1>
        <p className="text-lg text-ink/80">
          Quiz and map UI coming next. Your stats are saved on the server.
        </p>
      </div>

      <dl className="grid gap-3 rounded-3xl bg-cream/75 p-6 shadow-sm sm:grid-cols-3">
        <div>
          <dt className="font-display text-sm font-semibold text-energy">
            Energy
          </dt>
          <dd className="text-2xl font-semibold text-ink">{profile.energy}</dd>
        </div>
        <div>
          <dt className="font-display text-sm font-semibold text-coin">Coins</dt>
          <dd className="text-2xl font-semibold text-ink">{profile.coins}</dd>
        </div>
        <div>
          <dt className="font-display text-sm font-semibold text-ink">
            Streak
          </dt>
          <dd className="text-2xl font-semibold text-ink">{profile.streak}</dd>
        </div>
      </dl>
    </main>
  );
}
