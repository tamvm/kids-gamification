import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

import { resolveSessionSecret } from "./boot";

const DUMMY_HASH = `${"ab".repeat(16)}:${"cd".repeat(32)}`;

export function hashSecret(secret: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(secret, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifySecret(secret: string, stored: string | null): boolean {
  const value = stored && stored.includes(":") ? stored : DUMMY_HASH;
  const [salt, hash] = value.split(":");
  if (!salt || !hash || !/^[0-9a-f]+$/i.test(salt) || !/^[0-9a-f]+$/i.test(hash)) {
    return false;
  }
  const next = scryptSync(secret, salt, 32);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  const ok = timingSafeEqual(next, prev);
  return Boolean(stored) && ok;
}

export type Session =
  | { role: "parent"; exp: number }
  | { role: "kid"; profileId: string; exp: number };

export function sessionSecret(): string {
  return resolveSessionSecret();
}

export function signSession(session: Session, secret = sessionSecret()): string {
  const body = Buffer.from(JSON.stringify(session)).toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function readToken(
  token: string | undefined,
  now = Date.now(),
  secret = sessionSecret(),
): Session | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString()) as Session;
    if (!parsed || typeof parsed.exp !== "number" || parsed.exp < now) return null;
    if (parsed.role === "parent") return { role: "parent", exp: parsed.exp };
    if (parsed.role === "kid" && typeof parsed.profileId === "string") {
      return { role: "kid", profileId: parsed.profileId, exp: parsed.exp };
    }
  } catch {
    return null;
  }
  return null;
}
