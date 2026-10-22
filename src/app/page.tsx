import Link from "next/link";
import { redirect } from "next/navigation";

import { avatarByKey } from "@/lib/learn/avatars";
import { readSession } from "@/lib/learn/session";
import { listLearnProfiles } from "@/lib/learn/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await readSession();
  if (session?.role === "kid") redirect("/kid");
  if (session?.role === "parent") redirect("/parent");

  const profiles = listLearnProfiles();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-8 px-6 py-12">
      <div className="space-y-3 text-center">
        <p className="font-display text-sm font-semibold tracking-wide text-ink/70 uppercase">
          Learn and play
        </p>
        <h1 className="font-display text-5xl font-semibold text-ink">Pick your picture</h1>
        <p className="text-lg text-ink/80">Then enter your PIN.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {profiles.map((profile) => {
          const avatar = avatarByKey(profile.avatarKey);
          return (
            <Link
              key={profile.id}
              href={`/login/${profile.id}`}
              className="flex flex-col items-center gap-2 rounded-[28px] bg-white/85 px-6 py-8 text-center shadow-sm"
            >
              <span className="text-7xl" aria-hidden="true">
                {avatar.emoji}
              </span>
              <span className="font-display text-3xl font-semibold text-ink">{profile.name}</span>
              <span className="text-ink/70">{avatar.label}</span>
            </Link>
          );
        })}
      </div>
      <p className="text-center">
        <Link href="/parent/login" className="text-sm font-semibold text-ink/70 underline">
          Parent Corner
        </Link>
      </p>
    </main>
  );
}
