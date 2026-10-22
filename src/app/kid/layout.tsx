import Link from "next/link";
import { redirect } from "next/navigation";

import { logout } from "@/app/auth-actions";
import { avatarByKey } from "@/lib/learn/avatars";
import { requireKid } from "@/lib/learn/session";
import { kidHome } from "@/lib/learn/store";

export const dynamic = "force-dynamic";

export default async function KidLayout({ children }: { children: React.ReactNode }) {
  const { profileId } = await requireKid();
  const home = kidHome(profileId);
  if (!home) redirect("/");
  const avatar = avatarByKey(home.profile.avatarKey);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] bg-white/80 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-ink/60">Learn and play</p>
          <p className="font-display text-3xl font-semibold text-ink">
            <span aria-hidden="true">{avatar.emoji} </span>
            {home.profile.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-ink">
          <span className="rounded-full bg-amber-100 px-3 py-2">Stars {home.stars}</span>
          <span className="rounded-full bg-emerald-100 px-3 py-2">Ready {home.readyMinutes} min</span>
          <span className="rounded-full bg-sky-100 px-3 py-2">Waiting {home.pendingMinutes} min</span>
          <span className="rounded-full bg-white px-3 py-2">
            Today {home.playedToday}/{home.profile.dailyCapMinutes} min
          </span>
        </div>
        <nav className="flex items-center gap-4 text-sm font-bold text-ink">
          <Link href="/kid">Courses</Link>
          <Link href="/kid/play">Game</Link>
          <form action={logout}>
            <button type="submit" className="underline">
              Switch
            </button>
          </form>
        </nav>
      </header>
      {children}
    </div>
  );
}
