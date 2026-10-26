import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { and, eq } from "drizzle-orm";

const dbFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "kg-assign-")), "app.db");
process.env.DATABASE_PATH = dbFile;
process.env.NODE_ENV = "development";

test("Test Child sample backfill runs once, skips other profiles, and a toggle survives restart", async () => {
  const { getDb, schema } = await import("../../db/index");
  const { ensureLearnPlayDemo, TEST_CHILD_SAMPLE_MARKER } = await import("../../db/learn-seed");
  const { LEARN_COURSES } = await import("./content");
  const { CELINE_DEMO_ID, TEST_CHILD_ID } = await import("./demo-accounts");
  const { LearnError, parentDashboard, setCourseAssignment } = await import("./store");

  const db = getDb();
  migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  ensureLearnPlayDemo();

  const sampleIds = LEARN_COURSES.map((course) => course.id).sort();
  const assignedTo = (profileId: string) =>
    db
      .select({ courseId: schema.learnAssignments.courseId })
      .from(schema.learnAssignments)
      .where(eq(schema.learnAssignments.profileId, profileId))
      .all()
      .map((row) => row.courseId)
      .sort();

  assert.deepEqual(assignedTo(TEST_CHILD_ID), sampleIds);
  assert.equal(
    db
      .select({ id: schema.learnBootMarkers.id })
      .from(schema.learnBootMarkers)
      .where(eq(schema.learnBootMarkers.id, TEST_CHILD_SAMPLE_MARKER))
      .get()?.id,
    TEST_CHILD_SAMPLE_MARKER,
  );

  const missingForChild = sampleIds[0];
  const missingForCeline = sampleIds[1];
  const parentMadeId = "profile-parent-made";
  const sameNameId = "profile-named-test-child";

  // Production shape before this boot marker existed: Test Child is short one course.
  db.delete(schema.learnBootMarkers)
    .where(eq(schema.learnBootMarkers.id, TEST_CHILD_SAMPLE_MARKER))
    .run();
  db.delete(schema.learnAssignments)
    .where(
      and(
        eq(schema.learnAssignments.profileId, TEST_CHILD_ID),
        eq(schema.learnAssignments.courseId, missingForChild),
      ),
    )
    .run();
  db.delete(schema.learnAssignments)
    .where(
      and(
        eq(schema.learnAssignments.profileId, CELINE_DEMO_ID),
        eq(schema.learnAssignments.courseId, missingForCeline),
      ),
    )
    .run();

  for (const profile of [
    { id: parentMadeId, name: "Parent made" },
    { id: sameNameId, name: "Test Child" },
  ]) {
    db.insert(schema.profiles)
      .values({
        id: profile.id,
        name: profile.name,
        avatarKey: "owl",
        ageBand: "big",
        learnPortal: true,
        energy: 0,
        coins: 0,
        streak: 0,
      })
      .run();
  }
  db.insert(schema.learnAssignments)
    .values({
      id: "assign-parent-made-one",
      courseId: sampleIds[2],
      profileId: parentMadeId,
    })
    .run();

  const celineBefore = assignedTo(CELINE_DEMO_ID);
  const parentBefore = assignedTo(parentMadeId);
  assert.equal(celineBefore.includes(missingForCeline), false);
  assert.deepEqual(parentBefore, [sampleIds[2]]);
  assert.deepEqual(assignedTo(sameNameId), []);

  ensureLearnPlayDemo();

  assert.deepEqual(assignedTo(TEST_CHILD_ID), sampleIds);
  assert.deepEqual(assignedTo(CELINE_DEMO_ID), celineBefore);
  assert.deepEqual(assignedTo(parentMadeId), parentBefore);
  assert.deepEqual(assignedTo(sameNameId), []);

  setCourseAssignment({
    courseId: missingForChild,
    profileId: TEST_CHILD_ID,
    assigned: false,
  });
  const afterUncheck = parentDashboard();
  assert.equal(
    afterUncheck.assignments.some(
      (row) => row.courseId === missingForChild && row.profileId === TEST_CHILD_ID,
    ),
    false,
  );
  assert.equal(
    afterUncheck.assignments.some(
      (row) => row.courseId === sampleIds[2] && row.profileId === parentMadeId,
    ),
    true,
  );

  ensureLearnPlayDemo();
  const afterRestart = parentDashboard();
  assert.equal(
    afterRestart.assignments.some(
      (row) => row.courseId === missingForChild && row.profileId === TEST_CHILD_ID,
    ),
    false,
  );
  assert.deepEqual(assignedTo(CELINE_DEMO_ID), celineBefore);
  assert.deepEqual(assignedTo(parentMadeId), parentBefore);
  assert.deepEqual(assignedTo(sameNameId), []);

  setCourseAssignment({
    courseId: missingForChild,
    profileId: TEST_CHILD_ID,
    assigned: true,
  });
  const afterRecheck = parentDashboard();
  assert.equal(
    afterRecheck.assignments.some(
      (row) => row.courseId === missingForChild && row.profileId === TEST_CHILD_ID,
    ),
    true,
  );
  ensureLearnPlayDemo();
  assert.equal(
    parentDashboard().assignments.filter(
      (row) => row.courseId === missingForChild && row.profileId === TEST_CHILD_ID,
    ).length,
    1,
  );

  assert.throws(
    () =>
      setCourseAssignment({
        courseId: missingForChild,
        profileId: "missing-profile",
        assigned: true,
      }),
    LearnError,
  );
  assert.throws(
    () =>
      setCourseAssignment({
        courseId: "missing-course",
        profileId: TEST_CHILD_ID,
        assigned: true,
      }),
    LearnError,
  );
});
