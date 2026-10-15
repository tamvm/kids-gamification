import { count } from "drizzle-orm";

import {
  LOGIC_LITTLE_LESSON,
  LOGIC_LITTLE_QUESTIONS,
  LOGIC_LITTLE_SUBJECT,
} from "./content/logic-little";
import { getDb, schema } from "./index";

const {
  profiles,
  subjects,
  lessons,
  questions,
  mapNodes,
  mapPickups,
  profileNodeUnlocks,
} = schema;

function choice(choices: string[]) {
  return JSON.stringify(choices);
}

/** Upsert the age-4 Logic starter set so existing DBs pick up new content. */
export function ensureLogicLittleContent() {
  const db = getDb();

  db.transaction((tx) => {
    tx.insert(subjects)
      .values(LOGIC_LITTLE_SUBJECT)
      .onConflictDoUpdate({
        target: subjects.id,
        set: {
          name: LOGIC_LITTLE_SUBJECT.name,
          slug: LOGIC_LITTLE_SUBJECT.slug,
          icon: LOGIC_LITTLE_SUBJECT.icon,
          sortOrder: LOGIC_LITTLE_SUBJECT.sortOrder,
        },
      })
      .run();

    tx.insert(lessons)
      .values(LOGIC_LITTLE_LESSON)
      .onConflictDoUpdate({
        target: lessons.id,
        set: {
          subjectId: LOGIC_LITTLE_LESSON.subjectId,
          title: LOGIC_LITTLE_LESSON.title,
          mapNodeId: LOGIC_LITTLE_LESSON.mapNodeId,
          sortOrder: LOGIC_LITTLE_LESSON.sortOrder,
          energyCostToUnlock: LOGIC_LITTLE_LESSON.energyCostToUnlock,
          difficulty: LOGIC_LITTLE_LESSON.difficulty,
        },
      })
      .run();

    for (const q of LOGIC_LITTLE_QUESTIONS) {
      tx.insert(questions)
        .values({
          id: q.id,
          lessonId: q.lessonId,
          prompt: q.prompt,
          choicesJson: choice(q.choices),
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          difficulty: q.difficulty,
        })
        .onConflictDoUpdate({
          target: questions.id,
          set: {
            lessonId: q.lessonId,
            prompt: q.prompt,
            choicesJson: choice(q.choices),
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            difficulty: q.difficulty,
          },
        })
        .run();
    }

    // Meadow is the first stop — point it at Little Thinkers.
    tx.insert(mapNodes)
      .values({
        id: "node-meadow",
        realm: "meadow",
        label: "Sunny Meadow",
        x: 18,
        y: 62,
        unlockOrder: 0,
        lessonId: LOGIC_LITTLE_LESSON.id,
        energyCostToEnter: 0,
      })
      .onConflictDoUpdate({
        target: mapNodes.id,
        set: {
          lessonId: LOGIC_LITTLE_LESSON.id,
          label: "Sunny Meadow",
          energyCostToEnter: 0,
        },
      })
      .run();
  });

  console.log(
    `Logic little set ready: ${LOGIC_LITTLE_QUESTIONS.length} questions in "${LOGIC_LITTLE_LESSON.title}"`,
  );
}

export function seedIfEmpty() {
  const db = getDb();
  const [{ value: profileCount }] = db
    .select({ value: count() })
    .from(profiles)
    .all();

  // Always refresh the little Logic curriculum (idempotent upserts).
  ensureLogicLittleContent();

  if (profileCount > 0) {
    console.log("Seed skipped: profiles already exist");
    return;
  }

  db.transaction((tx) => {
    tx.insert(mapNodes)
      .values([
        {
          id: "node-meadow",
          realm: "meadow",
          label: "Sunny Meadow",
          x: 18,
          y: 62,
          unlockOrder: 0,
          lessonId: LOGIC_LITTLE_LESSON.id,
          energyCostToEnter: 0,
        },
        {
          id: "node-bridge",
          realm: "meadow",
          label: "Wooden Bridge",
          x: 48,
          y: 48,
          unlockOrder: 1,
          lessonId: "lesson-writing-1",
          energyCostToEnter: 2,
        },
        {
          id: "node-castle",
          realm: "castle",
          label: "Puzzle Castle",
          x: 78,
          y: 32,
          unlockOrder: 2,
          lessonId: "lesson-chess-1",
          energyCostToEnter: 3,
        },
      ])
      .onConflictDoNothing()
      .run();

    tx.insert(mapPickups)
      .values([
        {
          id: "pickup-meadow-star",
          nodeId: "node-meadow",
          coinAmount: 5,
          kind: "star",
        },
        {
          id: "pickup-bridge-chest",
          nodeId: "node-bridge",
          coinAmount: 10,
          kind: "chest",
        },
        {
          id: "pickup-castle-sparkle",
          nodeId: "node-castle",
          coinAmount: 15,
          kind: "sparkle",
        },
      ])
      .onConflictDoNothing()
      .run();

    tx.insert(subjects)
      .values([
        {
          id: "subject-math",
          name: "Math",
          slug: "math",
          icon: "calc",
          sortOrder: 1,
        },
        {
          id: "subject-writing",
          name: "Writing",
          slug: "writing",
          icon: "pencil",
          sortOrder: 2,
        },
        {
          id: "subject-chess",
          name: "Chess",
          slug: "chess",
          icon: "knight",
          sortOrder: 3,
        },
      ])
      .onConflictDoNothing()
      .run();

    tx.insert(lessons)
      .values([
        {
          id: "lesson-math-1",
          subjectId: "subject-math",
          title: "Counting Adventures",
          mapNodeId: null,
          sortOrder: 1,
          energyCostToUnlock: 1,
          difficulty: "easy",
        },
        {
          id: "lesson-writing-1",
          subjectId: "subject-writing",
          title: "Sentence Spotters",
          mapNodeId: "node-bridge",
          sortOrder: 1,
          energyCostToUnlock: 2,
          difficulty: "easy",
        },
        {
          id: "lesson-chess-1",
          subjectId: "subject-chess",
          title: "Meet the Pieces",
          mapNodeId: "node-castle",
          sortOrder: 1,
          energyCostToUnlock: 3,
          difficulty: "easy",
        },
      ])
      .onConflictDoNothing()
      .run();

    tx.insert(questions)
      .values([
        {
          id: "q-math-1",
          lessonId: "lesson-math-1",
          prompt: "What is 2 + 3?",
          choicesJson: choice(["4", "5", "6"]),
          correctIndex: 1,
          explanation: "2 plus 3 equals 5.",
          difficulty: "easy",
        },
        {
          id: "q-math-2",
          lessonId: "lesson-math-1",
          prompt: "How many sides does a triangle have?",
          choicesJson: choice(["2", "3", "4"]),
          correctIndex: 1,
          explanation: "A triangle has 3 sides.",
          difficulty: "easy",
        },
        {
          id: "q-math-3",
          lessonId: "lesson-math-1",
          prompt: "What is 10 − 4?",
          choicesJson: choice(["5", "6", "7", "8"]),
          correctIndex: 1,
          explanation: "10 minus 4 equals 6.",
          difficulty: "medium",
        },
        {
          id: "q-writing-1",
          lessonId: "lesson-writing-1",
          prompt: "Which sentence starts with a capital letter?",
          choicesJson: choice([
            "the cat runs.",
            "The cat runs.",
            "the Cat runs.",
          ]),
          correctIndex: 1,
          explanation: "Sentences start with a capital letter.",
          difficulty: "easy",
        },
        {
          id: "q-writing-2",
          lessonId: "lesson-writing-1",
          prompt: "Which word is a noun?",
          choicesJson: choice(["run", "happy", "dragon", "quickly"]),
          correctIndex: 2,
          explanation: "Dragon is a person, place, or thing — a noun.",
          difficulty: "medium",
        },
        {
          id: "q-chess-1",
          lessonId: "lesson-chess-1",
          prompt: "Which piece moves in an L shape?",
          choicesJson: choice(["Bishop", "Knight", "Rook", "Pawn"]),
          correctIndex: 1,
          explanation: "The knight moves in an L shape.",
          difficulty: "easy",
        },
        {
          id: "q-chess-2",
          lessonId: "lesson-chess-1",
          prompt: "Which piece can move any number of squares diagonally?",
          choicesJson: choice(["Knight", "Rook", "Bishop", "King"]),
          correctIndex: 2,
          explanation: "The bishop moves diagonally.",
          difficulty: "medium",
        },
      ])
      .onConflictDoNothing()
      .run();

    tx.insert(profiles)
      .values([
        {
          id: "profile-little",
          name: "Little Explorer",
          avatarKey: "fox",
          ageBand: "little",
          energy: 5,
          coins: 0,
          streak: 0,
          mapNodeId: "node-meadow",
        },
        {
          id: "profile-big",
          name: "Big Explorer",
          avatarKey: "owl",
          ageBand: "big",
          energy: 5,
          coins: 0,
          streak: 0,
          mapNodeId: "node-meadow",
        },
      ])
      .run();

    tx.insert(profileNodeUnlocks)
      .values([
        {
          id: "unlock-little-meadow",
          profileId: "profile-little",
          nodeId: "node-meadow",
        },
        {
          id: "unlock-big-meadow",
          profileId: "profile-big",
          nodeId: "node-meadow",
        },
      ])
      .run();
  });

  console.log("Seed complete: 2 profiles, Logic + starter subjects, map");
}
