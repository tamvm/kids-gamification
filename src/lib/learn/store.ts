import { randomUUID } from "node:crypto";

import { and, asc, desc, eq, inArray } from "drizzle-orm";

import { getDb, schema } from "@/db";

import { verifySecret, hashSecret } from "./auth-crypto";
import { isAvatarKey } from "./avatars";
import { addCalendarDays, datesInWeek, formatWeekLabel, localDate, weekRange } from "./dates";
import { feedbackTone, markItem } from "./mark";
import {
  adjustGrantMinutes,
  applySpend,
  approvedRemaining,
  decidePlayBlock,
  decorativeStars,
  grantForRound,
  pendingMinutes,
  PLAY_BLOCK_MINUTES,
  type Grant,
} from "./rewards";
import { makeMoneyItems, makeTimeItems, type ItemDraft } from "./time-money";
import type { Attempt, Feedback, PlayState, PublicItem, RoundItem, Secret, Summary } from "./types";

export class LearnError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LearnError";
  }
}

type RoundRow = typeof schema.learnRounds.$inferSelect;
type ItemRow = typeof schema.learnRoundItems.$inferSelect;

function db() {
  return getDb();
}

function nowIso() {
  return new Date().toISOString();
}

function parseJson<T>(raw: string): T {
  return JSON.parse(raw) as T;
}

function asPublic(raw: string): PublicItem {
  const value = parseJson<PublicItem>(raw);
  if (!value || typeof value !== "object" || !("kind" in value)) {
    throw new LearnError("That question could not be read.");
  }
  return value;
}

function toRoundItem(row: ItemRow): RoundItem {
  return { ...asPublic(row.publicJson), id: row.id };
}

function modeLabel(mode: string): string {
  if (mode === "time") return "Telling time";
  if (mode === "money") return "Aussie money";
  return "Quiz";
}

function kidMessage(outcome: string, message: string, countsForStars: boolean): string {
  if (outcome === "nudge" || outcome === "try" || outcome === "reveal") return message;
  if (outcome === "first" && countsForStars) return `${message} A star goes on your list.`;
  if (outcome === "first") return `${message} This round is practice, so no new star.`;
  return `${message} Only a first try adds a star.`;
}

function playFrom(
  round: RoundRow,
  courseTitle: string,
  items: ItemRow[],
  extra: { feedback: Feedback | null; summary: Summary | null; focusId?: string },
): PlayState {
  const ordered = [...items].sort((a, b) => a.position - b.position);
  const solved = ordered.filter((item) => item.resolved && !item.revealed).length;
  const firstTry = ordered.filter((item) => item.firstTryCorrect).length;
  const focus =
    ordered.find((item) => item.id === extra.focusId) ??
    ordered.find((item) => !item.resolved) ??
    null;
  const next = focus
    ? ordered.find((item) => !item.resolved && item.id !== focus.id) ?? null
    : null;
  return {
    roundId: round.id,
    courseId: round.courseId,
    courseTitle,
    modeLabel: modeLabel(round.mode),
    countsForStars: round.scored,
    index: focus?.position ?? round.questionCount,
    total: round.questionCount,
    solved,
    firstTry,
    item: focus ? toRoundItem(focus) : null,
    feedback: extra.feedback,
    summary: extra.summary,
    nextItem: extra.feedback?.resolved && next ? toRoundItem(next) : null,
  };
}

export function kidPinMatches(profileId: string, pin: string): boolean {
  const row = db()
    .select()
    .from(schema.profiles)
    .where(eq(schema.profiles.id, profileId))
    .get();
  const stored = row?.learnPortal ? row.pinHash : null;
  const ok = verifySecret(pin.slice(0, 20), stored);
  return ok && /^\d{4}$/.test(pin);
}

export function parentPasswordMatches(password: string): boolean {
  const parent = db().select().from(schema.parents).limit(1).get();
  const ok = verifySecret(password.slice(0, 80), parent?.passwordHash ?? null);
  return ok && password.length > 0 && password.length <= 80;
}

export function listLearnProfiles() {
  return db()
    .select({
      id: schema.profiles.id,
      name: schema.profiles.name,
      avatarKey: schema.profiles.avatarKey,
      yearLevel: schema.profiles.yearLevel,
    })
    .from(schema.profiles)
    .where(eq(schema.profiles.learnPortal, true))
    .orderBy(asc(schema.profiles.name))
    .all();
}

function loadGrants(profileId: string): Grant[] {
  return db()
    .select()
    .from(schema.learnGrants)
    .where(eq(schema.learnGrants.profileId, profileId))
    .orderBy(asc(schema.learnGrants.createdAt))
    .all()
    .map((row) => ({
      id: row.id,
      status: row.status,
      minutes: row.minutes,
      minutesSpent: row.minutesSpent,
    }));
}

function starTotal(profileId: string): number {
  return db()
    .select()
    .from(schema.learnLedger)
    .where(eq(schema.learnLedger.profileId, profileId))
    .all()
    .filter((row) => row.kind === "earn_correct" || row.kind === "earn_mastery")
    .reduce((sum, row) => sum + row.stars, 0);
}

export function kidHome(profileId: string) {
  const profile = db()
    .select()
    .from(schema.profiles)
    .where(and(eq(schema.profiles.id, profileId), eq(schema.profiles.learnPortal, true)))
    .get();
  if (!profile) return null;

  const assignments = db()
    .select()
    .from(schema.learnAssignments)
    .where(eq(schema.learnAssignments.profileId, profileId))
    .all();
  const courseIds = assignments.map((row) => row.courseId);
  const courses = courseIds.length
    ? db()
        .select()
        .from(schema.learnCourses)
        .where(inArray(schema.learnCourses.id, courseIds))
        .orderBy(asc(schema.learnCourses.sortOrder))
        .all()
    : [];
  const rounds = db()
    .select()
    .from(schema.learnRounds)
    .where(eq(schema.learnRounds.profileId, profileId))
    .all();
  const today = localDate();
  const grants = loadGrants(profileId);
  const sessions = db()
    .select()
    .from(schema.learnPlaySessions)
    .where(eq(schema.learnPlaySessions.profileId, profileId))
    .all();
  const playedToday = sessions
    .filter((row) => row.localDate === today)
    .reduce((sum, row) => sum + row.minutes, 0);
  const active = sessions.some((row) => row.endsAt > nowIso());

  return {
    profile: {
      id: profile.id,
      name: profile.name,
      avatarKey: profile.avatarKey,
      yearLevel: profile.yearLevel,
      dailyCapMinutes: profile.dailyCapMinutes,
    },
    stars: starTotal(profileId),
    pendingMinutes: pendingMinutes(grants),
    readyMinutes: approvedRemaining(grants),
    playedToday,
    activePlay: active,
    courses: courses.map((course) => {
      const mine = rounds.filter((round) => round.courseId === course.id && round.status === "finished");
      const best = mine.reduce<number | null>(
        (top, round) => (top === null ? round.firstTryCorrect : Math.max(top, round.firstTryCorrect)),
        null,
      );
      return {
        id: course.id,
        title: course.title,
        subjectName: course.subjectName,
        blurb: course.blurb,
        finishedRounds: mine.length,
        bestFirstTry: best,
        scoredToday: rounds.some(
          (round) =>
            round.courseId === course.id && round.localDate === today && round.scored,
        ),
      };
    }),
  };
}

function assigned(profileId: string, courseId: string) {
  return db()
    .select({ id: schema.learnAssignments.id })
    .from(schema.learnAssignments)
    .where(
      and(
        eq(schema.learnAssignments.profileId, profileId),
        eq(schema.learnAssignments.courseId, courseId),
      ),
    )
    .get();
}

export function loadCourse(profileId: string, courseId: string) {
  const course = db()
    .select()
    .from(schema.learnCourses)
    .where(eq(schema.learnCourses.id, courseId))
    .get();
  if (!course || !assigned(profileId, courseId)) return null;
  const lessons = db()
    .select()
    .from(schema.learnLessons)
    .where(eq(schema.learnLessons.courseId, courseId))
    .orderBy(asc(schema.learnLessons.sortOrder))
    .all();
  const lessonCounts = lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    questionCount: db()
      .select({ id: schema.learnQuestions.id })
      .from(schema.learnQuestions)
      .where(eq(schema.learnQuestions.lessonId, lesson.id))
      .all().length,
  }));
  const open = db()
    .select()
    .from(schema.learnRounds)
    .where(
      and(
        eq(schema.learnRounds.profileId, profileId),
        eq(schema.learnRounds.courseId, courseId),
        eq(schema.learnRounds.status, "in_progress"),
      ),
    )
    .get();
  const today = localDate();
  const practice = Boolean(
    db()
      .select({ id: schema.learnRounds.id })
      .from(schema.learnRounds)
      .where(
        and(
          eq(schema.learnRounds.profileId, profileId),
          eq(schema.learnRounds.courseId, courseId),
          eq(schema.learnRounds.localDate, today),
          eq(schema.learnRounds.scored, true),
        ),
      )
      .get(),
  );
  let play: PlayState | null = null;
  if (open) {
    const items = db()
      .select()
      .from(schema.learnRoundItems)
      .where(eq(schema.learnRoundItems.roundId, open.id))
      .all();
    play = playFrom(open, course.title, items, { feedback: null, summary: null });
  }
  return {
    course: {
      id: course.id,
      title: course.title,
      blurb: course.blurb,
      subjectName: course.subjectName,
      builtinKey: course.builtinKey,
      kind: course.kind,
    },
    lessons: lessonCounts,
    practice: practice && !open?.scored,
    play,
  };
}

function bankDrafts(courseId: string): ItemDraft[] {
  const lessons = db()
    .select()
    .from(schema.learnLessons)
    .where(eq(schema.learnLessons.courseId, courseId))
    .orderBy(asc(schema.learnLessons.sortOrder))
    .all();
  const questions = lessons.flatMap((lesson) =>
    db()
      .select()
      .from(schema.learnQuestions)
      .where(eq(schema.learnQuestions.lessonId, lesson.id))
      .orderBy(asc(schema.learnQuestions.sortOrder))
      .all(),
  );
  return questions.slice(0, 10).map((question) => {
    if (question.type === "mcq") {
      const choices = parseJson<string[]>(question.choicesJson ?? "[]");
      const options = choices.map((label, index) => ({ id: `c${index}`, label }));
      const index = question.correctIndex ?? -1;
      if (!options[index]) throw new LearnError("A question is missing its answer.");
      return {
        kind: "mcq" as const,
        public: {
          kind: "mcq" as const,
          prompt: question.prompt,
          say: question.prompt,
          hint: question.hint || "Have another go.",
          stretch: false,
          options,
        },
        secret: {
          correctOptionId: options[index].id,
          label: options[index].label,
          explain: question.explanation ?? undefined,
        },
      };
    }
    const accepted = parseJson<string[]>(question.answersJson ?? "[]");
    if (!accepted.length) throw new LearnError("A number question is missing its answer.");
    return {
      kind: "numeric" as const,
      public: {
        kind: "numeric" as const,
        prompt: question.prompt,
        say: question.prompt,
        hint: question.hint || "Try the number again.",
        stretch: false,
      },
      secret: {
        accepted,
        label: accepted[0],
        explain: question.explanation ?? undefined,
      },
    };
  });
}

export function createRound(profileId: string, courseId: string, requestedMode: string): string {
  const course = db()
    .select()
    .from(schema.learnCourses)
    .where(eq(schema.learnCourses.id, courseId))
    .get();
  if (!course || !assigned(profileId, courseId)) {
    throw new LearnError("That course is not on this profile.");
  }
  const open = db()
    .select()
    .from(schema.learnRounds)
    .where(
      and(
        eq(schema.learnRounds.profileId, profileId),
        eq(schema.learnRounds.courseId, courseId),
        eq(schema.learnRounds.status, "in_progress"),
      ),
    )
    .get();
  if (open) return open.id;

  const today = localDate();
  const scoredToday = db()
    .select({ id: schema.learnRounds.id })
    .from(schema.learnRounds)
    .where(
      and(
        eq(schema.learnRounds.profileId, profileId),
        eq(schema.learnRounds.courseId, courseId),
        eq(schema.learnRounds.localDate, today),
        eq(schema.learnRounds.scored, true),
      ),
    )
    .get();

  const mode =
    course.builtinKey === "time_money"
      ? requestedMode === "money"
        ? "money"
        : "time"
      : "quiz";
  const drafts = mode === "time" ? makeTimeItems() : mode === "money" ? makeMoneyItems() : bankDrafts(courseId);
  if (!drafts.length) throw new LearnError("This course has no questions yet.");

  const roundId = randomUUID();
  db().transaction((tx) => {
    tx.insert(schema.learnRounds)
      .values({
        id: roundId,
        profileId,
        courseId,
        localDate: today,
        mode,
        status: "in_progress",
        scored: !scoredToday,
        questionCount: drafts.length,
        startedAt: nowIso(),
      })
      .run();
    drafts.forEach((draft, index) => {
      tx.insert(schema.learnRoundItems)
        .values({
          id: randomUUID(),
          roundId,
          position: index + 1,
          kind: draft.kind,
          publicJson: JSON.stringify(draft.public),
          secretJson: JSON.stringify(draft.secret),
        })
        .run();
    });
  });
  return roundId;
}

export function parseAttempt(input: unknown): Attempt | null {
  if (!input || typeof input !== "object") return null;
  const value = input as Attempt;
  if (value.type === "option" && typeof value.optionId === "string" && value.optionId.length < 20) {
    return { type: "option", optionId: value.optionId };
  }
  if (
    value.type === "clock" &&
    Number.isInteger(value.h) &&
    Number.isInteger(value.m) &&
    value.h >= 1 &&
    value.h <= 12 &&
    value.m >= 0 &&
    value.m < 60
  ) {
    return { type: "clock", h: value.h, m: value.m };
  }
  if (
    value.type === "purse" &&
    Array.isArray(value.cents) &&
    value.cents.length <= 40 &&
    value.cents.every((cents) => Number.isInteger(cents) && cents > 0 && cents <= 200)
  ) {
    return { type: "purse", cents: value.cents };
  }
  if (value.type === "numeric" && typeof value.value === "string" && value.value.length <= 20) {
    return { type: "numeric", value: value.value };
  }
  return null;
}

export function applyAttempt(profileId: string, roundId: string, itemId: string, attempt: Attempt): PlayState {
  const database = db();
  return database.transaction((tx) => {
    const round = tx
      .select()
      .from(schema.learnRounds)
      .where(eq(schema.learnRounds.id, roundId))
      .get();
    if (!round || round.profileId !== profileId) throw new LearnError("That round is not open.");
    const course = tx
      .select()
      .from(schema.learnCourses)
      .where(eq(schema.learnCourses.id, round.courseId))
      .get();
    if (!course) throw new LearnError("That course is missing.");
    const items = tx
      .select()
      .from(schema.learnRoundItems)
      .where(eq(schema.learnRoundItems.roundId, roundId))
      .all();
    const item = items.find((row) => row.id === itemId);
    if (!item) throw new LearnError("That question is missing.");
    if (round.status !== "in_progress" || item.resolved) {
      return playFrom(round, course.title, items, { feedback: null, summary: null });
    }

    const secret = parseJson<Secret>(item.secretJson);
    const pub = asPublic(item.publicJson);
    const marked = markItem({
      secret,
      attempt,
      triesSoFar: item.tries,
      hint: pub.hint,
    });
    tx.update(schema.learnRoundItems)
      .set({
        tries: marked.tries,
        resolved: marked.resolved,
        revealed: marked.revealed,
        firstTryCorrect: marked.resolved ? marked.outcome === "first" : null,
      })
      .where(eq(schema.learnRoundItems.id, item.id))
      .run();

    const fresh = tx
      .select()
      .from(schema.learnRoundItems)
      .where(eq(schema.learnRoundItems.roundId, roundId))
      .all();
    let summary: Summary | null = null;
    let storedRound = round;
    if (fresh.every((row) => row.resolved)) {
      const firstTry = fresh.filter((row) => row.firstTryCorrect).length;
      const solved = fresh.filter((row) => row.resolved && !row.revealed).length;
      const grant = grantForRound({
        firstTryCorrect: firstTry,
        questionCount: round.questionCount,
        countsForStars: round.scored,
        finished: true,
      });
      const finishedAt = nowIso();
      tx.update(schema.learnRounds)
        .set({ status: "finished", finishedAt, firstTryCorrect: firstTry })
        .where(eq(schema.learnRounds.id, round.id))
        .run();
      storedRound = { ...round, status: "finished", finishedAt, firstTryCorrect: firstTry };
      if (grant.earnCorrect > 0) {
        tx.insert(schema.learnLedger)
          .values({
            id: randomUUID(),
            profileId,
            kind: "earn_correct",
            stars: grant.earnCorrect,
            minutes: 0,
            roundId: round.id,
            localDate: round.localDate,
            note: "First-try correct",
            createdAt: finishedAt,
          })
          .run();
      }
      if (grant.earnMastery > 0) {
        tx.insert(schema.learnLedger)
          .values({
            id: randomUUID(),
            profileId,
            kind: "earn_mastery",
            stars: grant.earnMastery,
            minutes: 0,
            roundId: round.id,
            localDate: round.localDate,
            note: "Mastery bonus",
            createdAt: finishedAt,
          })
          .run();
      }
      if (grant.minutesPending > 0) {
        tx.insert(schema.learnGrants)
          .values({
            id: randomUUID(),
            profileId,
            roundId: round.id,
            courseId: round.courseId,
            stars: grant.earnCorrect + grant.earnMastery,
            minutes: grant.minutesPending,
            status: "pending",
            localDate: round.localDate,
            createdAt: finishedAt,
          })
          .run();
      }
      summary = {
        solved,
        total: round.questionCount,
        firstTry,
        decorativeStars: decorativeStars(solved),
        countsForStars: round.scored,
        earnCorrect: grant.earnCorrect,
        masteryStars: grant.earnMastery,
        pendingMinutes: grant.minutesPending,
      };
    }

    const feedback: Feedback = {
      tone: feedbackTone(marked.outcome),
      text: kidMessage(marked.outcome, marked.message, round.scored),
      resolved: marked.resolved,
      correctOptionId: marked.resolved ? marked.correctOptionId : undefined,
      revealClock: marked.revealed ? marked.revealClock : undefined,
      revealPurse: marked.revealed ? marked.revealPurse : undefined,
    };
    return playFrom(storedRound, course.title, fresh, {
      feedback,
      summary,
      focusId: item.id,
    });
  });
}

export function playSnapshot(profileId: string) {
  const home = kidHome(profileId);
  if (!home) return null;
  const sessions = db()
    .select()
    .from(schema.learnPlaySessions)
    .where(eq(schema.learnPlaySessions.profileId, profileId))
    .all();
  const active = sessions.find((row) => row.endsAt > nowIso()) ?? null;
  const decision = decidePlayBlock({
    grants: loadGrants(profileId),
    playedToday: home.playedToday,
    dailyCap: home.profile.dailyCapMinutes,
  });
  return {
    ...home,
    block: PLAY_BLOCK_MINUTES,
    canStart: decision.ok && !active,
    reason: active ? null : decision.ok ? null : decision.reason,
    active: active
      ? { endsAt: active.endsAt, serverNow: nowIso(), minutes: active.minutes }
      : null,
  };
}

export function beginPlay(profileId: string): { endsAt: string } {
  const database = db();
  return database.transaction((tx) => {
    const profile = tx
      .select()
      .from(schema.profiles)
      .where(and(eq(schema.profiles.id, profileId), eq(schema.profiles.learnPortal, true)))
      .get();
    if (!profile) throw new LearnError("That profile is not available.");
    const now = nowIso();
    const existing = tx
      .select()
      .from(schema.learnPlaySessions)
      .where(eq(schema.learnPlaySessions.profileId, profileId))
      .all()
      .find((row) => row.endsAt > now);
    if (existing) return { endsAt: existing.endsAt };

    const today = localDate();
    const playedToday = tx
      .select()
      .from(schema.learnPlaySessions)
      .where(eq(schema.learnPlaySessions.profileId, profileId))
      .all()
      .filter((row) => row.localDate === today)
      .reduce((sum, row) => sum + row.minutes, 0);
    const grants = tx
      .select()
      .from(schema.learnGrants)
      .where(eq(schema.learnGrants.profileId, profileId))
      .orderBy(asc(schema.learnGrants.createdAt))
      .all()
      .map((row) => ({
        id: row.id,
        status: row.status,
        minutes: row.minutes,
        minutesSpent: row.minutesSpent,
      }));
    const decision = decidePlayBlock({
      grants,
      playedToday,
      dailyCap: profile.dailyCapMinutes,
    });
    if (!decision.ok) {
      throw new LearnError(
        decision.reason === "daily_cap"
          ? "Today's game time cap is full."
          : "Game time is not ready yet. A grown-up approves stars first.",
      );
    }
    const spent = applySpend(grants, decision.block);
    if (approvedRemaining(grants) - approvedRemaining(spent) !== decision.block) {
      throw new LearnError("Those minutes could not be used.");
    }
    for (const grant of spent) {
      tx.update(schema.learnGrants)
        .set({ minutesSpent: grant.minutesSpent })
        .where(eq(schema.learnGrants.id, grant.id))
        .run();
    }
    const endsAt = new Date(Date.now() + decision.block * 60 * 1000).toISOString();
    tx.insert(schema.learnPlaySessions)
      .values({
        id: randomUUID(),
        profileId,
        minutes: decision.block,
        localDate: today,
        startedAt: now,
        endsAt,
      })
      .run();
    tx.insert(schema.learnLedger)
      .values({
        id: randomUUID(),
        profileId,
        kind: "spend_play",
        stars: 0,
        minutes: decision.block,
        localDate: today,
        note: "Memory match",
        createdAt: now,
      })
      .run();
    return { endsAt };
  });
}

function parseAcCodes(raw: string): string[] {
  if (!raw.trim()) return [];
  const codes = raw
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);
  if (codes.length > 8 || codes.some((code) => !/^AC9[A-Z0-9]{2,12}$/.test(code))) {
    throw new LearnError("Check the AC codes.");
  }
  return codes;
}

function cleanText(value: string, max: number, label: string): string {
  const text = value.trim().replace(/\s+/g, " ");
  if (!text || text.length > max) throw new LearnError(`Check the ${label}.`);
  return text;
}

export function saveProfile(input: {
  id: string;
  name: string;
  avatarKey: string;
  yearLevel: string;
  dailyCapMinutes: number;
  pin: string;
}) {
  if (!isAvatarKey(input.avatarKey)) throw new LearnError("Pick an icon.");
  const name = cleanText(input.name, 40, "name");
  const year = input.yearLevel.trim();
  if (year && !/^[A-Za-z0-9 ]{1,12}$/.test(year)) throw new LearnError("Check the year level.");
  if (
    !Number.isInteger(input.dailyCapMinutes) ||
    input.dailyCapMinutes < 0 ||
    input.dailyCapMinutes > 120
  ) {
    throw new LearnError("Check the daily cap.");
  }
  const existing = db()
    .select()
    .from(schema.profiles)
    .where(and(eq(schema.profiles.id, input.id), eq(schema.profiles.learnPortal, true)))
    .get();
  if (!existing) throw new LearnError("That profile is not available.");
  const patch: {
    name: string;
    avatarKey: string;
    yearLevel: string | null;
    dailyCapMinutes: number;
    pinHash?: string;
  } = {
    name,
    avatarKey: input.avatarKey,
    yearLevel: year || null,
    dailyCapMinutes: input.dailyCapMinutes,
  };
  if (input.pin) {
    if (!/^\d{4}$/.test(input.pin)) throw new LearnError("PIN must be 4 digits.");
    patch.pinHash = hashSecret(input.pin);
  }
  db().update(schema.profiles).set(patch).where(eq(schema.profiles.id, input.id)).run();
}

export function insertProfile(input: {
  name: string;
  avatarKey: string;
  yearLevel: string;
  dailyCapMinutes: number;
  pin: string;
}) {
  if (!isAvatarKey(input.avatarKey)) throw new LearnError("Pick an icon.");
  if (!/^\d{4}$/.test(input.pin)) throw new LearnError("PIN must be 4 digits.");
  const name = cleanText(input.name, 40, "name");
  const year = input.yearLevel.trim();
  if (year && !/^[A-Za-z0-9 ]{1,12}$/.test(year)) throw new LearnError("Check the year level.");
  if (
    !Number.isInteger(input.dailyCapMinutes) ||
    input.dailyCapMinutes < 0 ||
    input.dailyCapMinutes > 120
  ) {
    throw new LearnError("Check the daily cap.");
  }
  const yearNumber = Number.parseInt(year, 10);
  db()
    .insert(schema.profiles)
    .values({
      id: randomUUID(),
      name,
      avatarKey: input.avatarKey,
      ageBand: !year || Number.isNaN(yearNumber) || yearNumber < 2 ? "little" : "big",
      pinHash: hashSecret(input.pin),
      yearLevel: year || null,
      dailyCapMinutes: input.dailyCapMinutes,
      learnPortal: true,
      energy: 0,
      coins: 0,
      streak: 0,
    })
    .run();
}

export function syncAssignments(pairs: { courseId: string; profileId: string }[]) {
  const profiles = db()
    .select({ id: schema.profiles.id })
    .from(schema.profiles)
    .where(eq(schema.profiles.learnPortal, true))
    .all();
  const courses = new Set(
    db()
      .select({ id: schema.learnCourses.id })
      .from(schema.learnCourses)
      .all()
      .map((row) => row.id),
  );
  const profileIds = profiles.map((row) => row.id);
  const allowed = new Set(profileIds);
  const clean = pairs.filter(
    (pair) => allowed.has(pair.profileId) && courses.has(pair.courseId),
  );
  db().transaction((tx) => {
    if (profileIds.length) {
      tx.delete(schema.learnAssignments)
        .where(inArray(schema.learnAssignments.profileId, profileIds))
        .run();
    }
    for (const pair of clean) {
      tx.insert(schema.learnAssignments)
        .values({ id: randomUUID(), courseId: pair.courseId, profileId: pair.profileId })
        .run();
    }
  });
}

export function createParentCourse(input: {
  title: string;
  subjectName: string;
  blurb: string;
  yearLevel: string;
  acCodes: string;
}) {
  const title = cleanText(input.title, 80, "title");
  const subjectName = cleanText(input.subjectName, 40, "subject");
  const blurb = input.blurb.trim().replace(/\s+/g, " ");
  if (blurb.length > 280) throw new LearnError("Check the description.");
  const year = input.yearLevel.trim();
  if (year && !/^[A-Za-z0-9 ]{1,12}$/.test(year)) throw new LearnError("Check the year level.");
  const id = randomUUID();
  db().transaction((tx) => {
    tx.insert(schema.learnCourses)
      .values({
        id,
        title,
        blurb,
        subjectName,
        yearLevel: year || null,
        acCodesJson: JSON.stringify(parseAcCodes(input.acCodes)),
        kind: "parent",
        sortOrder: 50,
        createdAt: nowIso(),
      })
      .run();
    tx.insert(schema.learnLessons)
      .values({ id: randomUUID(), courseId: id, title: "Lesson 1", sortOrder: 1 })
      .run();
  });
  return id;
}

function editableCourse(courseId: string) {
  const course = db()
    .select()
    .from(schema.learnCourses)
    .where(eq(schema.learnCourses.id, courseId))
    .get();
  if (!course) throw new LearnError("That course is missing.");
  if (course.kind === "builtin") throw new LearnError("This course stays as it is.");
  return course;
}

export function saveCourseMeta(input: {
  id: string;
  title: string;
  subjectName: string;
  blurb: string;
  yearLevel: string;
  acCodes: string;
}) {
  const course = editableCourse(input.id);
  if (course.kind !== "parent") throw new LearnError("Built-in course text stays as it is.");
  const title = cleanText(input.title, 80, "title");
  const subjectName = cleanText(input.subjectName, 40, "subject");
  const blurb = input.blurb.trim().replace(/\s+/g, " ");
  if (blurb.length > 280) throw new LearnError("Check the description.");
  const year = input.yearLevel.trim();
  if (year && !/^[A-Za-z0-9 ]{1,12}$/.test(year)) throw new LearnError("Check the year level.");
  db()
    .update(schema.learnCourses)
    .set({
      title,
      subjectName,
      blurb,
      yearLevel: year || null,
      acCodesJson: JSON.stringify(parseAcCodes(input.acCodes)),
    })
    .where(eq(schema.learnCourses.id, input.id))
    .run();
}

export function addLesson(courseId: string, title: string) {
  editableCourse(courseId);
  const text = cleanText(title, 80, "lesson title");
  const count = db()
    .select({ id: schema.learnLessons.id })
    .from(schema.learnLessons)
    .where(eq(schema.learnLessons.courseId, courseId))
    .all().length;
  db()
    .insert(schema.learnLessons)
    .values({ id: randomUUID(), courseId, title: text, sortOrder: count + 1 })
    .run();
}

function lessonCourse(lessonId: string) {
  const lesson = db()
    .select()
    .from(schema.learnLessons)
    .where(eq(schema.learnLessons.id, lessonId))
    .get();
  if (!lesson) throw new LearnError("That lesson is missing.");
  editableCourse(lesson.courseId);
  return lesson;
}

export function addQuestion(input: {
  lessonId: string;
  prompt: string;
  type: "mcq" | "numeric";
  choices: string[];
  correctIndex: number;
  answers: string[];
  explanation: string;
  hint: string;
}) {
  const lesson = lessonCourse(input.lessonId);
  const prompt = cleanText(input.prompt, 280, "question");
  const explanation = input.explanation.trim().slice(0, 280);
  const hint = input.hint.trim().slice(0, 200);
  const count = db()
    .select({ id: schema.learnQuestions.id })
    .from(schema.learnQuestions)
    .where(eq(schema.learnQuestions.lessonId, lesson.id))
    .all().length;
  if (input.type === "mcq") {
    const choices = input.choices.map((choice) => choice.trim()).filter(Boolean);
    if (choices.length < 2 || choices.length > 4 || choices.some((choice) => choice.length > 80)) {
      throw new LearnError("Add 2 to 4 choices.");
    }
    if (input.correctIndex < 0 || input.correctIndex >= choices.length) {
      throw new LearnError("Pick the correct choice.");
    }
    db()
      .insert(schema.learnQuestions)
      .values({
        id: randomUUID(),
        lessonId: lesson.id,
        prompt,
        type: "mcq",
        choicesJson: JSON.stringify(choices),
        correctIndex: input.correctIndex,
        explanation,
        hint,
        sortOrder: count + 1,
      })
      .run();
    return;
  }
  const answers = input.answers.map((answer) => answer.trim()).filter(Boolean);
  if (!answers.length || answers.length > 6 || answers.some((answer) => answer.length > 20)) {
    throw new LearnError("Add at least one accepted number.");
  }
  db()
    .insert(schema.learnQuestions)
    .values({
      id: randomUUID(),
      lessonId: lesson.id,
      prompt,
      type: "numeric",
      answersJson: JSON.stringify(answers),
      explanation,
      hint,
      sortOrder: count + 1,
    })
    .run();
}

export function updateQuestion(input: {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  answers: string[];
  explanation: string;
  hint: string;
}) {
  const question = db()
    .select()
    .from(schema.learnQuestions)
    .where(eq(schema.learnQuestions.id, input.id))
    .get();
  if (!question) throw new LearnError("That question is missing.");
  lessonCourse(question.lessonId);
  const prompt = cleanText(input.prompt, 280, "question");
  const explanation = input.explanation.trim().slice(0, 280);
  const hint = input.hint.trim().slice(0, 200);
  if (question.type === "mcq") {
    const choices = input.choices.map((choice) => choice.trim()).filter(Boolean);
    if (choices.length < 2 || choices.length > 4 || choices.some((choice) => choice.length > 80)) {
      throw new LearnError("Add 2 to 4 choices.");
    }
    if (input.correctIndex < 0 || input.correctIndex >= choices.length) {
      throw new LearnError("Pick the correct choice.");
    }
    db()
      .update(schema.learnQuestions)
      .set({
        prompt,
        choicesJson: JSON.stringify(choices),
        correctIndex: input.correctIndex,
        explanation,
        hint,
      })
      .where(eq(schema.learnQuestions.id, question.id))
      .run();
    return;
  }
  const answers = input.answers.map((answer) => answer.trim()).filter(Boolean);
  if (!answers.length || answers.length > 6 || answers.some((answer) => answer.length > 20)) {
    throw new LearnError("Add at least one accepted number.");
  }
  db()
    .update(schema.learnQuestions)
    .set({
      prompt,
      answersJson: JSON.stringify(answers),
      explanation,
      hint,
    })
    .where(eq(schema.learnQuestions.id, question.id))
    .run();
}

function grantRow(id: string) {
  const grant = db().select().from(schema.learnGrants).where(eq(schema.learnGrants.id, id)).get();
  if (!grant) throw new LearnError("That reward is missing.");
  return grant;
}

export function approveGrant(id: string) {
  const grant = grantRow(id);
  if (grant.status !== "pending") throw new LearnError("That reward is not waiting.");
  const at = nowIso();
  db().transaction((tx) => {
    tx.update(schema.learnGrants)
      .set({ status: "approved" })
      .where(eq(schema.learnGrants.id, id))
      .run();
    tx.insert(schema.learnLedger)
      .values({
        id: randomUUID(),
        profileId: grant.profileId,
        kind: "approve",
        minutes: grant.minutes,
        grantId: grant.id,
        localDate: localDate(),
        note: "Approved",
        createdAt: at,
      })
      .run();
  });
}

export function declineGrantRow(id: string) {
  const grant = grantRow(id);
  if (grant.status !== "pending") throw new LearnError("That reward is not waiting.");
  const at = nowIso();
  db().transaction((tx) => {
    tx.update(schema.learnGrants)
      .set({ status: "declined" })
      .where(eq(schema.learnGrants.id, id))
      .run();
    tx.insert(schema.learnLedger)
      .values({
        id: randomUUID(),
        profileId: grant.profileId,
        kind: "decline",
        minutes: grant.minutes,
        grantId: grant.id,
        localDate: localDate(),
        note: "Declined",
        createdAt: at,
      })
      .run();
  });
}

export function adjustGrant(id: string, minutes: number) {
  const grant = grantRow(id);
  if (grant.status === "declined") throw new LearnError("That reward was declined.");
  const decision = adjustGrantMinutes(
    {
      id: grant.id,
      status: grant.status,
      minutes: grant.minutes,
      minutesSpent: grant.minutesSpent,
    },
    minutes,
  );
  if (!decision.ok) throw new LearnError("Minutes cannot go below time already played.");
  const at = nowIso();
  db().transaction((tx) => {
    tx.update(schema.learnGrants)
      .set({ minutes: decision.minutes })
      .where(eq(schema.learnGrants.id, id))
      .run();
    tx.insert(schema.learnLedger)
      .values({
        id: randomUUID(),
        profileId: grant.profileId,
        kind: "adjust",
        minutes: decision.minutes,
        grantId: grant.id,
        localDate: localDate(),
        note: "Adjusted",
        createdAt: at,
      })
      .run();
  });
}

export function courseEditor(courseId: string) {
  const course = db()
    .select()
    .from(schema.learnCourses)
    .where(eq(schema.learnCourses.id, courseId))
    .get();
  if (!course) return null;
  const lessons = db()
    .select()
    .from(schema.learnLessons)
    .where(eq(schema.learnLessons.courseId, courseId))
    .orderBy(asc(schema.learnLessons.sortOrder))
    .all()
    .map((lesson) => ({
      ...lesson,
      questions: db()
        .select()
        .from(schema.learnQuestions)
        .where(eq(schema.learnQuestions.lessonId, lesson.id))
        .orderBy(asc(schema.learnQuestions.sortOrder))
        .all()
        .map((question) => ({
          ...question,
          choices: question.choicesJson ? parseJson<string[]>(question.choicesJson) : [],
          answers: question.answersJson ? parseJson<string[]>(question.answersJson) : [],
          acCodes: parseJson<string[]>(question.acCodesJson),
        })),
    }));
  return {
    course: {
      ...course,
      acCodes: parseJson<string[]>(course.acCodesJson),
    },
    lessons,
  };
}

export function parentDashboard() {
  const profiles = db()
    .select()
    .from(schema.profiles)
    .where(eq(schema.profiles.learnPortal, true))
    .orderBy(asc(schema.profiles.name))
    .all();
  const courses = db()
    .select()
    .from(schema.learnCourses)
    .orderBy(asc(schema.learnCourses.sortOrder))
    .all();
  const lessons = db().select().from(schema.learnLessons).all();
  const questions = db().select({ id: schema.learnQuestions.id, lessonId: schema.learnQuestions.lessonId }).from(schema.learnQuestions).all();
  const assignments = db().select().from(schema.learnAssignments).all();
  const rounds = db().select().from(schema.learnRounds).all();
  const grants = db().select().from(schema.learnGrants).orderBy(desc(schema.learnGrants.createdAt)).all();
  const ledger = db().select().from(schema.learnLedger).orderBy(desc(schema.learnLedger.createdAt)).all();
  const sessions = db().select().from(schema.learnPlaySessions).all();
  const names = new Map(profiles.map((profile) => [profile.id, profile.name]));
  const titles = new Map(courses.map((course) => [course.id, course.title]));
  const today = localDate();
  const weekStarts = new Set<string>([weekRange(today).start]);
  for (const row of [...rounds, ...grants, ...sessions, ...ledger]) {
    weekStarts.add(weekRange(row.localDate).start);
  }

  return {
    profiles: profiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      avatarKey: profile.avatarKey,
      yearLevel: profile.yearLevel,
      dailyCapMinutes: profile.dailyCapMinutes,
      stars: starTotal(profile.id),
    })),
    courses: courses.map((course) => {
      const lessonIds = new Set(lessons.filter((lesson) => lesson.courseId === course.id).map((lesson) => lesson.id));
      return {
        id: course.id,
        title: course.title,
        blurb: course.blurb,
        subjectName: course.subjectName,
        yearLevel: course.yearLevel,
        acCodes: parseJson<string[]>(course.acCodesJson),
        kind: course.kind,
        builtinKey: course.builtinKey,
        lessonCount: lessonIds.size,
        questionCount: questions.filter((question) => lessonIds.has(question.lessonId)).length,
      };
    }),
    assignments: assignments.map((row) => ({ courseId: row.courseId, profileId: row.profileId })),
    grants: grants
      .filter((grant) => grant.status !== "declined")
      .map((grant) => ({
        id: grant.id,
        profileId: grant.profileId,
        profileName: names.get(grant.profileId) ?? "Profile",
        courseTitle: grant.courseId ? titles.get(grant.courseId) ?? "Course" : null,
        stars: grant.stars,
        minutes: grant.minutes,
        minutesSpent: grant.minutesSpent,
        status: grant.status,
        localDate: grant.localDate,
      })),
    history: ledger.slice(0, 40).map((row) => ({
      id: row.id,
      profileName: names.get(row.profileId) ?? "Profile",
      kind: row.kind,
      stars: row.stars,
      minutes: row.minutes,
      localDate: row.localDate,
      note: row.note,
      createdAt: row.createdAt,
    })),
    weeks: [...weekStarts]
      .sort()
      .reverse()
      .map((start) => ({
        start,
        end: addCalendarDays(start, 6),
        label: formatWeekLabel(start, addCalendarDays(start, 6)),
        profiles: profiles.map((profile) => ({
          profileId: profile.id,
          profileName: profile.name,
          days: datesInWeek(start)
            .map((date) => {
              const dayRounds = rounds.filter(
                (round) =>
                  round.profileId === profile.id &&
                  round.localDate === date &&
                  round.status === "finished",
              );
              const dayGrants = grants.filter(
                (grant) => grant.profileId === profile.id && grant.localDate === date,
              );
              const played = sessions
                .filter((session) => session.profileId === profile.id && session.localDate === date)
                .reduce((sum, session) => sum + session.minutes, 0);
              const courseIds = new Set(dayRounds.map((round) => round.courseId));
              return {
                date,
                played,
                cap: profile.dailyCapMinutes,
                courses: [...courseIds].map((courseId) => {
                  const mine = dayRounds.filter((round) => round.courseId === courseId);
                  const mineIds = new Set(mine.map((round) => round.id));
                  const stars = ledger
                    .filter(
                      (row) =>
                        mineIds.has(row.roundId ?? "") &&
                        (row.kind === "earn_correct" || row.kind === "earn_mastery"),
                    )
                    .reduce((sum, row) => sum + row.stars, 0);
                  const mineGrants = dayGrants.filter((grant) => grant.courseId === courseId);
                  return {
                    courseId,
                    title: titles.get(courseId) ?? "Course",
                    rounds: mine.length,
                    firstTry: mine.reduce((sum, round) => sum + round.firstTryCorrect, 0),
                    stars,
                    pending: mineGrants
                      .filter((grant) => grant.status === "pending")
                      .reduce((sum, grant) => sum + grant.minutes, 0),
                    approved: mineGrants
                      .filter((grant) => grant.status === "approved")
                      .reduce((sum, grant) => sum + grant.minutes, 0),
                  };
                }),
              };
            })
            .filter((day) => day.played > 0 || day.courses.length > 0 || day.date === today),
        })),
      })),
  };
}
