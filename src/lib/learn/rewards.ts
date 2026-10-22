/** Pure star → minute rules. Decorative end-of-round stars never enter here. */

export const STAR_TO_MINUTES = 1;
export const MASTERY_CORRECT = 8;
export const ROUND_SIZE = 10;
export const MASTERY_BONUS_STARS = 5;
export const DEFAULT_DAILY_CAP_MINUTES = 15;
export const PLAY_BLOCK_MINUTES = 5;

export type TryResult = "first" | "later" | "reveal";

export function starsForTry(result: TryResult): number {
  return result === "first" ? 1 : 0;
}

export function masteryBonus(
  firstTryCorrect: number,
  questionCount: number,
): number {
  if (questionCount !== ROUND_SIZE) return 0;
  if (firstTryCorrect >= MASTERY_CORRECT) return MASTERY_BONUS_STARS;
  return 0;
}

export function minutesFromStars(stars: number): number {
  return stars * STAR_TO_MINUTES;
}

export type RoundGrant = {
  scored: boolean;
  earnCorrect: number;
  earnMastery: number;
  minutesPending: number;
};

/** Finished scored rounds write the ledger. Practice, unfinished, and later rounds do not. */
export function grantForRound(input: {
  firstTryCorrect: number;
  questionCount: number;
  countsForStars: boolean;
  finished: boolean;
}): RoundGrant {
  if (!input.finished || !input.countsForStars) {
    return { scored: false, earnCorrect: 0, earnMastery: 0, minutesPending: 0 };
  }
  const earnCorrect = input.firstTryCorrect;
  const earnMastery = masteryBonus(input.firstTryCorrect, input.questionCount);
  return {
    scored: true,
    earnCorrect,
    earnMastery,
    minutesPending: minutesFromStars(earnCorrect + earnMastery),
  };
}

/** On-screen fun stars from the practice page. Not game time. */
export function decorativeStars(solvedOutOf10: number): number {
  if (solvedOutOf10 >= 9) return 3;
  if (solvedOutOf10 >= 6) return 2;
  return 1;
}

export type GrantStatus = "pending" | "approved" | "declined";

export type Grant = {
  id: string;
  status: GrantStatus;
  minutes: number;
  minutesSpent: number;
};

export function approvedRemaining(grants: Grant[]): number {
  return grants
    .filter((g) => g.status === "approved")
    .reduce((sum, g) => sum + Math.max(0, g.minutes - g.minutesSpent), 0);
}

export function pendingMinutes(grants: Grant[]): number {
  return grants
    .filter((g) => g.status === "pending")
    .reduce((sum, g) => sum + Math.max(0, g.minutes), 0);
}

export type PlayBlockDecision =
  | { ok: true; block: number }
  | { ok: false; reason: "daily_cap" | "not_enough_minutes" | "block_invalid" };

/**
 * A play block needs enough approved minutes and room under today's cap.
 * Approved minutes carry across days. The cap does not.
 * Pending grants are not usable until a parent approves them.
 */
export function decidePlayBlock(input: {
  grants: Grant[];
  playedToday: number;
  dailyCap: number;
  block?: number;
}): PlayBlockDecision {
  const block = input.block ?? PLAY_BLOCK_MINUTES;
  if (!Number.isInteger(block) || block <= 0) {
    return { ok: false, reason: "block_invalid" };
  }
  if (input.dailyCap - input.playedToday < block) {
    return { ok: false, reason: "daily_cap" };
  }
  if (approvedRemaining(input.grants) < block) {
    return { ok: false, reason: "not_enough_minutes" };
  }
  return { ok: true, block };
}

/** Deduct a block from approved grants, oldest first. There is no refund helper. */
export function applySpend(grants: Grant[], block: number): Grant[] {
  let left = block;
  return grants.map((g) => {
    if (g.status !== "approved" || left <= 0) return { ...g };
    const room = Math.max(0, g.minutes - g.minutesSpent);
    const take = Math.min(room, left);
    left -= take;
    return { ...g, minutesSpent: g.minutesSpent + take };
  });
}

export function adjustGrantMinutes(
  grant: Grant,
  nextMinutes: number,
):
  | { ok: true; minutes: number }
  | { ok: false; reason: "below_spent" | "negative" | "not_integer" } {
  if (!Number.isInteger(nextMinutes)) return { ok: false, reason: "not_integer" };
  if (nextMinutes < 0) return { ok: false, reason: "negative" };
  if (nextMinutes < grant.minutesSpent) return { ok: false, reason: "below_spent" };
  return { ok: true, minutes: nextMinutes };
}

export function declineGrant(grants: Grant[], grantId: string): Grant[] {
  return grants.map((g) =>
    g.id === grantId && g.status === "pending"
      ? { ...g, status: "declined" }
      : g,
  );
}
