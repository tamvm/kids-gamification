import Link from "next/link";

import { startGame } from "@/app/kid/actions";
import { MemoryGame } from "@/components/learn/memory-game";
import { requireKid } from "@/lib/learn/session";
import { playSnapshot } from "@/lib/learn/store";

export const dynamic = "force-dynamic";

export default async function PlayPage() {
  const { profileId } = await requireKid();
  const snap = playSnapshot(profileId);
  if (!snap) return null;

  if (snap.active) {
    return (
      <main className="flex flex-col gap-4">
        <p className="text-ink/80">
          {snap.active.minutes} minutes were used at Start. Leaving this page does not put them back.
          This game does not add stars.
        </p>
        <MemoryGame endsAt={snap.active.endsAt} serverNow={snap.active.serverNow} />
        <Link href="/kid" className="font-bold text-ink">
          Back to courses
        </Link>
      </main>
    );
  }

  const reason =
    snap.reason === "daily_cap"
      ? "Today's cap is full. Leftover minutes can wait until tomorrow."
      : snap.reason === "not_enough_minutes"
        ? "Ask a grown-up to approve stars before play time can start."
        : null;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-[28px] bg-white/90 p-6">
      <h2 className="font-display text-4xl font-semibold text-ink">Memory match</h2>
      <p className="text-lg text-ink/80">
        Coins and clocks. A block is {snap.block} minutes. The minutes come off when you press Start.
      </p>
      <p className="font-semibold text-ink">
        Ready {snap.readyMinutes} min · today {snap.playedToday}/{snap.profile.dailyCapMinutes} min
      </p>
      {reason ? <p className="rounded-2xl bg-amber-100 px-4 py-3 text-ink">{reason}</p> : null}
      <form action={startGame}>
        <button
          type="submit"
          disabled={!snap.canStart}
          className="min-h-16 w-full rounded-2xl bg-emerald-700 text-2xl font-bold text-white disabled:opacity-50"
        >
          Start {snap.block} minutes
        </button>
      </form>
    </main>
  );
}
