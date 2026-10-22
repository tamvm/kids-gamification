"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import { submitAttempt } from "@/app/kid/actions";
import { COIN_CENTS, moneyLabel } from "@/lib/learn/money-format";
import type { Attempt, PlayState } from "@/lib/learn/types";

import { ClockFace, ClockLegend } from "./clock";
import { MoneyFace } from "./money";
import { SpeakButton } from "./speak-button";

export function RoundPlayer({ initial }: { initial: PlayState }) {
  const [state, setState] = useState(initial);
  const [pending, start] = useTransition();
  const [wrong, setWrong] = useState<string[]>([]);
  const [clock, setClock] = useState({ h: 12, m: 0 });
  const [purse, setPurse] = useState<number[]>([]);
  const [numeric, setNumeric] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    setWrong([]);
    setClock({ h: 12, m: 0 });
    setPurse([]);
    setNumeric("");
  }, [state.item?.id]);

  useEffect(() => {
    if (state.feedback?.revealClock) setClock(state.feedback.revealClock);
    if (state.feedback?.revealPurse) setPurse(state.feedback.revealPurse);
  }, [state.feedback]);

  const item = state.item;
  const locked = pending || Boolean(state.feedback?.resolved) || !item;

  function send(attempt: Attempt) {
    if (!item || locked) return;
    start(async () => {
      const next = await submitAttempt(state.roundId, item.id, attempt);
      setState(next);
      if (attempt.type === "option" && next.feedback && !next.feedback.resolved) {
        setWrong((current) => [...current, attempt.optionId]);
      }
    });
  }

  if (showSummary && state.summary) {
    const summary = state.summary;
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-[28px] bg-white/90 p-6 text-center shadow-sm">
        <p className="text-5xl" aria-hidden="true">
          {"⭐".repeat(summary.decorativeStars)}
        </p>
        <h2 className="font-display text-4xl font-semibold text-ink">
          You got {summary.solved} out of {summary.total}
        </h2>
        <p className="text-lg text-ink/80">
          These end stars are just for fun. They do not add game time.
        </p>
        {summary.countsForStars ? (
          <div className="space-y-1 text-lg text-ink">
            <p>Game-time stars: {summary.earnCorrect}</p>
            {summary.masteryStars > 0 ? <p>Mastery bonus: {summary.masteryStars} stars</p> : null}
            <p>Minutes waiting for a grown-up: {summary.pendingMinutes}</p>
          </div>
        ) : (
          <p className="text-lg text-ink">Practice round. No new stars were saved.</p>
        )}
        <Link href="/kid" className="min-h-14 rounded-2xl bg-rose-600 px-6 py-3 text-xl font-bold text-white">
          Back home
        </Link>
      </section>
    );
  }

  if (!item) {
    return (
      <Link href="/kid" className="text-lg font-semibold text-ink">
        Back home
      </Link>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-[28px] bg-white/90 p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-3 text-lg font-bold text-ink">
        <span>
          Question {state.index} of {state.total}
        </span>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-amber-400"
            style={{ width: `${(state.index - (state.feedback?.resolved ? 0 : 1)) / state.total * 100}%` }}
          />
        </div>
        <span>{state.countsForStars ? `Stars ${state.firstTry}` : "Practice"}</span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <h2 className="text-center text-2xl font-bold text-ink sm:text-3xl">{item.prompt}</h2>
        <SpeakButton text={item.say} />
      </div>
      {item.stretch && item.kind.startsWith("time") && "stretchLabel" in item && item.stretchLabel ? (
        <p className="mx-auto rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-950">
          Stretch · {item.stretchLabel}
        </p>
      ) : null}

      {item.kind === "time_read" ? (
        <div className="flex flex-col items-center gap-3">
          <ClockFace h={item.clock.h} m={item.clock.m} />
          <ClockLegend />
          <OptionRow
            options={item.options}
            wrong={wrong}
            correctId={state.feedback?.correctOptionId}
            disabled={locked}
            onPick={(optionId) => send({ type: "option", optionId })}
          />
        </div>
      ) : null}

      {item.kind === "time_match" ? (
        <div className="flex flex-wrap justify-center gap-3">
          {item.options.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={locked || wrong.includes(option.id)}
              aria-label={`Clock ${option.h}:${option.m < 10 ? "0" : ""}${option.m}`}
              className={optionClass(option.id, wrong, state.feedback?.correctOptionId)}
              onClick={() => send({ type: "option", optionId: option.id })}
            >
              <ClockFace h={option.h} m={option.m} size="sm" />
            </button>
          ))}
        </div>
      ) : null}

      {item.kind === "time_set" ? (
        <div className="flex flex-col items-center gap-3">
          <ClockFace h={clock.h} m={clock.m} />
          <ClockLegend />
          <div className="flex flex-wrap justify-center gap-4">
            <HandControls
              label="Hours (short hand)"
              tone="bg-slate-800"
              disabled={locked}
              onBack={() => setClock((current) => ({ ...current, h: current.h === 1 ? 12 : current.h - 1 }))}
              onForward={() => setClock((current) => ({ ...current, h: current.h === 12 ? 1 : current.h + 1 }))}
            />
            <HandControls
              label="Minutes (long hand)"
              tone="bg-rose-600"
              disabled={locked}
              onBack={() =>
                setClock((current) => {
                  if (current.m === 0) return { h: current.h === 1 ? 12 : current.h - 1, m: 55 };
                  return { ...current, m: current.m - 5 };
                })
              }
              onForward={() =>
                setClock((current) => {
                  if (current.m === 55) return { h: current.h === 12 ? 1 : current.h + 1, m: 0 };
                  return { ...current, m: current.m + 5 };
                })
              }
            />
          </div>
          <button
            type="button"
            disabled={locked}
            className="min-h-14 rounded-2xl bg-emerald-600 px-6 text-xl font-bold text-white disabled:opacity-50"
            onClick={() => send({ type: "clock", h: clock.h, m: clock.m })}
          >
            Check
          </button>
        </div>
      ) : null}

      {item.kind === "money_pick" ? (
        <div className="flex flex-wrap justify-center gap-3">
          {item.options.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={locked || wrong.includes(option.id)}
              className={optionClass(option.id, wrong, state.feedback?.correctOptionId)}
              onClick={() => send({ type: "option", optionId: option.id })}
            >
              <MoneyFace cents={option.cents} size="lg" />
            </button>
          ))}
        </div>
      ) : null}

      {item.kind === "money_count" ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-3xl border-4 border-dashed border-amber-200 bg-amber-50 p-4">
            {item.items.map((cents, index) => (
              <MoneyFace key={`${cents}-${index}`} cents={cents} size="lg" />
            ))}
          </div>
          <OptionRow
            options={item.options}
            wrong={wrong}
            correctId={state.feedback?.correctOptionId}
            disabled={locked}
            onPick={(optionId) => send({ type: "option", optionId })}
          />
        </div>
      ) : null}

      {item.kind === "money_enough" ? (
        <div className="flex flex-col items-center gap-3">
          <ShopTag emoji={item.itemEmoji} price={item.priceLabel} />
          <p className="font-bold text-ink">Your money</p>
          <div className="flex flex-wrap justify-center gap-2">
            {item.purse.map((cents, index) => (
              <MoneyFace key={`${cents}-${index}`} cents={cents} size="md" />
            ))}
          </div>
          <OptionRow
            options={item.options}
            wrong={wrong}
            correctId={state.feedback?.correctOptionId}
            disabled={locked}
            onPick={(optionId) => send({ type: "option", optionId })}
          />
        </div>
      ) : null}

      {item.kind === "money_purse" ? (
        <div className="flex flex-col items-center gap-3">
          <ShopTag emoji={item.itemEmoji} price={item.priceLabel} />
          <div className="flex flex-wrap justify-center gap-2">
            {COIN_CENTS.map((cents) => (
              <button
                key={cents}
                type="button"
                disabled={locked}
                aria-label={`Add ${moneyLabel(cents)}`}
                onClick={() => setPurse((current) => (current.length >= 40 ? current : [...current, cents]))}
              >
                <MoneyFace cents={cents} size="md" />
              </button>
            ))}
          </div>
          <div className="w-full max-w-xl rounded-[28px] border-4 border-pink-300 bg-pink-100 p-3">
            <div className="flex justify-between font-bold text-ink">
              <span>My purse</span>
              <span>{moneyLabel(purse.reduce((sum, cents) => sum + cents, 0))}</span>
            </div>
            <div className="mt-2 flex min-h-16 flex-wrap justify-center gap-1">
              {purse.length === 0 ? (
                <p className="text-pink-800">Tap a coin to put it in the purse.</p>
              ) : (
                purse.map((cents, index) => (
                  <button
                    key={`${cents}-${index}`}
                    type="button"
                    disabled={locked}
                    aria-label={`Remove ${moneyLabel(cents)}`}
                    onClick={() => setPurse((current) => current.filter((_, coinIndex) => coinIndex !== index))}
                  >
                    <MoneyFace cents={cents} size="sm" />
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={locked}
              className="min-h-14 rounded-2xl bg-emerald-600 px-6 text-xl font-bold text-white disabled:opacity-50"
              onClick={() => send({ type: "purse", cents: purse })}
            >
              Check
            </button>
            <button
              type="button"
              disabled={locked}
              className="min-h-14 rounded-2xl bg-slate-400 px-6 text-xl font-bold text-white"
              onClick={() => setPurse([])}
            >
              Reset
            </button>
          </div>
        </div>
      ) : null}

      {item.kind === "mcq" ? (
        <OptionRow
          options={item.options}
          wrong={wrong}
          correctId={state.feedback?.correctOptionId}
          disabled={locked}
          onPick={(optionId) => send({ type: "option", optionId })}
        />
      ) : null}

      {item.kind === "numeric" ? (
        <form
          className="mx-auto flex w-full max-w-sm flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            send({ type: "numeric", value: numeric });
          }}
        >
          <input
            inputMode="decimal"
            value={numeric}
            disabled={locked}
            onChange={(event) => setNumeric(event.target.value)}
            className="min-h-16 rounded-2xl border-4 border-slate-200 px-4 text-center text-3xl font-bold text-ink"
            aria-label="Your answer"
          />
          <button
            type="submit"
            disabled={locked}
            className="min-h-14 rounded-2xl bg-emerald-600 text-xl font-bold text-white disabled:opacity-50"
          >
            Check
          </button>
        </form>
      ) : null}

      {state.feedback ? (
        <p
          role="status"
          className={`rounded-2xl px-4 py-3 text-center text-lg ${
            state.feedback.tone === "good"
              ? "bg-emerald-100 text-emerald-950"
              : state.feedback.tone === "show"
                ? "bg-sky-100 text-sky-950"
                : "bg-amber-100 text-amber-950"
          }`}
        >
          {state.feedback.text}
        </p>
      ) : null}

      {state.feedback?.resolved ? (
        <button
          type="button"
          className="mx-auto min-h-14 rounded-2xl bg-rose-600 px-6 text-xl font-bold text-white"
          onClick={() => {
            if (state.summary) {
              setShowSummary(true);
              return;
            }
            if (!state.nextItem) return;
            setState((current) => ({
              ...current,
              item: current.nextItem,
              nextItem: null,
              feedback: null,
              index: (current.nextItem ? current.index + 1 : current.index),
            }));
          }}
        >
          {state.summary ? "See score" : "Next"}
        </button>
      ) : null}
    </section>
  );
}

function optionClass(id: string, wrong: string[], correctId?: string) {
  const base = "min-h-16 rounded-2xl border-4 bg-slate-50 px-4 py-3 text-xl font-bold text-ink disabled:opacity-70";
  if (correctId === id) return `${base} border-emerald-500 bg-emerald-50`;
  if (wrong.includes(id)) return `${base} border-rose-300 bg-rose-50`;
  return `${base} border-slate-200`;
}

function OptionRow({
  options,
  wrong,
  correctId,
  disabled,
  onPick,
}: {
  options: { id: string; label: string }[];
  wrong: string[];
  correctId?: string;
  disabled: boolean;
  onPick: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          disabled={disabled || wrong.includes(option.id)}
          className={optionClass(option.id, wrong, correctId)}
          onClick={() => onPick(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function HandControls({
  label,
  tone,
  disabled,
  onBack,
  onForward,
}: {
  label: string;
  tone: string;
  disabled: boolean;
  onBack: () => void;
  onForward: () => void;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2 text-center">
      <p className="mb-2 font-bold text-ink">{label}</p>
      <button type="button" disabled={disabled} aria-label={`${label} back`} className={`mx-1 h-14 w-14 rounded-2xl text-3xl font-bold text-white ${tone}`} onClick={onBack}>
        −
      </button>
      <button type="button" disabled={disabled} aria-label={`${label} forward`} className={`mx-1 h-14 w-14 rounded-2xl text-3xl font-bold text-white ${tone}`} onClick={onForward}>
        +
      </button>
    </div>
  );
}

function ShopTag({ emoji, price }: { emoji: string; price: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-3xl bg-amber-50 px-4 py-2 text-5xl" aria-hidden="true">
        {emoji}
      </span>
      <span className="rounded-2xl bg-amber-300 px-4 py-2 text-2xl font-bold text-ink">{price}</span>
    </div>
  );
}
