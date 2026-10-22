import assert from "node:assert/strict";
import test from "node:test";

import { DEMO_PARENT } from "./demo-accounts";
import {
  bootProblem,
  isLocalBoot,
  sessionCookieSecure,
} from "./boot";

const DEMO_SESSION = "learn-play-demo-session";

test("development boots with demo fallbacks and a non-secure cookie", () => {
  const env = { NODE_ENV: "development" };
  assert.equal(isLocalBoot(env), true);
  assert.equal(bootProblem(env), null);
  assert.equal(sessionCookieSecure(env), false);
});

test("loopback PUBLIC_HOST is local even when NODE_ENV is production", () => {
  const env = { NODE_ENV: "production", PUBLIC_HOST: "127.0.0.1" };
  assert.equal(isLocalBoot(env), true);
  assert.equal(bootProblem(env), null);
  assert.equal(sessionCookieSecure(env), false);
});

test("production without a loopback host refuses missing or demo secrets", () => {
  const hosts = [undefined, "kids.kenchange.com", "https://kids.kenchange.com"];
  for (const PUBLIC_HOST of hosts) {
    const missing = { NODE_ENV: "production", PUBLIC_HOST };
    assert.equal(isLocalBoot(missing), false);
    assert.equal(bootProblem(missing), "session_secret");
    assert.equal(sessionCookieSecure(missing), true);

    const demoSecret = {
      NODE_ENV: "production",
      PUBLIC_HOST,
      SESSION_SECRET: DEMO_SESSION,
      PARENT_PASSWORD: "unique-parent-password",
    };
    assert.equal(bootProblem(demoSecret), "session_secret");

    const demoPassword = {
      NODE_ENV: "production",
      PUBLIC_HOST,
      SESSION_SECRET: "unique-session-secret",
      PARENT_PASSWORD: DEMO_PARENT.password,
    };
    assert.equal(bootProblem(demoPassword), "parent_password");
  }
});

test("production boots when both secrets are unique", () => {
  const env = {
    NODE_ENV: "production",
    PUBLIC_HOST: "kids.kenchange.com",
    SESSION_SECRET: "unique-session-secret",
    PARENT_PASSWORD: "unique-parent-password",
  };
  assert.equal(bootProblem(env), null);
  assert.equal(sessionCookieSecure(env), true);
});
