import Link from "next/link";
import { notFound } from "next/navigation";

import { startRound } from "@/app/kid/actions";
import { RoundPlayer } from "@/components/learn/round-player";
import { requireKid } from "@/lib/learn/session";
import { loadCourse } from "@/lib/learn/store";

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ e?: string }>;
}) {
  const { profileId } = await requireKid();
  const { courseId } = await params;
  const { e } = await searchParams;
  const data = loadCourse(profileId, courseId);
  if (!data) notFound();

  if (data.play) {
    return <RoundPlayer initial={data.play} />;
  }

  const questionCount = data.lessons.reduce((sum, lesson) => sum + lesson.questionCount, 0);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Link href="/kid" className="font-semibold text-ink/70">
        Courses
      </Link>
      <section className="rounded-[28px] bg-white/90 p-6">
        <p className="text-sm font-bold text-ink/60">{data.course.subjectName}</p>
        <h2 className="font-display text-4xl font-semibold text-ink">{data.course.title}</h2>
        <p className="mt-2 text-lg text-ink/80">{data.course.blurb}</p>
        {data.practice ? (
          <p className="mt-3 rounded-2xl bg-amber-100 px-4 py-3 text-ink">
            Stars for this course are already saved today. Another round is practice.
          </p>
        ) : (
          <p className="mt-3 text-ink/80">
            First-try correct answers add a star. A later try adds none.
          </p>
        )}
        {e ? <p className="mt-3 text-ink">That round could not start.</p> : null}
        <div className="mt-4 flex flex-col gap-3">
          {data.course.builtinKey === "time_money" ? (
            <>
              <StartButton courseId={data.course.id} mode="time" label="Telling time" />
              <StartButton courseId={data.course.id} mode="money" label="Aussie money" />
            </>
          ) : (
            <>
              <ul className="list-disc pl-5 text-ink/80">
                {data.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    {lesson.title} · {lesson.questionCount} questions
                  </li>
                ))}
              </ul>
              <StartButton
                courseId={data.course.id}
                mode="quiz"
                label={questionCount ? "Start round" : "No questions yet"}
                disabled={questionCount === 0}
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function StartButton({
  courseId,
  mode,
  label,
  disabled = false,
}: {
  courseId: string;
  mode: string;
  label: string;
  disabled?: boolean;
}) {
  return (
    <form action={startRound}>
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="mode" value={mode} />
      <button
        type="submit"
        disabled={disabled}
        className="min-h-16 w-full rounded-2xl bg-sky-600 text-2xl font-bold text-white disabled:opacity-50"
      >
        {label}
      </button>
    </form>
  );
}
