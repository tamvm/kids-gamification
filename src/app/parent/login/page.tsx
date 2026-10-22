import Link from "next/link";
import { redirect } from "next/navigation";

import { ParentLoginForm } from "@/components/learn/parent-login";
import { readSession } from "@/lib/learn/session";

export const dynamic = "force-dynamic";

export default async function ParentLoginPage() {
  const session = await readSession();
  if (session?.role === "parent") redirect("/parent");
  if (session?.role === "kid") redirect("/kid");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-6 py-12">
      <Link href="/" className="font-semibold text-ink/70">
        Pictures
      </Link>
      <h1 className="font-display text-5xl font-semibold text-ink">Parent Corner</h1>
      <p className="text-lg text-ink/80">A password is required. Kid PINs do not open this page.</p>
      <ParentLoginForm />
    </main>
  );
}
