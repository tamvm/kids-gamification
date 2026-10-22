import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { markItem, numericMatch } from "./mark";
import { starsForTry } from "./rewards";

describe("marking", () => {
  it("accepts 15 and 15.0 for a numeric answer", () => {
    assert.equal(numericMatch("15", ["15", "15.0"]), true);
    assert.equal(numericMatch("15.0", ["15"]), true);
    assert.equal(numericMatch("16", ["15", "15.0"]), false);
  });

  it("counts only the first try as a star", () => {
    const secret = { correctOptionId: "a", label: "5" };
    const first = markItem({
      secret,
      attempt: { type: "option", optionId: "a" },
      triesSoFar: 0,
      hint: "Look again.",
    });
    assert.equal(first.outcome, "first");
    assert.equal(starsForTry("first"), 1);

    const later = markItem({
      secret,
      attempt: { type: "option", optionId: "a" },
      triesSoFar: 1,
      hint: "Look again.",
    });
    assert.equal(later.outcome, "later");
    assert.equal(starsForTry("later"), 0);

    const miss = markItem({
      secret,
      attempt: { type: "option", optionId: "b" },
      triesSoFar: 1,
      hint: "Look again.",
    });
    assert.equal(miss.outcome, "reveal");
    assert.equal(starsForTry("reveal"), 0);
    assert.equal(miss.correctOptionId, "a");
  });

  it("does not spend a try when the purse is empty", () => {
    const marked = markItem({
      secret: { priceCents: 50, label: "50c", purse: [50] },
      attempt: { type: "purse", cents: [] },
      triesSoFar: 0,
      hint: "Add coins.",
    });
    assert.equal(marked.outcome, "nudge");
    assert.equal(marked.tries, 0);
    assert.equal(marked.resolved, false);
  });
});
