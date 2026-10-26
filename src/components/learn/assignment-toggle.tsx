"use client";

import { useRef, useState } from "react";

import { setAssignmentAction } from "@/app/parent/actions";

export function AssignmentToggle({
  courseId,
  profileId,
  profileName,
  checked,
}: {
  courseId: string;
  profileId: string;
  profileName: string;
  checked: boolean;
}) {
  const [on, setOn] = useState(checked);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const request = useRef(0);

  async function toggle(next: boolean) {
    const id = ++request.current;
    setOn(next);
    setStatus("saving");
    try {
      const result = await setAssignmentAction({ courseId, profileId, assigned: next });
      if (id !== request.current) return;
      if (!result.ok) {
        setOn(!next);
        setStatus("error");
        return;
      }
      setStatus("saved");
    } catch {
      if (id !== request.current) return;
      setOn(!next);
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2 font-semibold text-ink">
        <input
          type="checkbox"
          checked={on}
          aria-label={profileName}
          onChange={(event) => {
            void toggle(event.target.checked);
          }}
        />
        {profileName}
      </label>
      {status === "saving" ? (
        <span className="text-sm font-semibold text-ink/60" role="status">
          Đang lưu / Saving
        </span>
      ) : null}
      {status === "saved" ? (
        <span className="text-sm font-semibold text-emerald-800" role="status">
          Đã lưu / Saved
        </span>
      ) : null}
      {status === "error" ? (
        <span className="text-sm font-semibold text-red-800" role="alert">
          Chưa lưu / Not saved
        </span>
      ) : null}
    </div>
  );
}
