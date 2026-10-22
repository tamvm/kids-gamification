export async function register() {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const { assertBootSecrets } = await import("./lib/learn/boot");
  assertBootSecrets();
}
