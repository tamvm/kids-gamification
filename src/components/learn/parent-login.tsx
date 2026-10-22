"use client";

import { useActionState } from "react";

import { loginParent } from "@/app/auth-actions";

export function ParentLoginForm() {
  const [state, action, pending] = useActionState(loginParent, { error: "" });
  return (
    <form action={action} className="mx-auto flex w-full max-w-md flex-col gap-4">
      <label className="flex flex-col gap-2 text-lg font-semibold text-ink">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-14 rounded-2xl border-4 border-slate-200 px-4 text-xl"
        />
      </label>
      {state.error ? (
        <p className="rounded-2xl bg-amber-100 px-4 py-3 text-ink" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="min-h-14 rounded-2xl bg-slate-900 text-xl font-bold text-white"
      >
        Open Parent Corner
      </button>
    </form>
  );
}
