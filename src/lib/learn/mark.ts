import { moneyLabel } from "./money-format";
import type { Attempt, Secret } from "./types";

export type MarkOutcome = "first" | "later" | "reveal" | "try" | "nudge";

export type MarkResult = {
  outcome: MarkOutcome;
  tries: number;
  resolved: boolean;
  revealed: boolean;
  message: string;
  correctOptionId?: string;
  revealClock?: { h: number; m: number };
  revealPurse?: number[];
};

const PRAISE = "Great job!";

export function numericMatch(given: string, accepted: string[]): boolean {
  const g = given.trim();
  if (!g || g.length > 20) return false;
  if (accepted.some((a) => a.trim() === g)) return true;
  if (!/^-?\d+(\.\d+)?$/.test(g)) return false;
  const gn = Number(g);
  if (!Number.isFinite(gn)) return false;
  return accepted.some((a) => {
    const t = a.trim();
    if (!/^-?\d+(\.\d+)?$/.test(t)) return false;
    return Number(t) === gn;
  });
}

function revealResult(secret: Secret, tries: number): MarkResult {
  const extra = secret.explain ? ` ${secret.explain}` : "";
  return {
    outcome: "reveal",
    tries,
    resolved: true,
    revealed: true,
    message: `Good try. The answer is ${secret.label}.${extra} This one does not add a star.`,
    correctOptionId: secret.correctOptionId,
    revealClock: secret.clock,
    revealPurse: secret.purse,
  };
}

function tryResult(tries: number, message: string): MarkResult {
  return {
    outcome: "try",
    tries,
    resolved: false,
    revealed: false,
    message,
  };
}

function nudge(tries: number, message: string): MarkResult {
  return {
    outcome: "nudge",
    tries,
    resolved: false,
    revealed: false,
    message,
  };
}

function correctResult(
  triesSoFar: number,
  message: string,
  secret: Secret,
): MarkResult {
  return {
    outcome: triesSoFar === 0 ? "first" : "later",
    tries: triesSoFar,
    resolved: true,
    revealed: false,
    message,
    correctOptionId: secret.correctOptionId,
  };
}

function clockHint(
  target: { h: number; m: number },
  current: { h: number; m: number },
  base: string,
): string {
  if (current.h === target.h && current.m !== target.m) {
    return `The short hour hand is right. Now check the long minute hand. ${base}`;
  }
  if (current.m === target.m && current.h !== target.h) {
    const extra =
      target.m > 30
        ? " For a to-time, the hour hand has not reached the next number yet."
        : "";
    return `The long minute hand is right. Now move the short hour hand.${extra}`;
  }
  return base;
}

export function markItem(input: {
  secret: Secret;
  attempt: Attempt;
  triesSoFar: number;
  hint: string;
}): MarkResult {
  const { secret, attempt, triesSoFar, hint } = input;

  if (attempt.type === "option") {
    if (attempt.optionId === secret.correctOptionId) {
      return correctResult(triesSoFar, PRAISE, secret);
    }
    const tries = triesSoFar + 1;
    if (tries >= 2) return revealResult(secret, tries);
    return tryResult(tries, `Try again. ${hint}`);
  }

  if (attempt.type === "numeric") {
    if (numericMatch(attempt.value, secret.accepted ?? [])) {
      return correctResult(triesSoFar, PRAISE, secret);
    }
    const tries = triesSoFar + 1;
    if (tries >= 2) return revealResult(secret, tries);
    return tryResult(tries, `Try again. ${hint}`);
  }

  if (attempt.type === "clock") {
    const target = secret.clock;
    if (!target) return nudge(triesSoFar, "Have another go.");
    if (attempt.h === target.h && attempt.m === target.m) {
      return correctResult(triesSoFar, PRAISE, secret);
    }
    const tries = triesSoFar + 1;
    if (tries >= 2) return revealResult(secret, tries);
    return tryResult(tries, clockHint(target, attempt, hint));
  }

  if (attempt.type === "purse") {
    const price = secret.priceCents;
    if (price == null) return nudge(triesSoFar, "Have another go.");
    if (attempt.cents.length === 0) {
      return nudge(triesSoFar, "Tap some coins to put them in the purse first.");
    }
    if (attempt.cents.length > 40) {
      return nudge(
        triesSoFar,
        "That purse is full. Take a coin out, or use a bigger coin.",
      );
    }
    const tot = attempt.cents.reduce((sum, n) => sum + n, 0);
    if (tot === price) {
      return correctResult(triesSoFar, `${PRAISE} You made the price.`, secret);
    }
    const tries = triesSoFar + 1;
    if (tries >= 2) return revealResult(secret, tries);
    const message =
      tot < price
        ? `You have ${moneyLabel(tot)}. That is not enough yet. Add some more coins.`
        : `You have ${moneyLabel(tot)}. That is too much. Tap a coin in the purse to take it out.`;
    return tryResult(tries, message);
  }

  return nudge(triesSoFar, "Have another go.");
}

export function feedbackTone(
  outcome: MarkOutcome,
): "good" | "try" | "show" {
  if (outcome === "first" || outcome === "later") return "good";
  if (outcome === "reveal") return "show";
  return "try";
}
