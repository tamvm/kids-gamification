export const AVATARS = [
  { key: "owl", emoji: "🦉", label: "Owl" },
  { key: "fox", emoji: "🦊", label: "Fox" },
  { key: "koala", emoji: "🐨", label: "Koala" },
  { key: "kangaroo", emoji: "🦘", label: "Kangaroo" },
  { key: "penguin", emoji: "🐧", label: "Penguin" },
  { key: "tiger", emoji: "🐯", label: "Tiger" },
  { key: "frog", emoji: "🐸", label: "Frog" },
  { key: "panda", emoji: "🐼", label: "Panda" },
] as const;

export type AvatarKey = (typeof AVATARS)[number]["key"];

export function avatarByKey(key: string) {
  return AVATARS.find((a) => a.key === key) ?? AVATARS[0];
}

export function isAvatarKey(key: string): key is AvatarKey {
  return AVATARS.some((a) => a.key === key);
}
