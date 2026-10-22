import Link from "next/link";

import { requireKid } from "@/lib/learn/session";
import { kidHome } from "@/lib/learn/store";

export const dynamic = "force-dynamic";

export default async function KidHomePage() {
  const { profileId } = await requireKid();
  const home = kidHome(profileId);
  if (!home) return null;

  return (
    <main className="flex flex-col gap-4">
      {home.courses.length === 0 ? (
        <p className="rounded-3xl bg-white/80 p-6 text-lg text-ink">
          A grown-up can assign a course in Parent Corner.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {home.courses.map((course) => (
            <Link
              key={course.id}
              href={`/kid/course/${course.id}`}
              className="rounded-[28px] bg-white/90 p-5 shadow-sm"
            >
              <p className="text-sm font-bold text-ink/60">{course.subjectName}</p>
              <h2 className="font-display text-3xl font-semibold text-ink">{course.title}</h2>
              <p className="mt-2 text-ink/80">{course.blurb}</p>
              <p className="mt-3 text-sm font-semibold text-ink">
                {course.finishedRounds} finished
                {course.bestFirstTry !== null ? ` · best first-try ${course.bestFirstTry}` : ""}
                {course.scoredToday ? " · stars already saved today" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
      <Link href="/kid/play" className="rounded-[28px] bg-emerald-700 px-5 py-4 text-xl font-bold text-white">
        Memory game · 5 minutes
      </Link>
    </main>
  );
}
