import {
  COIN_CENTS,
  greedyCoins,
  moneyLabel,
  moneySpoken,
  NOTE_CENTS,
  sumCents,
} from "./money-format";
import type { PublicItem, Secret } from "./types";

export type Rng = () => number;

export type Time = { h: number; m: number };

export type ItemDraft = {
  kind: PublicItem["kind"];
  public: PublicItem;
  secret: Secret;
};

const QUARTER = [0, 15, 30, 45];
const FIVE = [5, 10, 20, 25, 35, 40, 50, 55];

const SHOP = [
  ["🍧", "ice block"],
  ["🍎", "apple"],
  ["🧃", "juice box"],
  ["✏️", "pencil"],
  ["🍌", "banana"],
  ["🧁", "cupcake"],
  ["🍪", "biscuit"],
  ["🎈", "balloon"],
  ["📒", "notebook"],
  ["⚽", "ball"],
] as const;

function rndInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function nextHour(h: number): number {
  return (h % 12) + 1;
}

export function prevHour(h: number): number {
  return ((h + 10) % 12) + 1;
}

export function digital(t: Time): string {
  return `${t.h}:${t.m < 10 ? "0" : ""}${t.m}`;
}

export function words(t: Time): string {
  if (t.m === 0) return `${t.h} o'clock`;
  if (t.m === 15) return `quarter past ${t.h}`;
  if (t.m === 30) return `half past ${t.h}`;
  if (t.m === 45) return `quarter to ${nextHour(t.h)}`;
  if (t.m < 30) return `${t.m} past ${t.h}`;
  return `${60 - t.m} to ${nextHour(t.h)}`;
}

function timeKey(t: Time): string {
  return `${t.h}:${t.m}`;
}

function isQuarter(m: number): boolean {
  return m === 0 || m === 15 || m === 30 || m === 45;
}

function randQuarter(rng: Rng): Time {
  return { h: rndInt(rng, 1, 12), m: pick(rng, QUARTER) };
}

function randFive(rng: Rng): Time {
  return { h: rndInt(rng, 1, 12), m: pick(rng, FIVE) };
}

function timeHint(t: Time): string {
  if (t.m === 0) {
    return "For o'clock, the long hand points straight up at 12. The short hand shows the hour.";
  }
  if (t.m === 30) {
    return "Half past: the long hand points down at 6, and the short hand is halfway past the hour.";
  }
  if (t.m === 15) {
    return "Quarter past: the long hand points at 3. The short hand has just gone past the hour.";
  }
  if (t.m === 45) {
    return "Quarter to: the long hand points at 9. The short hand is nearly at the next number.";
  }
  return "Count by fives around the clock with the long hand. The short hand shows the hour it has just passed.";
}

function distractTimes(t: Time, n: number, rng: Rng): Time[] {
  const candidates: Time[] = [
    { h: nextHour(t.h), m: t.m },
    { h: prevHour(t.h), m: t.m },
    { h: t.h, m: (t.m + 30) % 60 },
    { h: t.h, m: (60 - t.m) % 60 },
  ];
  if (t.m % 5 === 0) {
    candidates.push({
      h: t.m === 0 ? 12 : t.m / 5,
      m: (t.h % 12) * 5,
    });
  }
  const seen = new Set<string>([timeKey(t)]);
  const out: Time[] = [];
  for (const candidate of shuffle(rng, candidates)) {
    const key = timeKey(candidate);
    if (candidate.h < 1 || candidate.h > 12 || candidate.m < 0 || candidate.m > 55) {
      continue;
    }
    if (!seen.has(key)) {
      seen.add(key);
      out.push(candidate);
    }
    if (out.length === n) return out;
  }
  let guard = 0;
  while (out.length < n && guard++ < 200) {
    const extra = rng() < 0.5 ? randQuarter(rng) : randFive(rng);
    const key = timeKey(extra);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(extra);
    }
  }
  if (out.length < n) throw new Error("Could not build clock choices");
  return out;
}

function readItem(t: Time, rng: Rng, stretchLabel?: string): ItemDraft {
  const times = shuffle(rng, [t, ...distractTimes(t, 3, rng)]);
  const options = times.map((time, index) => ({
    id: `c${index}`,
    label: words(time),
    key: timeKey(time),
  }));
  const correct = options.find((option) => option.key === timeKey(t));
  if (!correct) throw new Error("Clock answer missing");
  const stretch = Boolean(stretchLabel);
  return {
    kind: "time_read",
    public: {
      kind: "time_read",
      prompt: "What time does the clock show?",
      say: "What time does the clock show?",
      hint: timeHint(t),
      stretch,
      stretchLabel,
      clock: t,
      options: options.map(({ id, label }) => ({ id, label })),
    },
    secret: {
      correctOptionId: correct.id,
      label: `${words(t)} (${digital(t)})`,
      clock: t,
    },
  };
}

function matchItem(t: Time, rng: Rng): ItemDraft {
  const times = shuffle(rng, [t, ...distractTimes(t, 2, rng)]);
  const options = times.map((time, index) => ({
    id: `c${index}`,
    h: time.h,
    m: time.m,
  }));
  const correct = options.find((option) => option.h === t.h && option.m === t.m);
  if (!correct) throw new Error("Match answer missing");
  const stretchLabel = isQuarter(t.m)
    ? "digital time"
    : "digital time · 5-minute";
  return {
    kind: "time_match",
    public: {
      kind: "time_match",
      prompt: `Which clock shows ${digital(t)}?`,
      say: `Which clock shows ${digital(t)}?`,
      hint: timeHint(t),
      stretch: true,
      stretchLabel,
      options,
    },
    secret: {
      correctOptionId: correct.id,
      label: `${digital(t)} (${words(t)})`,
      clock: t,
    },
  };
}

function setItem(t: Time, rng: Rng, style: "words" | "digital"): ItemDraft {
  let target = t;
  let guard = 0;
  while (target.h === 12 && target.m === 0 && guard++ < 8) target = randQuarter(rng);
  const shown = style === "digital" ? digital(target) : words(target);
  const stretchLabel =
    style === "digital"
      ? isQuarter(target.m)
        ? "digital time"
        : "digital time · 5-minute"
      : isQuarter(target.m)
        ? undefined
        : "5-minute time";
  return {
    kind: "time_set",
    public: {
      kind: "time_set",
      prompt: `Set the clock to ${shown}.`,
      say: `Set the clock to ${shown}.`,
      hint: timeHint(target),
      stretch: Boolean(stretchLabel),
      stretchLabel,
    },
    secret: {
      clock: target,
      label: `${words(target)} (${digital(target)})`,
    },
  };
}

export function makeTimeItems(rng: Rng = Math.random): ItemDraft[] {
  const items = [
    readItem(randQuarter(rng), rng),
    readItem(randQuarter(rng), rng),
    readItem(randQuarter(rng), rng),
    readItem(randQuarter(rng), rng),
    readItem(randFive(rng), rng, "5-minute time"),
    readItem(randFive(rng), rng, "5-minute time"),
    matchItem(randQuarter(rng), rng),
    matchItem(randFive(rng), rng),
    setItem(randQuarter(rng), rng, "words"),
    setItem(randFive(rng), rng, "digital"),
  ];
  return shuffle(rng, items);
}

function idCoin(rng: Rng): ItemDraft {
  const target = pick(rng, COIN_CENTS);
  const others = shuffle(
    rng,
    COIN_CENTS.filter((cents) => cents !== target),
  ).slice(0, 3);
  const options = shuffle(rng, [target, ...others]).map((cents, index) => ({
    id: `c${index}`,
    cents,
  }));
  const correct = options.find((option) => option.cents === target);
  if (!correct) throw new Error("Coin answer missing");
  const name = target < 100 ? `${target} cents` : moneySpoken(target);
  return {
    kind: "money_pick",
    public: {
      kind: "money_pick",
      prompt: `Which coin is ${name}?`,
      say: `Which coin is ${name}?`,
      hint: "Cents coins are silver. Dollar coins are gold. Read the number.",
      stretch: false,
      options,
    },
    secret: { correctOptionId: correct.id, label: `the ${moneyLabel(target)} coin` },
  };
}

function idNote(rng: Rng): ItemDraft {
  const target = pick(rng, NOTE_CENTS);
  const others = shuffle(
    rng,
    NOTE_CENTS.filter((cents) => cents !== target),
  ).slice(0, 3);
  const options = shuffle(rng, [target, ...others]).map((cents, index) => ({
    id: `c${index}`,
    cents,
  }));
  const correct = options.find((option) => option.cents === target);
  if (!correct) throw new Error("Note answer missing");
  return {
    kind: "money_pick",
    public: {
      kind: "money_pick",
      prompt: `Which note is ${moneyLabel(target)}?`,
      say: `Which note is ${moneySpoken(target)}?`,
      hint: "Find the number on the note. Each note has its own colour.",
      stretch: false,
      options,
    },
    secret: { correctOptionId: correct.id, label: `the ${moneyLabel(target)} note` },
  };
}

function idMost(rng: Rng): ItemDraft {
  const options = shuffle(rng, COIN_CENTS)
    .slice(0, 4)
    .map((cents, index) => ({ id: `c${index}`, cents }));
  const target = Math.max(...options.map((option) => option.cents));
  const correct = options.find((option) => option.cents === target);
  if (!correct) throw new Error("Most-worth answer missing");
  const hint =
    target === 200
      ? "Size can trick you. The $2 coin is small, but it is worth the most."
      : target === 100
        ? "Gold coins are dollars. A dollar is worth more than any silver coin."
        : "Look at the numbers. Which number is the biggest?";
  return {
    kind: "money_pick",
    public: {
      kind: "money_pick",
      prompt: "Which coin is worth the most?",
      say: "Which coin is worth the most?",
      hint,
      stretch: false,
      options,
    },
    secret: { correctOptionId: correct.id, label: `the ${moneyLabel(target)} coin` },
  };
}

function makeCollection(rng: Rng): number[] {
  const big = rng() < 0.3;
  const limit = big ? 2000 : 1000;
  const pool = big
    ? [5, 10, 20, 50, 100, 200, 500, 1000]
    : [5, 10, 20, 50, 100, 200, 500];
  for (let k = 0; k < 400; k++) {
    const count = big ? rndInt(rng, 2, 4) : rndInt(rng, 2, 5);
    const items = Array.from({ length: count }, () => pick(rng, pool));
    const total = sumCents(items);
    if (total <= limit && total >= 15 && (!big || total > 1000)) {
      return items.sort((a, b) => b - a);
    }
  }
  return [200, 100, 20];
}

function countItem(rng: Rng): ItemDraft {
  const items = makeCollection(rng);
  const total = sumCents(items);
  const values = new Set<number>([total]);
  for (const delta of shuffle(rng, [-100, 100, -50, 50, -20, 20, -10, 10, -5, 5, 200, -200])) {
    const next = total + delta;
    if (next > 0) values.add(next);
    if (values.size === 4) break;
  }
  if (values.size < 4) throw new Error("Money total choices collided");
  const options = shuffle(rng, [...values]).map((cents, index) => ({
    id: `c${index}`,
    label: moneyLabel(cents),
    cents,
  }));
  const correct = options.find((option) => option.cents === total);
  if (!correct) throw new Error("Count answer missing");
  const explain = `${items.map(moneyLabel).join(" + ")} = ${moneyLabel(total)}`;
  return {
    kind: "money_count",
    public: {
      kind: "money_count",
      prompt: "How much money is there altogether?",
      say: "How much money is there altogether?",
      hint: "Start with the biggest one, then count on. 100 cents makes 1 dollar.",
      stretch: false,
      items,
      options: options.map(({ id, label }) => ({ id, label })),
    },
    secret: { correctOptionId: correct.id, label: moneyLabel(total), explain },
  };
}

function enoughItem(rng: Rng): ItemDraft {
  const item = pick(rng, SHOP);
  const price = rndInt(rng, 5, 60) * 10;
  const wantYes = rng() < 0.5;
  const pool = [10, 20, 50, 100, 200, 500];
  let purse: number[] | null = null;
  for (let k = 0; k < 2000 && !purse; k++) {
    const count = rndInt(rng, 2, 5);
    const candidate = Array.from({ length: count }, () => pick(rng, pool));
    const total = sumCents(candidate);
    const gap = Math.max(150, price * 0.5);
    const ok = wantYes
      ? total >= price && total - price <= gap
      : total < price && price - total <= gap;
    if (ok) purse = candidate.sort((a, b) => b - a);
  }
  if (!purse) purse = [price <= 500 ? 500 : 1000];
  const total = sumCents(purse);
  const yes = total >= price;
  return {
    kind: "money_enough",
    public: {
      kind: "money_enough",
      prompt: `The ${item[1]} costs ${moneyLabel(price)}. Do you have enough money?`,
      say: `The ${item[1]} costs ${moneySpoken(price)}. Do you have enough money?`,
      hint: "Count your money first, then compare it with the price.",
      stretch: false,
      itemEmoji: item[0],
      itemName: item[1],
      priceLabel: moneyLabel(price),
      priceCents: price,
      purse,
      options: [
        { id: "yes", label: "Yes" },
        { id: "no", label: "No" },
      ],
    },
    secret: {
      correctOptionId: yes ? "yes" : "no",
      label: yes ? "Yes" : "No",
      explain: `You have ${moneyLabel(total)}. The ${item[1]} costs ${moneyLabel(price)}.`,
    },
  };
}

function purseItem(rng: Rng): ItemDraft {
  const item = pick(rng, SHOP);
  const price = rng() < 0.8 ? rndInt(rng, 3, 40) * 10 : rndInt(rng, 1, 20) * 10 + 5;
  const coins = greedyCoins(price);
  return {
    kind: "money_purse",
    public: {
      kind: "money_purse",
      prompt: `Tap coins to make ${moneyLabel(price)} for the ${item[1]}.`,
      say: `Tap coins to make ${moneySpoken(price)} for the ${item[1]}.`,
      hint: "Start with the biggest coins that fit, then add smaller ones.",
      stretch: false,
      itemEmoji: item[0],
      itemName: item[1],
      priceLabel: moneyLabel(price),
      priceCents: price,
    },
    secret: {
      priceCents: price,
      purse: coins,
      label: coins.map(moneyLabel).join(" + "),
      explain: `One way to make ${moneyLabel(price)}.`,
    },
  };
}

export function makeMoneyItems(rng: Rng = Math.random): ItemDraft[] {
  return shuffle(rng, [
    idCoin(rng),
    idCoin(rng),
    idNote(rng),
    idMost(rng),
    countItem(rng),
    countItem(rng),
    countItem(rng),
    enoughItem(rng),
    enoughItem(rng),
    purseItem(rng),
  ]);
}
