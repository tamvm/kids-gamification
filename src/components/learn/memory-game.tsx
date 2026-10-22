"use client";

import { useEffect, useMemo, useState } from "react";

import { gameClock } from "@/app/kid/actions";

import { ClockFace } from "./clock";
import { MoneyFace } from "./money";

type Face =
  | { key: string; label: string; kind: "coin"; cents: number }
  | { key: string; label: string; kind: "note"; cents: number }
  | { key: string; label: string; kind: "clock"; h: number; m: number };

const FACES: Face[] = [
  { key: "5c", label: "5 cent coin", kind: "coin", cents: 5 },
  { key: "2d", label: "2 dollar coin", kind: "coin", cents: 200 },
  { key: "10n", label: "10 dollar note", kind: "note", cents: 1000 },
  { key: "3", label: "3 o'clock", kind: "clock", h: 3, m: 0 },
  { key: "630", label: "half past 6", kind: "clock", h: 6, m: 30 },
  { key: "1215", label: "quarter past 12", kind: "clock", h: 12, m: 15 },
];

export function MemoryGame({
  endsAt,
  serverNow,
}: {
  endsAt: string;
  serverNow: string;
}) {
  const [endsAtMs, setEndsAtMs] = useState(Date.parse(endsAt));
  const [skew, setSkew] = useState(() => Date.parse(serverNow) - Date.now());
  const [now, setNow] = useState(() => Date.now() + (Date.parse(serverNow) - Date.now()));
  const [ended, setEnded] = useState(false);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const cards = useMemo(() => {
    const deck = FACES.flatMap((face) => [
      { uid: `${face.key}-a`, face },
      { uid: `${face.key}-b`, face },
    ]);
    for (let index = deck.length - 1; index > 0; index--) {
      const swap = Math.floor(Math.random() * (index + 1));
      [deck[index], deck[swap]] = [deck[swap], deck[index]];
    }
    return deck;
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now() + skew), 250);
    const poll = setInterval(async () => {
      const clock = await gameClock();
      setSkew(Date.parse(clock.serverNow) - Date.now());
      if (clock.endsAt) setEndsAtMs(Date.parse(clock.endsAt));
      if (clock.ended) setEnded(true);
    }, 5000);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [skew]);

  const left = Math.max(0, endsAtMs - now);
  const timeUp = ended || left <= 0;
  const minutes = Math.floor(left / 60000);
  const seconds = Math.floor((left % 60000) / 1000);

  function flip(index: number) {
    if (timeUp || matched.includes(cards[index].face.key) || open.includes(index) || open.length === 2) {
      return;
    }
    const next = [...open, index];
    setOpen(next);
    if (next.length === 2) {
      const [first, second] = next;
      if (cards[first].face.key === cards[second].face.key) {
        setMatched((current) => [...current, cards[first].face.key]);
        setOpen([]);
      } else {
        setTimeout(() => setOpen([]), 700);
      }
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between rounded-3xl bg-white/90 px-4 py-3">
        <p className="font-display text-3xl font-semibold text-ink" aria-live="polite">
          {timeUp ? "0:00" : `${minutes}:${seconds.toString().padStart(2, "0")}`}
        </p>
        <p className="text-ink/80">Memory match</p>
      </div>
      {timeUp ? (
        <p className="rounded-2xl bg-amber-100 px-4 py-3 text-center text-lg text-ink" role="status">
          Time is up. These minutes stay used.
        </p>
      ) : null}
      {matched.length === FACES.length && !timeUp ? (
        <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-center text-lg text-ink">
          You found every pair. The timer keeps going. This game does not add stars.
        </p>
      ) : null}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {cards.map((card, index) => {
          const faceUp = !timeUp && (matched.includes(card.face.key) || open.includes(index));
          return (
            <button
              key={card.uid}
              type="button"
              disabled={timeUp}
              aria-label={faceUp ? card.face.label : "Hidden card"}
              className="grid min-h-28 place-items-center rounded-2xl bg-white p-2 shadow-sm disabled:opacity-80"
              onClick={() => flip(index)}
            >
              {faceUp ? <FaceArt face={card.face} /> : <span className="text-3xl" aria-hidden="true">★</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FaceArt({ face }: { face: Face }) {
  if (face.kind === "clock") return <ClockFace h={face.h} m={face.m} size="sm" />;
  return <MoneyFace cents={face.cents} size="sm" />;
}
