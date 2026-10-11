import Link from "next/link";

export default function Home() {
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/api/health"
          className="inline-flex items-center justify-center rounded-2xl bg-ink px-6 py-4 text-center text-lg font-semibold text-cream shadow-md transition hover:scale-[1.02]"
        >
          Check API health
        </Link>
        <span className="inline-flex items-center justify-center rounded-2xl border-2 border-ink/15 bg-cream/70 px-6 py-4 text-lg font-semibold text-ink/70">
          Profiles &amp; map coming next
        </span>
      </div>

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
