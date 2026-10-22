import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { MONEY_CENTS, moneyLabel, sumCents } from "./money-format";
import { makeMoneyItems, makeTimeItems, words } from "./time-money";

const allowed = new Set<number>(MONEY_CENTS);

describe("time words", () => {
  it("names quarter hours and 5-minute times", () => {
    assert.equal(words({ h: 3, m: 0 }), "3 o'clock");
    assert.equal(words({ h: 3, m: 15 }), "quarter past 3");
    assert.equal(words({ h: 3, m: 30 }), "half past 3");
    assert.equal(words({ h: 3, m: 45 }), "quarter to 4");
    assert.equal(words({ h: 12, m: 45 }), "quarter to 1");
    assert.equal(words({ h: 4, m: 10 }), "10 past 4");
    assert.equal(words({ h: 4, m: 50 }), "10 to 5");
  });
});

describe("time and money generators", () => {
  it("includes quarter-hour items and flags digital and 5-minute items as stretch", () => {
    for (let n = 0; n < 20; n++) {
      const items = makeTimeItems();
      assert.equal(items.length, 10);
      assert.ok(items.some((item) => item.public.stretch === false));
      assert.ok(
        items.some(
          (item) =>
            "stretchLabel" in item.public && item.public.stretchLabel === "5-minute time",
        ),
      );
      assert.ok(
        items.some(
          (item) =>
            "stretchLabel" in item.public &&
            item.public.stretchLabel?.includes("digital time"),
        ),
      );
      for (const item of items) {
        assert.equal(JSON.stringify(item.public).includes("correctOptionId"), false);
        if (item.public.kind === "time_read") {
          assert.equal(item.public.clock.m % 5, 0);
          const ids = item.public.options.map((option) => option.id);
          assert.equal(new Set(ids).size, ids.length);
          assert.ok(ids.includes(item.secret.correctOptionId ?? ""));
          if (!item.public.stretch) {
            assert.ok([0, 15, 30, 45].includes(item.public.clock.m));
          }
        }
        if (item.public.kind === "time_match") {
          assert.equal(item.public.stretch, true);
          const keys = item.public.options.map((option) => `${option.h}:${option.m}`);
          assert.equal(new Set(keys).size, keys.length);
        }
        if (item.public.kind === "time_set") {
          assert.equal("clock" in item.public, false);
          assert.equal(item.secret.clock && item.secret.clock.m % 5, 0);
        }
      }
    }
  });

  it("uses the Australian set, and count totals match the coins shown", () => {
    for (let n = 0; n < 20; n++) {
      const items = makeMoneyItems();
      assert.equal(items.length, 10);
      for (const item of items) {
        assert.equal(item.public.stretch, false);
        const blob = JSON.stringify(item.public);
        assert.equal(blob.includes("correctOptionId"), false);
        if (item.public.kind === "money_pick") {
          for (const option of item.public.options) assert.ok(allowed.has(option.cents));
          const correct = item.public.options.find(
            (option) => option.id === item.secret.correctOptionId,
          );
          assert.ok(correct);
          if (item.public.prompt.includes("worth the most")) {
            const max = Math.max(...item.public.options.map((option) => option.cents));
            assert.equal(correct?.cents, max);
          }
        }
        if (item.public.kind === "money_count") {
          for (const cents of item.public.items) assert.ok(allowed.has(cents));
          assert.equal(item.secret.label, moneyLabel(sumCents(item.public.items)));
          const labels = item.public.options.map((option) => option.label);
          assert.equal(new Set(labels).size, labels.length);
          assert.equal(
            labels.filter((label) => label === item.secret.label).length,
            1,
          );
        }
        if (item.public.kind === "money_enough") {
          for (const cents of item.public.purse) assert.ok(allowed.has(cents));
          const yes = sumCents(item.public.purse) >= item.public.priceCents;
          assert.equal(item.secret.correctOptionId, yes ? "yes" : "no");
        }
        if (item.public.kind === "money_purse") {
          assert.equal(sumCents(item.secret.purse ?? []), item.public.priceCents);
          assert.equal(item.public.priceCents % 5, 0);
        }
      }
    }
  });
});
