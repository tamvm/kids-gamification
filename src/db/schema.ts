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
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
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
