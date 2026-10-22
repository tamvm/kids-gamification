"use server";

import { redirect } from "next/navigation";

import { requireKid } from "@/lib/learn/session";
import {
  applyAttempt,
  beginPlay,
  createRound,
  LearnError,
  parseAttempt,
  playSnapshot,
} from "@/lib/learn/store";
import type { PlayState } from "@/lib/learn/types";

export async function startRound(formData: FormData) {
  const { profileId } = await requireKid();
  const courseId = String(formData.get("courseId") ?? "");
  const mode = String(formData.get("mode") ?? "quiz");
  try {
    createRound(profileId, courseId, mode);
  } catch (error) {
    if (error instanceof LearnError) redirect(`/kid/course/${courseId}?e=1`);
    throw error;
  }
  redirect(`/kid/course/${courseId}`);
}

export async function submitAttempt(
  roundId: string,
  itemId: string,
  attempt: unknown,
): Promise<PlayState> {
  const { profileId } = await requireKid();
  const parsed = parseAttempt(attempt);
  if (!parsed) throw new LearnError("That answer could not be read.");
  return applyAttempt(profileId, roundId, itemId, parsed);
}

export async function startGame() {
  const { profileId } = await requireKid();
  try {
    beginPlay(profileId);
  } catch (error) {
    if (error instanceof LearnError) redirect("/kid/play?e=1");
    throw error;
  }
  redirect("/kid/play");
}

export async function gameClock(): Promise<{
  serverNow: string;
  endsAt: string | null;
  ended: boolean;
}> {
  const { profileId } = await requireKid();
  const snap = playSnapshot(profileId);
  return {
    serverNow: new Date().toISOString(),
    endsAt: snap?.active?.endsAt ?? null,
    ended: !snap?.active,
  };
}
