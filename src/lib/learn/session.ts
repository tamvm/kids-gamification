import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { readToken, signSession, type Session } from "./auth-crypto";
import { sessionCookieSecure } from "./boot";

const COOKIE = "lp_session";
const MAX_AGE = 8 * 60 * 60;

export async function readSession(): Promise<Session | null> {
  const jar = await cookies();
  return readToken(jar.get(COOKIE)?.value);
}

export async function setSession(session: Session) {
  const jar = await cookies();
  jar.set(COOKIE, signSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: sessionCookieSecure(),
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export function sessionExpiry(): number {
  return Date.now() + MAX_AGE * 1000;
}

export async function requireKid(): Promise<{ profileId: string }> {
  const session = await readSession();
  if (!session || session.role !== "kid") redirect("/");
  return { profileId: session.profileId };
}

export async function requireParent(): Promise<void> {
  const session = await readSession();
  if (session?.role === "kid") redirect("/kid");
  if (!session || session.role !== "parent") redirect("/parent/login");
}
