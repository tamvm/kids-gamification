"use server";

import { redirect } from "next/navigation";

import { kidPinMatches, parentPasswordMatches } from "@/lib/learn/store";
import { clearSession, sessionExpiry, setSession } from "@/lib/learn/session";

export async function loginKid(
  _prev: { error: string },
  formData: FormData,
): Promise<{ error: string }> {
  const profileId = String(formData.get("profileId") ?? "");
  const pin = String(formData.get("pin") ?? "");
  if (!kidPinMatches(profileId, pin)) {
    return { error: "That PIN does not match this picture." };
  }
  await setSession({ role: "kid", profileId, exp: sessionExpiry() });
  redirect("/kid");
}

export async function loginParent(
  _prev: { error: string },
  formData: FormData,
): Promise<{ error: string }> {
  const password = String(formData.get("password") ?? "");
  if (!parentPasswordMatches(password)) {
    return { error: "That password does not match." };
  }
  await setSession({ role: "parent", exp: sessionExpiry() });
  redirect("/parent");
}

export async function logout() {
  await clearSession();
  redirect("/");
}
