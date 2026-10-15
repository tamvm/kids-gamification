/**
 * First logic question set for the little explorer (~age 4).
 * Short prompts + emoji so a pre-reader can play with a parent reading aloud.
 */

export const LOGIC_LITTLE_SUBJECT = {
  id: "subject-logic",
  name: "Logic",
  slug: "logic",
  icon: "puzzle",
  sortOrder: 0,
} as const;

export const LOGIC_LITTLE_LESSON = {
  id: "lesson-logic-1",
  subjectId: LOGIC_LITTLE_SUBJECT.id,
  title: "Little Thinkers",
  mapNodeId: "node-meadow",
  sortOrder: 1,
  energyCostToUnlock: 0,
  difficulty: "easy" as const,
};

export type SeedQuestion = {
  id: string;
  lessonId: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
};

export const LOGIC_LITTLE_QUESTIONS: SeedQuestion[] = [
  {
    id: "q-logic-1-pattern-star",
    lessonId: LOGIC_LITTLE_LESSON.id,
    prompt: "What comes next? ⭐ 🌙 ⭐ 🌙 …",
    choices: ["⭐", "🍎", "🐶"],
    correctIndex: 0,
    explanation: "The pattern is star, moon, star, moon — so a star comes next.",
    difficulty: "easy",
  },
  {
    id: "q-logic-1-odd-out-food",
    lessonId: LOGIC_LITTLE_LESSON.id,
    prompt: "Which one does not belong?",
    choices: ["🍎 Apple", "🍌 Banana", "🚗 Car"],
    correctIndex: 2,
    explanation: "Apple and banana are foods. A car is not food.",
    difficulty: "easy",
  },
  {
    id: "q-logic-1-biggest",
    lessonId: LOGIC_LITTLE_LESSON.id,
    prompt: "Which animal is the biggest?",
    choices: ["🐭 Mouse", "🐱 Cat", "🐘 Elephant"],
    correctIndex: 2,
    explanation: "An elephant is much bigger than a mouse or a cat.",
    difficulty: "easy",
  },
  {
    id: "q-logic-1-same-dog",
    lessonId: LOGIC_LITTLE_LESSON.id,
    prompt: "Find the same: 🐶",
    choices: ["🐱", "🐶", "🐰"],
    correctIndex: 1,
    explanation: "The matching picture is the dog.",
    difficulty: "easy",
  },
  {
    id: "q-logic-1-wear",
    lessonId: LOGIC_LITTLE_LESSON.id,
    prompt: "Which one can you wear?",
    choices: ["🧦 Sock", "⚽ Ball", "🍎 Apple"],
    correctIndex: 0,
    explanation: "A sock is clothes. You wear it on your foot.",
    difficulty: "easy",
  },
  {
    id: "q-logic-1-more-dots",
    lessonId: LOGIC_LITTLE_LESSON.id,
    prompt: "Which group has more?",
    choices: ["● ●", "● ● ● ●", "●"],
    correctIndex: 1,
    explanation: "Four dots is more than two dots or one dot.",
    difficulty: "easy",
  },
  {
    id: "q-logic-1-color-pattern",
    lessonId: LOGIC_LITTLE_LESSON.id,
    prompt: "What comes next? 🔴 🔵 🔴 🔵 …",
    choices: ["🟢", "🔴", "🟡"],
    correctIndex: 1,
    explanation: "The pattern is red, blue, red, blue — so red comes next.",
    difficulty: "easy",
  },
  {
    id: "q-logic-1-before-shoes",
    lessonId: LOGIC_LITTLE_LESSON.id,
    prompt: "What do you put on before shoes?",
    choices: ["🎩 Hat", "🧦 Socks", "🧤 Gloves"],
    correctIndex: 1,
    explanation: "Socks go on your feet before shoes.",
    difficulty: "easy",
  },
  {
    id: "q-logic-1-opposite-hot",
    lessonId: LOGIC_LITTLE_LESSON.id,
    prompt: "What is the opposite of hot?",
    choices: ["Cold", "Big", "Fast"],
    correctIndex: 0,
    explanation: "Hot and cold are opposites.",
    difficulty: "easy",
  },
  {
    id: "q-logic-1-water",
    lessonId: LOGIC_LITTLE_LESSON.id,
    prompt: "Which one belongs in the water?",
    choices: ["🐟 Fish", "🐦 Bird", "🦁 Lion"],
    correctIndex: 0,
    explanation: "A fish lives in the water.",
    difficulty: "easy",
  },
  {
    id: "q-logic-1-fruit",
    lessonId: LOGIC_LITTLE_LESSON.id,
    prompt: "Which one is a fruit?",
    choices: ["🐶 Dog", "🍎 Apple", "🚗 Car"],
    correctIndex: 1,
    explanation: "An apple is a fruit you can eat.",
    difficulty: "easy",
  },
  {
    id: "q-logic-1-sequence-morning",
    lessonId: LOGIC_LITTLE_LESSON.id,
    prompt: "In the morning, what comes first?",
    choices: ["Go to bed", "Wake up", "Brush teeth at night"],
    correctIndex: 1,
    explanation: "Morning starts when you wake up.",
    difficulty: "medium",
  },
];
