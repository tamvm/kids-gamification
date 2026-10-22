export type PublicItem =
  | {
      kind: "time_read";
      prompt: string;
      say: string;
      hint: string;
      stretch: boolean;
      stretchLabel?: string;
      clock: { h: number; m: number };
      options: { id: string; label: string }[];
    }
  | {
      kind: "time_match";
      prompt: string;
      say: string;
      hint: string;
      stretch: boolean;
      stretchLabel?: string;
      options: { id: string; h: number; m: number }[];
    }
  | {
      kind: "time_set";
      prompt: string;
      say: string;
      hint: string;
      stretch: boolean;
      stretchLabel?: string;
    }
  | {
      kind: "money_pick";
      prompt: string;
      say: string;
      hint: string;
      stretch: boolean;
      options: { id: string; cents: number }[];
    }
  | {
      kind: "money_count";
      prompt: string;
      say: string;
      hint: string;
      stretch: boolean;
      items: number[];
      options: { id: string; label: string }[];
    }
  | {
      kind: "money_enough";
      prompt: string;
      say: string;
      hint: string;
      stretch: boolean;
      itemEmoji: string;
      itemName: string;
      priceLabel: string;
      priceCents: number;
      purse: number[];
      options: { id: string; label: string }[];
    }
  | {
      kind: "money_purse";
      prompt: string;
      say: string;
      hint: string;
      stretch: boolean;
      itemEmoji: string;
      itemName: string;
      priceLabel: string;
      priceCents: number;
    }
  | {
      kind: "mcq";
      prompt: string;
      say: string;
      hint: string;
      stretch: boolean;
      options: { id: string; label: string }[];
    }
  | {
      kind: "numeric";
      prompt: string;
      say: string;
      hint: string;
      stretch: boolean;
    };

export type Secret = {
  correctOptionId?: string;
  clock?: { h: number; m: number };
  priceCents?: number;
  accepted?: string[];
  purse?: number[];
  label: string;
  explain?: string;
};

export type Attempt =
  | { type: "option"; optionId: string }
  | { type: "clock"; h: number; m: number }
  | { type: "purse"; cents: number[] }
  | { type: "numeric"; value: string };

export type Feedback = {
  tone: "good" | "try" | "show";
  text: string;
  resolved: boolean;
  correctOptionId?: string;
  revealClock?: { h: number; m: number };
  revealPurse?: number[];
};

export type RoundItem = PublicItem & { id: string };

export type Summary = {
  solved: number;
  total: number;
  firstTry: number;
  decorativeStars: number;
  countsForStars: boolean;
  earnCorrect: number;
  masteryStars: number;
  pendingMinutes: number;
};

export type PlayState = {
  roundId: string;
  courseId: string;
  courseTitle: string;
  modeLabel: string;
  countsForStars: boolean;
  index: number;
  total: number;
  solved: number;
  firstTry: number;
  item: RoundItem | null;
  feedback: Feedback | null;
  summary: Summary | null;
  nextItem: RoundItem | null;
};
