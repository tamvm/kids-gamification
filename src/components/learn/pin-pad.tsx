"use client";

import { useActionState, useEffect, useState } from "react";

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export function PinPad({
  profileId,
  name,
  emoji,
  action,
}: {
  profileId: string;
  name: string;
  emoji: string;
  action: (prev: { error: string }, formData: FormData) => Promise<{ error: string }>;
}) {
  const [state, formAction, pending] = useActionState(action, { error: "" });
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (state.error) setPin("");
  }, [state.error]);

  return (
    <form action={formAction} className="mx-auto flex w-full max-w-md flex-col items-center gap-5">
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="pin" value={pin} />
      <div className="text-7xl" aria-hidden="true">
        {emoji}
      </div>
      <h1 className="font-display text-4xl font-semibold text-ink">{name}</h1>
      <p className="text-lg text-ink/80">Enter the 4-digit PIN.</p>
      <div className="flex gap-3" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <span
            key={index}
            className="grid h-14 w-12 place-items-center rounded-2xl bg-white text-2xl font-bold text-ink"
          >
            {pin[index] ? "•" : ""}
          </span>
        ))}
      </div>
      {state.error ? (
        <p className="rounded-2xl bg-amber-100 px-4 py-3 text-center text-ink" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="grid w-full grid-cols-3 gap-3">
        {DIGITS.map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={pending || pin.length >= 4}
            className="min-h-16 rounded-2xl bg-white text-3xl font-bold text-ink shadow-sm disabled:opacity-50"
            onClick={(event) => {
              const next = `${pin}${digit}`.slice(0, 4);
              setPin(next);
              if (next.length === 4) {
                const form = event.currentTarget.form;
                if (!form) return;
                const field = form.elements.namedItem("pin");
                if (field instanceof HTMLInputElement) field.value = next;
                form.requestSubmit();
              }
            }}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          className="col-span-3 min-h-14 rounded-2xl bg-white/70 text-lg font-semibold text-ink"
          onClick={() => setPin("")}
        >
          Clear
        </button>
      </div>
    </form>
  );
}
