import Link from "next/link";

import {
  adjustAction,
  approveAction,
  createCourseAction,
  createProfileAction,
  declineAction,
  saveProfileAction,
} from "@/app/parent/actions";
import { AssignmentToggle } from "@/components/learn/assignment-toggle";
import { AVATARS, avatarByKey } from "@/lib/learn/avatars";
import { AC_TEXT, TIME_STRETCH_NOTE } from "@/lib/learn/content";
import { parentDashboard } from "@/lib/learn/store";

export const dynamic = "force-dynamic";

const inputClass = "min-h-12 rounded-xl border border-slate-300 px-3";

export default async function ParentPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const { e } = await searchParams;
  const data = parentDashboard();

  return (
    <main className="flex flex-col gap-8">
      {e ? (
        <p className="rounded-2xl bg-amber-100 px-4 py-3 text-ink">Check the form and try again.</p>
      ) : null}

      <section className="rounded-[28px] bg-white/90 p-5">
        <h2 className="font-display text-3xl font-semibold text-ink">Profiles</h2>
        <p className="mb-4 text-ink/70">Display name, icon, year level, and daily cap. No surname or date of birth.</p>
        <div className="flex flex-col gap-4">
          {data.profiles.map((profile) => (
            <form key={profile.id} action={saveProfileAction} className="grid gap-2 rounded-2xl bg-slate-50 p-3 md:grid-cols-6">
              <input type="hidden" name="id" value={profile.id} />
              <input name="name" defaultValue={profile.name} aria-label="Display name" className={inputClass} />
              <AvatarField value={profile.avatarKey} />
              <input name="yearLevel" defaultValue={profile.yearLevel ?? ""} aria-label="Year level" placeholder="Year" className={inputClass} />
              <input name="dailyCapMinutes" type="number" min={0} max={120} defaultValue={profile.dailyCapMinutes} aria-label="Daily cap minutes" className={inputClass} />
              <input name="pin" inputMode="numeric" maxLength={4} placeholder="New PIN" aria-label="New PIN" className={inputClass} />
              <button className="min-h-12 rounded-xl bg-slate-900 font-bold text-white">Save</button>
              <p className="md:col-span-6 text-sm text-ink/70">
                {avatarByKey(profile.avatarKey).emoji} Stars {profile.stars}. Leave PIN blank to keep it.
              </p>
            </form>
          ))}
          <form action={createProfileAction} className="grid gap-2 rounded-2xl border border-dashed border-slate-300 p-3 md:grid-cols-6">
            <input name="name" required placeholder="Display name" aria-label="Display name" className={inputClass} />
            <AvatarField />
            <input name="yearLevel" placeholder="Year" aria-label="Year level" className={inputClass} />
            <input name="dailyCapMinutes" type="number" min={0} max={120} defaultValue={15} aria-label="Daily cap minutes" className={inputClass} />
            <input name="pin" required inputMode="numeric" maxLength={4} placeholder="PIN" aria-label="PIN" className={inputClass} />
            <button className="min-h-12 rounded-xl bg-emerald-700 font-bold text-white">Add profile</button>
          </form>
        </div>
      </section>

      <section className="rounded-[28px] bg-white/90 p-5">
        <h2 className="font-display text-3xl font-semibold text-ink">Courses</h2>
        <div className="mt-4 flex flex-col gap-4">
          {data.courses.map((course) => (
            <article key={course.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-2xl font-semibold text-ink">{course.title}</h3>
                <Link href={`/parent/courses/${course.id}`} className="font-bold text-sky-800">
                  {course.kind === "builtin" ? "View" : "Edit"}
                </Link>
              </div>
              <p className="text-sm font-semibold text-ink/60">
                {course.subjectName}
                {course.yearLevel ? ` · Year ${course.yearLevel}` : ""} · {course.lessonCount} lessons
              </p>
              <p className="mt-1 text-ink/80">{course.blurb}</p>
              {course.acCodes.length ? (
                <ul className="mt-2 space-y-1 text-sm text-ink">
                  {course.acCodes.map((code) => (
                    <li key={code}>
                      <b>{code}</b> — {AC_TEXT[code] ?? "Australian Curriculum code"}
                    </li>
                  ))}
                </ul>
              ) : null}
              {course.builtinKey === "time_money" ? (
                <p className="mt-2 text-sm text-ink/80">{TIME_STRETCH_NOTE}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-4">
                {data.profiles.map((profile) => (
                  <AssignmentToggle
                    key={profile.id}
                    courseId={course.id}
                    profileId={profile.id}
                    profileName={profile.name}
                    checked={data.assignments.some(
                      (row) => row.courseId === course.id && row.profileId === profile.id,
                    )}
                  />
                ))}
              </div>
            </article>
          ))}
        </div>
        <form action={createCourseAction} className="mt-6 grid gap-2 md:grid-cols-2">
          <h3 className="md:col-span-2 font-display text-2xl font-semibold text-ink">New course</h3>
          <input name="title" required placeholder="Title" className={inputClass} />
          <input name="subjectName" required placeholder="Subject" className={inputClass} />
          <input name="yearLevel" placeholder="Year" className={inputClass} />
          <input name="acCodes" placeholder="AC codes, comma separated" className={inputClass} />
          <input name="blurb" placeholder="Short description" className={`${inputClass} md:col-span-2`} />
          <button className="min-h-12 rounded-xl bg-emerald-700 font-bold text-white">Create course</button>
        </form>
      </section>

      <section className="rounded-[28px] bg-white/90 p-5">
        <h2 className="font-display text-3xl font-semibold text-ink">Rewards</h2>
        <p className="mb-3 text-ink/70">Approve before minutes can be played. Adjust cannot go below minutes already used.</p>
        <div className="flex flex-col gap-3">
          {data.grants.length === 0 ? <p className="text-ink/70">No rewards yet.</p> : null}
          {data.grants.map((grant) => (
            <article key={grant.id} className="rounded-2xl bg-slate-50 p-3">
              <p className="font-semibold text-ink">
                {grant.profileName} · {grant.courseTitle ?? "Reward"} · {grant.localDate}
              </p>
              <p className="text-ink/80">
                {grant.stars} stars · {grant.minutes} min · {grant.status} · used {grant.minutesSpent} min
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {grant.status === "pending" ? (
                  <>
                    <form action={approveAction}>
                      <input type="hidden" name="id" value={grant.id} />
                      <button className="min-h-10 rounded-xl bg-emerald-700 px-3 font-bold text-white">Approve</button>
                    </form>
                    <form action={declineAction}>
                      <input type="hidden" name="id" value={grant.id} />
                      <button className="min-h-10 rounded-xl bg-slate-500 px-3 font-bold text-white">Decline</button>
                    </form>
                  </>
                ) : null}
                <form action={adjustAction} className="flex gap-2">
                  <input type="hidden" name="id" value={grant.id} />
                  <input
                    name="minutes"
                    type="number"
                    min={grant.minutesSpent}
                    defaultValue={grant.minutes}
                    aria-label="Minutes"
                    className="w-24 rounded-xl border px-2"
                  />
                  <button className="min-h-10 rounded-xl bg-slate-900 px-3 font-bold text-white">Adjust</button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] bg-white/90 p-5">
        <h2 className="font-display text-3xl font-semibold text-ink">Week</h2>
        <p className="mb-3 text-ink/70">Monday to Sunday, Australia/Brisbane.</p>
        {data.weeks.map((week) => (
          <article key={week.start} className="mb-4">
            <h3 className="text-xl font-bold text-ink">{week.label}</h3>
            {week.profiles.map((profile) => (
              <div key={profile.profileId} className="mt-2">
                <p className="font-semibold text-ink">{profile.profileName}</p>
                {profile.days.length === 0 ? <p className="text-sm text-ink/60">Nothing recorded.</p> : null}
                {profile.days.map((day) => (
                  <div key={day.date} className="mt-1 text-sm text-ink/80">
                    <p>
                      {day.date} · played {day.played}/{day.cap} min
                    </p>
                    {day.courses.map((course) => (
                      <p key={course.courseId}>
                        {course.title}: {course.rounds} rounds, first-try {course.firstTry}, stars {course.stars}, pending {course.pending} min, approved {course.approved} min
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </article>
        ))}
      </section>

      <section className="rounded-[28px] bg-white/90 p-5">
        <h2 className="font-display text-3xl font-semibold text-ink">Star history</h2>
        <ul className="mt-3 space-y-1 text-sm text-ink">
          {data.history.length === 0 ? <li>No history yet.</li> : null}
          {data.history.map((row) => (
            <li key={row.id}>
              {row.localDate} · {row.profileName} · {row.kind}
              {row.stars ? ` · ${row.stars} stars` : ""}
              {row.minutes ? ` · ${row.minutes} min` : ""}
              {row.note ? ` · ${row.note}` : ""}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function AvatarField({ value }: { value?: string }) {
  return (
    <select name="avatarKey" defaultValue={value ?? "owl"} aria-label="Icon" className={inputClass}>
      {AVATARS.map((avatar) => (
        <option key={avatar.key} value={avatar.key}>
          {avatar.emoji} {avatar.label}
        </option>
      ))}
    </select>
  );
}
