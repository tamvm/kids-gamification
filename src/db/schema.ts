import { relations, sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  avatarKey: text("avatar_key").notNull().default("explorer"),
  ageBand: text("age_band", { enum: ["little", "big"] }).notNull(),
  energy: integer("energy").notNull().default(0),
  coins: integer("coins").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  mapNodeId: text("map_node_id"),
  pinHash: text("pin_hash"),
  yearLevel: text("year_level"),
  dailyCapMinutes: integer("daily_cap_minutes").notNull().default(15),
  learnPortal: integer("learn_portal", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const parents = sqliteTable("parents", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const learnCourses = sqliteTable("learn_courses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  blurb: text("blurb").notNull().default(""),
  subjectName: text("subject_name").notNull(),
  yearLevel: text("year_level"),
  acCodesJson: text("ac_codes_json").notNull().default("[]"),
  kind: text("kind", { enum: ["builtin", "bank", "parent"] }).notNull(),
  builtinKey: text("builtin_key"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const learnLessons = sqliteTable("learn_lessons", {
  id: text("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => learnCourses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const learnQuestions = sqliteTable("learn_questions", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => learnLessons.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  type: text("type", { enum: ["mcq", "numeric"] }).notNull(),
  choicesJson: text("choices_json"),
  correctIndex: integer("correct_index"),
  answersJson: text("answers_json"),
  explanation: text("explanation"),
  hint: text("hint"),
  acCodesJson: text("ac_codes_json").notNull().default("[]"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const learnAssignments = sqliteTable(
  "learn_assignments",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => learnCourses.id, { onDelete: "cascade" }),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
  },
  (t) => [
    uniqueIndex("learn_assign_course_profile").on(t.courseId, t.profileId),
  ],
);

export const learnRounds = sqliteTable("learn_rounds", {
  id: text("id").primaryKey(),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  courseId: text("course_id")
    .notNull()
    .references(() => learnCourses.id, { onDelete: "cascade" }),
  localDate: text("local_date").notNull(),
  mode: text("mode", { enum: ["time", "money", "quiz"] }).notNull(),
  status: text("status", { enum: ["in_progress", "finished"] })
    .notNull()
    .default("in_progress"),
  scored: integer("scored", { mode: "boolean" }).notNull().default(false),
  firstTryCorrect: integer("first_try_correct").notNull().default(0),
  questionCount: integer("question_count").notNull().default(10),
  startedAt: text("started_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  finishedAt: text("finished_at"),
});

export const learnRoundItems = sqliteTable("learn_round_items", {
  id: text("id").primaryKey(),
  roundId: text("round_id")
    .notNull()
    .references(() => learnRounds.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  kind: text("kind").notNull(),
  publicJson: text("public_json").notNull(),
  secretJson: text("secret_json").notNull(),
  tries: integer("tries").notNull().default(0),
  firstTryCorrect: integer("first_try_correct", { mode: "boolean" }),
  revealed: integer("revealed", { mode: "boolean" }).notNull().default(false),
  resolved: integer("resolved", { mode: "boolean" }).notNull().default(false),
});

export const learnGrants = sqliteTable("learn_grants", {
  id: text("id").primaryKey(),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  roundId: text("round_id").references(() => learnRounds.id, {
    onDelete: "set null",
  }),
  courseId: text("course_id").references(() => learnCourses.id, {
    onDelete: "set null",
  }),
  stars: integer("stars").notNull(),
  minutes: integer("minutes").notNull(),
  minutesSpent: integer("minutes_spent").notNull().default(0),
  status: text("status", { enum: ["pending", "approved", "declined"] })
    .notNull()
    .default("pending"),
  localDate: text("local_date").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const learnLedger = sqliteTable("learn_ledger", {
  id: text("id").primaryKey(),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  kind: text("kind", {
    enum: [
      "earn_correct",
      "earn_mastery",
      "approve",
      "decline",
      "adjust",
      "spend_play",
    ],
  }).notNull(),
  stars: integer("stars").notNull().default(0),
  minutes: integer("minutes").notNull().default(0),
  roundId: text("round_id"),
  grantId: text("grant_id"),
  localDate: text("local_date").notNull(),
  note: text("note"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const learnPlaySessions = sqliteTable("learn_play_sessions", {
  id: text("id").primaryKey(),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  minutes: integer("minutes").notNull(),
  localDate: text("local_date").notNull(),
  startedAt: text("started_at").notNull(),
  endsAt: text("ends_at").notNull(),
});

export const subjects = sqliteTable("subjects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull().default("book"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const lessons = sqliteTable("lessons", {
  id: text("id").primaryKey(),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  mapNodeId: text("map_node_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  energyCostToUnlock: integer("energy_cost_to_unlock").notNull().default(1),
  difficulty: text("difficulty", {
    enum: ["easy", "medium", "hard"],
  })
    .notNull()
    .default("easy"),
});

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  type: text("type", { enum: ["mcq"] })
    .notNull()
    .default("mcq"),
  choicesJson: text("choices_json").notNull(),
  correctIndex: integer("correct_index").notNull(),
  explanation: text("explanation"),
  difficulty: text("difficulty", {
    enum: ["easy", "medium", "hard"],
  })
    .notNull()
    .default("easy"),
  mediaUrl: text("media_url"),
});

export const attempts = sqliteTable("attempts", {
  id: text("id").primaryKey(),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  correct: integer("correct", { mode: "boolean" }).notNull(),
  answeredAt: text("answered_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const reviewItems = sqliteTable(
  "review_items",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    wrongCount: integer("wrong_count").notNull().default(1),
    masteredAt: text("mastered_at"),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [uniqueIndex("review_profile_question").on(t.profileId, t.questionId)],
);

export const mapNodes = sqliteTable("map_nodes", {
  id: text("id").primaryKey(),
  realm: text("realm").notNull().default("meadow"),
  label: text("label").notNull(),
  x: real("x").notNull(),
  y: real("y").notNull(),
  unlockOrder: integer("unlock_order").notNull().default(0),
  lessonId: text("lesson_id"),
  energyCostToEnter: integer("energy_cost_to_enter").notNull().default(1),
});

export const mapPickups = sqliteTable("map_pickups", {
  id: text("id").primaryKey(),
  nodeId: text("node_id")
    .notNull()
    .references(() => mapNodes.id, { onDelete: "cascade" }),
  coinAmount: integer("coin_amount").notNull().default(5),
  kind: text("kind", { enum: ["chest", "star", "sparkle"] })
    .notNull()
    .default("chest"),
});

export const profileNodeUnlocks = sqliteTable(
  "profile_node_unlocks",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    nodeId: text("node_id")
      .notNull()
      .references(() => mapNodes.id, { onDelete: "cascade" }),
    unlockedAt: text("unlocked_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [uniqueIndex("unlock_profile_node").on(t.profileId, t.nodeId)],
);

export const profilePickupClaims = sqliteTable(
  "profile_pickup_claims",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    pickupId: text("pickup_id")
      .notNull()
      .references(() => mapPickups.id, { onDelete: "cascade" }),
    claimedAt: text("claimed_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [uniqueIndex("claim_profile_pickup").on(t.profileId, t.pickupId)],
);

export const subjectsRelations = relations(subjects, ({ many }) => ({
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [lessons.subjectId],
    references: [subjects.id],
  }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  lesson: one(lessons, {
    fields: [questions.lessonId],
    references: [lessons.id],
  }),
}));
