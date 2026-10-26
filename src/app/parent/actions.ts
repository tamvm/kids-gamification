"use server";

import { redirect } from "next/navigation";

import { requireParent } from "@/lib/learn/session";
import {
  addLesson,
  addQuestion,
  adjustGrant,
  approveGrant,
  createParentCourse,
  declineGrantRow,
  insertProfile,
  LearnError,
  saveCourseMeta,
  saveProfile,
  setCourseAssignment,
  updateQuestion,
} from "@/lib/learn/store";

function fail(path: string, error: unknown): never {
  if (error instanceof LearnError) redirect(`${path}?e=1`);
  throw error;
}

export async function saveProfileAction(formData: FormData) {
  await requireParent();
  const id = String(formData.get("id") ?? "");
  try {
    saveProfile({
      id,
      name: String(formData.get("name") ?? ""),
      avatarKey: String(formData.get("avatarKey") ?? ""),
      yearLevel: String(formData.get("yearLevel") ?? ""),
      dailyCapMinutes: Number(formData.get("dailyCapMinutes")),
      pin: String(formData.get("pin") ?? ""),
    });
  } catch (error) {
    fail("/parent", error);
  }
  redirect("/parent");
}

export async function createProfileAction(formData: FormData) {
  await requireParent();
  try {
    insertProfile({
      name: String(formData.get("name") ?? ""),
      avatarKey: String(formData.get("avatarKey") ?? ""),
      yearLevel: String(formData.get("yearLevel") ?? ""),
      dailyCapMinutes: Number(formData.get("dailyCapMinutes")),
      pin: String(formData.get("pin") ?? ""),
    });
  } catch (error) {
    fail("/parent", error);
  }
  redirect("/parent");
}

export async function setAssignmentAction(input: {
  courseId: string;
  profileId: string;
  assigned: boolean;
}): Promise<{ ok: true } | { ok: false }> {
  await requireParent();
  if (
    !input ||
    typeof input.courseId !== "string" ||
    typeof input.profileId !== "string" ||
    typeof input.assigned !== "boolean" ||
    input.courseId.length === 0 ||
    input.courseId.length > 80 ||
    input.profileId.length === 0 ||
    input.profileId.length > 80
  ) {
    return { ok: false };
  }
  try {
    setCourseAssignment({
      courseId: input.courseId,
      profileId: input.profileId,
      assigned: input.assigned,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof LearnError) return { ok: false };
    throw error;
  }
}

export async function createCourseAction(formData: FormData) {
  await requireParent();
  try {
    const id = createParentCourse({
      title: String(formData.get("title") ?? ""),
      subjectName: String(formData.get("subjectName") ?? ""),
      blurb: String(formData.get("blurb") ?? ""),
      yearLevel: String(formData.get("yearLevel") ?? ""),
      acCodes: String(formData.get("acCodes") ?? ""),
    });
    redirect(`/parent/courses/${id}`);
  } catch (error) {
    fail("/parent", error);
  }
}

export async function saveCourseAction(formData: FormData) {
  await requireParent();
  const id = String(formData.get("id") ?? "");
  try {
    saveCourseMeta({
      id,
      title: String(formData.get("title") ?? ""),
      subjectName: String(formData.get("subjectName") ?? ""),
      blurb: String(formData.get("blurb") ?? ""),
      yearLevel: String(formData.get("yearLevel") ?? ""),
      acCodes: String(formData.get("acCodes") ?? ""),
    });
  } catch (error) {
    fail(`/parent/courses/${id}`, error);
  }
  redirect(`/parent/courses/${id}`);
}

export async function addLessonAction(formData: FormData) {
  await requireParent();
  const courseId = String(formData.get("courseId") ?? "");
  try {
    addLesson(courseId, String(formData.get("title") ?? ""));
  } catch (error) {
    fail(`/parent/courses/${courseId}`, error);
  }
  redirect(`/parent/courses/${courseId}`);
}

function questionInput(formData: FormData) {
  const choices = [0, 1, 2, 3].map((index) => String(formData.get(`choice${index}`) ?? ""));
  const correct = Number(formData.get("correct"));
  const answers = String(formData.get("answers") ?? "")
    .split(",")
    .map((answer) => answer.trim())
    .filter(Boolean);
  return {
    prompt: String(formData.get("prompt") ?? ""),
    choices,
    correctIndex: correct,
    answers,
    explanation: String(formData.get("explanation") ?? ""),
    hint: String(formData.get("hint") ?? ""),
  };
}

export async function addQuestionAction(formData: FormData) {
  await requireParent();
  const courseId = String(formData.get("courseId") ?? "");
  const type = String(formData.get("type") ?? "") === "numeric" ? "numeric" : "mcq";
  try {
    addQuestion({
      lessonId: String(formData.get("lessonId") ?? ""),
      type,
      ...questionInput(formData),
    });
  } catch (error) {
    fail(`/parent/courses/${courseId}`, error);
  }
  redirect(`/parent/courses/${courseId}`);
}

export async function updateQuestionAction(formData: FormData) {
  await requireParent();
  const courseId = String(formData.get("courseId") ?? "");
  try {
    updateQuestion({
      id: String(formData.get("id") ?? ""),
      ...questionInput(formData),
    });
  } catch (error) {
    fail(`/parent/courses/${courseId}`, error);
  }
  redirect(`/parent/courses/${courseId}`);
}

export async function approveAction(formData: FormData) {
  await requireParent();
  try {
    approveGrant(String(formData.get("id") ?? ""));
  } catch (error) {
    fail("/parent", error);
  }
  redirect("/parent");
}

export async function declineAction(formData: FormData) {
  await requireParent();
  try {
    declineGrantRow(String(formData.get("id") ?? ""));
  } catch (error) {
    fail("/parent", error);
  }
  redirect("/parent");
}

export async function adjustAction(formData: FormData) {
  await requireParent();
  try {
    adjustGrant(String(formData.get("id") ?? ""), Number(formData.get("minutes")));
  } catch (error) {
    fail("/parent", error);
  }
  redirect("/parent");
}
