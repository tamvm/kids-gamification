import Link from "next/link";

import { logout } from "@/app/auth-actions";
import { requireParent } from "@/lib/learn/session";

export const dynamic = "force-dynamic";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  await requireParent();
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink/60">Parent Corner</p>
          <Link href="/parent" className="font-display text-4xl font-semibold text-ink">
            Learn and play
          </Link>
        </div>
        <form action={logout}>
          <button type="submit" className="rounded-2xl bg-white px-4 py-2 font-bold text-ink">
            Log out
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}
