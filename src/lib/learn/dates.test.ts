import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { HOME_TZ, localDate, weekRange } from "./dates";

describe("Australia/Brisbane calendar", () => {
  it("uses Brisbane for the local date, including after 10pm AEST", () => {
    assert.equal(HOME_TZ, "Australia/Brisbane");
    assert.equal(localDate(new Date("2026-10-22T13:00:00Z")), "2026-10-22");
    assert.equal(localDate(new Date("2026-10-22T15:30:00Z")), "2026-10-23");
  });

  it("groups Monday to Sunday", () => {
    assert.deepEqual(weekRange("2026-10-22"), {
      start: "2026-10-19",
      end: "2026-10-25",
    });
    assert.deepEqual(weekRange("2026-10-25"), {
      start: "2026-10-19",
      end: "2026-10-25",
    });
    assert.deepEqual(weekRange("2026-10-26"), {
      start: "2026-10-26",
      end: "2026-11-01",
    });
  });
});
