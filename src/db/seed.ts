import { count } from "drizzle-orm";

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

export function seedIfEmpty() {
  const db = getDb();
  const [{ value: profileCount }] = db
    .select({ value: count() })
    .from(profiles)
    .all();

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
          lessonId: "lesson-math-1",
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
      .run();

    tx.insert(lessons)
      .values([
        {
          id: "lesson-math-1",
          subjectId: "subject-math",
          title: "Counting Adventures",
          mapNodeId: "node-meadow",
          sortOrder: 1,
          energyCostToUnlock: 0,
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

  console.log("Seed complete: 2 profiles, 3 subjects, starter map");
}
