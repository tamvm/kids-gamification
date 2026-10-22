/**
 * Fake local demo logins. Documented in the README. Not real secrets.
 * Hashed before they are stored. Never log these values.
 */
export const DEMO_PARENT = {
  id: "parent-demo",
  displayName: "Demo parent",
  password: "demo-parent",
} as const;

export const DEMO_PROFILES = [
  {
    id: "profile-celine-demo",
    name: "Celine (demo)",
    avatarKey: "owl",
    pin: "2580",
    yearLevel: "2",
    ageBand: "big",
    dailyCapMinutes: 15,
  },
  {
    id: "profile-test-child",
    name: "Test Child",
    avatarKey: "fox",
    pin: "1470",
    yearLevel: null,
    ageBand: "little",
    dailyCapMinutes: 15,
  },
] as const;

export const CELINE_DEMO_ID = DEMO_PROFILES[0].id;
