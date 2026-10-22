import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addLessonAction,
  addQuestionAction,
  saveCourseAction,
  updateQuestionAction,
} from "@/app/parent/actions";
import { AC_TEXT, TIME_STRETCH_NOTE } from "@/lib/learn/content";
import { courseEditor } from "@/lib/learn/store";

export const dynamic = "force-dynamic";

const inputClass = "min-h-12 w-full rounded-xl border border-slate-300 px-3";

export default async function CourseEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ e?: string }>;
}) {
  const { courseId } = await params;
  const { e } = await searchParams;
  const data = courseEditor(courseId);
  if (!data) notFound();
  const { course, lessons } = data;
  const locked = course.kind === "builtin";

  return (
    <main className="flex flex-col gap-6">
      <Link href="/parent" className="font-semibold text-ink/70">
        Parent Corner
      </Link>
      {e ? <p className="rounded-2xl bg-amber-100 px-4 py-3">Check the form and try again.</p> : null}
      <section className="rounded-[28px] bg-white/90 p-5">
        <p className="text-sm font-bold text-ink/60">{course.subjectName}</p>
        <h2 className="font-display text-4xl font-semibold text-ink">{course.title}</h2>
        {course.acCodes.length ? (
          <ul className="mt-3 space-y-1 text-ink">
            {course.acCodes.map((code) => (
              <li key={code}>
                <b>{code}</b> — {AC_TEXT[code] ?? "Australian Curriculum code"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-ink/70">No AC codes yet.</p>
        )}
        {course.builtinKey === "time_money" ? <p className="mt-3 text-ink/80">{TIME_STRETCH_NOTE}</p> : null}
        {locked ? (
          <p className="mt-3 text-ink/80">
            Clock and coin questions are built in. Assign the course from Parent Corner. Multiple choice and number questions are edited on other courses.
          </p>
        ) : null}
        {course.kind === "parent" ? (
          <form action={saveCourseAction} className="mt-4 grid gap-2">
            <input type="hidden" name="id" value={course.id} />
            <input name="title" defaultValue={course.title} className={inputClass} />
            <input name="subjectName" defaultValue={course.subjectName} className={inputClass} />
            <input name="yearLevel" defaultValue={course.yearLevel ?? ""} className={inputClass} />
            <input name="acCodes" defaultValue={course.acCodes.join(", ")} className={inputClass} />
            <input name="blurb" defaultValue={course.blurb} className={inputClass} />
            <button className="min-h-12 rounded-xl bg-slate-900 font-bold text-white">Save course</button>
          </form>
        ) : null}
      </section>

      {lessons.map((lesson) => (
        <section key={lesson.id} className="rounded-[28px] bg-white/90 p-5">
          <h3 className="font-display text-2xl font-semibold text-ink">{lesson.title}</h3>
          {lesson.questions.length === 0 ? <p className="text-ink/60">No questions in this lesson.</p> : null}
          <div className="mt-3 flex flex-col gap-4">
            {lesson.questions.map((question) => (
              <form key={question.id} action={updateQuestionAction} className="grid gap-2 rounded-2xl bg-slate-50 p-3">
                <input type="hidden" name="courseId" value={course.id} />
                <input type="hidden" name="id" value={question.id} />
                <p className="text-sm font-bold text-ink/60">{question.type === "mcq" ? "Multiple choice" : "Number"}</p>
                {question.acCodes.length ? (
                  <p className="text-sm text-ink/70">{question.acCodes.join(", ")}</p>
                ) : null}
                <textarea name="prompt" defaultValue={question.prompt} rows={2} className={inputClass} disabled={locked} />
                {question.type === "mcq"
                  ? [0, 1, 2, 3].map((index) => (
                      <label key={index} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct"
                          value={index}
                          defaultChecked={question.correctIndex === index}
                          disabled={locked}
                        />
                        <input
                          name={`choice${index}`}
                          defaultValue={question.choices[index] ?? ""}
                          className={inputClass}
                          disabled={locked}
                        />
                      </label>
                    ))
                  : (
                      <input
                        name="answers"
                        defaultValue={question.answers.join(", ")}
                        className={inputClass}
                        disabled={locked}
                      />
                    )}
                <input name="hint" defaultValue={question.hint ?? ""} placeholder="Hint" className={inputClass} disabled={locked} />
                <input name="explanation" defaultValue={question.explanation ?? ""} placeholder="Explanation" className={inputClass} disabled={locked} />
                {locked ? null : (
                  <button className="min-h-10 rounded-xl bg-slate-900 font-bold text-white">Save question</button>
                )}
              </form>
            ))}
          </div>
          {locked ? null : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <form action={addQuestionAction} className="grid gap-2 rounded-2xl border border-dashed p-3">
                <input type="hidden" name="courseId" value={course.id} />
                <input type="hidden" name="lessonId" value={lesson.id} />
                <input type="hidden" name="type" value="mcq" />
                <p className="font-bold text-ink">Add multiple choice</p>
                <textarea name="prompt" required placeholder="Question" className={inputClass} />
                {[0, 1, 2, 3].map((index) => (
                  <label key={index} className="flex items-center gap-2">
                    <input type="radio" name="correct" value={index} defaultChecked={index === 0} />
                    <input name={`choice${index}`} placeholder={`Choice ${index + 1}`} className={inputClass} />
                  </label>
                ))}
                <input name="hint" placeholder="Hint" className={inputClass} />
                <input name="explanation" placeholder="Explanation" className={inputClass} />
                <button className="min-h-10 rounded-xl bg-emerald-700 font-bold text-white">Add choice question</button>
              </form>
              <form action={addQuestionAction} className="grid gap-2 rounded-2xl border border-dashed p-3">
                <input type="hidden" name="courseId" value={course.id} />
                <input type="hidden" name="lessonId" value={lesson.id} />
                <input type="hidden" name="type" value="numeric" />
                <p className="font-bold text-ink">Add a number answer</p>
                <textarea name="prompt" required placeholder="Question" className={inputClass} />
                <input name="answers" required placeholder="Accepted answers, e.g. 15, 15.0" className={inputClass} />
                <input name="hint" placeholder="Hint" className={inputClass} />
                <input name="explanation" placeholder="Explanation" className={inputClass} />
                <button className="min-h-10 rounded-xl bg-emerald-700 font-bold text-white">Add number question</button>
              </form>
            </div>
          )}
        </section>
      ))}

      {locked ? null : (
        <form action={addLessonAction} className="flex gap-2">
          <input type="hidden" name="courseId" value={course.id} />
          <input name="title" required placeholder="New lesson title" className={inputClass} />
          <button className="min-h-12 rounded-xl bg-slate-900 px-4 font-bold text-white">Add lesson</button>
        </form>
      )}
    </main>
  );
}
