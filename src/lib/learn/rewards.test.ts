import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  adjustGrantMinutes,
  applySpend,
  approvedRemaining,
  decidePlayBlock,
  declineGrant,
  decorativeStars,
  grantForRound,
  minutesFromStars,
  pendingMinutes,
  PLAY_BLOCK_MINUTES,
  starsForTry,
  type Grant,
} from "./rewards";

describe("stars to minutes", () => {
  it("pays 1 minute per star and nothing for a later try or a reveal", () => {
    assert.equal(starsForTry("first"), 1);
    assert.equal(starsForTry("later"), 0);
    assert.equal(starsForTry("reveal"), 0);
    assert.equal(minutesFromStars(1), 1);
    const one = grantForRound({
      firstTryCorrect: 1,
      questionCount: 10,
      countsForStars: true,
      finished: true,
    });
    assert.equal(one.earnCorrect, 1);
    assert.equal(one.earnMastery, 0);
    assert.equal(one.minutesPending, 1);
  });

  it("adds a mastery bonus at 8 of 10 first-try correct and not at 7", () => {
    const hit = grantForRound({
      firstTryCorrect: 8,
      questionCount: 10,
      countsForStars: true,
      finished: true,
    });
    assert.equal(hit.earnCorrect, 8);
    assert.equal(hit.earnMastery, 5);
    assert.equal(hit.minutesPending, 13);

    const miss = grantForRound({
      firstTryCorrect: 7,
      questionCount: 10,
      countsForStars: true,
      finished: true,
    });
    assert.equal(miss.earnMastery, 0);
    assert.equal(miss.minutesPending, 7);
  });

  it("does not pay an unfinished round or a second scored round the same day", () => {
    const open = grantForRound({
      firstTryCorrect: 10,
      questionCount: 10,
      countsForStars: true,
      finished: false,
    });
    assert.equal(open.minutesPending, 0);
    assert.equal(open.scored, false);

    const practice = grantForRound({
      firstTryCorrect: 10,
      questionCount: 10,
      countsForStars: false,
      finished: true,
    });
    assert.equal(practice.minutesPending, 0);
    assert.equal(practice.earnMastery, 0);
  });

  it("keeps decorative end stars out of the wallet", () => {
    assert.equal(decorativeStars(0), 1);
    assert.equal(decorativeStars(10), 3);
    const revealed = grantForRound({
      firstTryCorrect: 0,
      questionCount: 10,
      countsForStars: true,
      finished: true,
    });
    assert.equal(revealed.minutesPending, 0);
    assert.equal(revealed.earnCorrect, 0);
  });
});

describe("daily cap and approve-before-play", () => {
  it("blocks a 5 minute block when today's cap has fewer than 5 minutes left", () => {
    const grants = [
      { id: "g", status: "approved" as const, minutes: 30, minutesSpent: 0 },
    ];
    assert.equal(PLAY_BLOCK_MINUTES, 5);
    assert.deepEqual(
      decidePlayBlock({ grants, playedToday: 11, dailyCap: 15 }),
      { ok: false, reason: "daily_cap" },
    );
    assert.equal(
      decidePlayBlock({ grants, playedToday: 10, dailyCap: 15 }).ok,
      true,
    );
    assert.equal(
      decidePlayBlock({ grants, playedToday: 15, dailyCap: 15 }).ok,
      false,
    );
  });

  it("carries leftover approved minutes and still enforces the next day's cap", () => {
    let grants: Grant[] = [
      { id: "g", status: "approved", minutes: 20, minutesSpent: 0 },
    ];
    grants = applySpend(grants, 5);
    grants = applySpend(grants, 5);
    grants = applySpend(grants, 5);
    assert.equal(approvedRemaining(grants), 5);
    assert.deepEqual(
      decidePlayBlock({ grants, playedToday: 15, dailyCap: 15 }),
      { ok: false, reason: "daily_cap" },
    );
    assert.equal(
      decidePlayBlock({ grants, playedToday: 0, dailyCap: 15 }).ok,
      true,
    );
  });

  it("does not let pending or declined minutes start a game", () => {
    const pending = [
      { id: "p", status: "pending" as const, minutes: 10, minutesSpent: 0 },
    ];
    assert.equal(pendingMinutes(pending), 10);
    assert.equal(approvedRemaining(pending), 0);
    assert.deepEqual(
      decidePlayBlock({ grants: pending, playedToday: 0, dailyCap: 15 }),
      { ok: false, reason: "not_enough_minutes" },
    );

    const mixed = [
      { id: "old", status: "approved" as const, minutes: 6, minutesSpent: 0 },
      { id: "new", status: "pending" as const, minutes: 10, minutesSpent: 0 },
    ];
    const declined = declineGrant(mixed, "new");
    assert.equal(approvedRemaining(declined), 6);
    assert.equal(pendingMinutes(declined), 0);
  });

  it("refuses to adjust a grant below minutes already played", () => {
    const grant = {
      id: "g",
      status: "approved" as const,
      minutes: 10,
      minutesSpent: 5,
    };
    assert.equal(adjustGrantMinutes(grant, 4).ok, false);
    assert.deepEqual(adjustGrantMinutes(grant, 5), { ok: true, minutes: 5 });
    const spent = applySpend([grant], 0);
    assert.equal(approvedRemaining(spent), 5);
    const again = applySpend(spent, 5);
    assert.equal(approvedRemaining(again), 0);
    assert.equal(approvedRemaining(applySpend(again, 0)), 0);
  });
});
