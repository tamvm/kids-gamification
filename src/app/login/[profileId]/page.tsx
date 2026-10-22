import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { loginKid } from "@/app/auth-actions";
import { PinPad } from "@/components/learn/pin-pad";
import { avatarByKey } from "@/lib/learn/avatars";
import { readSession } from "@/lib/learn/session";
import { listLearnProfiles } from "@/lib/learn/store";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const session = await readSession();
  if (session?.role === "kid") redirect("/kid");
  if (session?.role === "parent") redirect("/parent");

  const { profileId } = await params;
  const profile = listLearnProfiles().find((row) => row.id === profileId);
  if (!profile) notFound();
  const avatar = avatarByKey(profile.avatarKey);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <Link href="/" className="font-semibold text-ink/70">
        All pictures
      </Link>
      <PinPad
        profileId={profile.id}
        name={profile.name}
        emoji={avatar.emoji}
        action={loginKid}
      />
    </main>
  );
}
