import { DEMO_PARENT } from "./demo-accounts";

/** Local demo fallback only. Never used outside localhost. */
const DEMO_SESSION_SECRET = "learn-play-demo-session";

export type BootEnv = Record<string, string | undefined>;

export type BootProblem = "session_secret" | "parent_password";

function hostnameOf(raw: string | undefined): string {
  const value = (raw ?? "").trim().toLowerCase();
  if (!value) return "";
  try {
    if (value.includes("://")) return new URL(value).hostname;
  } catch {
    // Not a URL. Fall through to host[:port].
  }
  const bare = value.replace(/^\[|\]$/g, "");
  return bare.split(":")[0] ?? "";
}

/**
 * Demo secrets are allowed only for local development and for an explicit
 * loopback PUBLIC_HOST (laptop Docker on 127.0.0.1). Production, including
 * any host that is not loopback, fails closed when PUBLIC_HOST is unset.
 */
export function isLocalBoot(env: BootEnv = process.env): boolean {
  if (env.NODE_ENV !== "production") return true;
  const host = hostnameOf(env.PUBLIC_HOST);
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

export function bootProblem(env: BootEnv = process.env): BootProblem | null {
  if (isLocalBoot(env)) return null;
  const secret = env.SESSION_SECRET?.trim() ?? "";
  if (!secret || secret === DEMO_SESSION_SECRET) return "session_secret";
  const password = env.PARENT_PASSWORD?.trim() ?? "";
  if (!password || password === DEMO_PARENT.password) return "parent_password";
  return null;
}

export function assertBootSecrets(env: BootEnv = process.env): void {
  const problem = bootProblem(env);
  if (problem === "session_secret") {
    throw new Error(
      "Refusing to boot: set SESSION_SECRET to a unique value. The demo session secret is localhost-only.",
    );
  }
  if (problem === "parent_password") {
    throw new Error(
      "Refusing to boot: set PARENT_PASSWORD to a unique value. The demo parent password is localhost-only.",
    );
  }
}

export function resolveSessionSecret(env: BootEnv = process.env): string {
  assertBootSecrets(env);
  const secret = env.SESSION_SECRET?.trim();
  if (secret) return secret;
  return DEMO_SESSION_SECRET;
}

export function resolveParentPassword(env: BootEnv = process.env): string {
  assertBootSecrets(env);
  const password = env.PARENT_PASSWORD?.trim();
  if (password) return password;
  return DEMO_PARENT.password;
}

/** Secure cookies outside localhost. Local HTTP (dev and 127.0.0.1) stays unset. */
export function sessionCookieSecure(env: BootEnv = process.env): boolean {
  return !isLocalBoot(env);
}
