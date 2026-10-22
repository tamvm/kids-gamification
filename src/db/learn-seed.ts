import { eq } from "drizzle-orm";

import { hashSecret } from "@/lib/learn/auth-crypto";
import { isLocalBoot, resolveParentPassword } from "@/lib/learn/boot";
import {
  LEARN_COURSES,
  LEARN_LESSONS,
  LEARN_QUESTIONS,
} from "@/lib/learn/content";
import {
  CELINE_DEMO_ID,
  DEMO_PARENT,
  DEMO_PROFILES,
} from "@/lib/learn/demo-accounts";

import { getDb, schema } from "./index";

/** Insert demo parent, profiles, and Year 2 courses once. Later edits are left alone. */
export function ensureLearnPlayDemo() {
  const db = getDb();

  const parent = db
    .select({ id: schema.parents.id })
    .from(schema.parents)
    .where(eq(schema.parents.id, DEMO_PARENT.id))
    .get();
  const password = resolveParentPassword();
  if (!parent) {
    db.insert(schema.parents)
      .values({
        id: DEMO_PARENT.id,
        displayName: DEMO_PARENT.displayName,
        passwordHash: hashSecret(password),
      })
      .run();
  } else if (!isLocalBoot()) {
    db.update(schema.parents)
      .set({ passwordHash: hashSecret(password) })
      .where(eq(schema.parents.id, DEMO_PARENT.id))
      .run();
  }

  for (const course of LEARN_COURSES) {
    const existing = db
      .select({ id: schema.learnCourses.id })
      .from(schema.learnCourses)
      .where(eq(schema.learnCourses.id, course.id))
      .get();
    if (existing) continue;

    db.insert(schema.learnCourses)
      .values({
        id: course.id,
        title: course.title,
        blurb: course.blurb,
        subjectName: course.subjectName,
        yearLevel: course.yearLevel,
        acCodesJson: JSON.stringify(course.acCodes),
        kind: course.kind,
        builtinKey: course.builtinKey,
        sortOrder: course.sortOrder,
      })
      .run();

    for (const lesson of LEARN_LESSONS.filter((row) => row.courseId === course.id)) {
      db.insert(schema.learnLessons).values(lesson).run();
    }

    const lessonIds = new Set(
      LEARN_LESSONS.filter((row) => row.courseId === course.id).map((row) => row.id),
    );
    for (const question of LEARN_QUESTIONS.filter((row) => lessonIds.has(row.lessonId))) {
      db.insert(schema.learnQuestions)
        .values({
          id: question.id,
          lessonId: question.lessonId,
          prompt: question.prompt,
          type: question.type,
          choicesJson: question.choices ? JSON.stringify(question.choices) : null,
          correctIndex: question.correctIndex ?? null,
          answersJson: question.answers ? JSON.stringify(question.answers) : null,
          explanation: question.explanation,
          hint: question.hint,
          acCodesJson: JSON.stringify(question.acCodes),
          sortOrder: question.sortOrder,
        })
        .run();
    }
  }

  for (const profile of DEMO_PROFILES) {
    const existing = db
      .select({ id: schema.profiles.id })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, profile.id))
      .get();
    if (existing) continue;

    db.insert(schema.profiles)
      .values({
        id: profile.id,
        name: profile.name,
        avatarKey: profile.avatarKey,
        ageBand: profile.ageBand,
        pinHash: hashSecret(profile.pin),
        yearLevel: profile.yearLevel,
        dailyCapMinutes: profile.dailyCapMinutes,
        learnPortal: true,
        energy: 0,
        coins: 0,
        streak: 0,
      })
      .run();

    if (profile.id === CELINE_DEMO_ID) {
      for (const course of LEARN_COURSES) {
        db.insert(schema.learnAssignments)
          .values({
            id: `assign-${profile.id}-${course.id}`,
            courseId: course.id,
            profileId: profile.id,
          })
          .run();
      }
    }
  }
}
