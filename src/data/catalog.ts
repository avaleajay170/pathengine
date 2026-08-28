/**
 * Data access for the course catalogue and learning paths.
 *
 * This is the seam. Route loaders call these functions and nothing else reaches into
 * `./fixtures`, so pointing the app at a real API means rewriting the bodies here and
 * touching no routes and no components.
 *
 * Every accessor is `async` for that reason, even though the fixtures resolve immediately.
 * They resolve with no artificial delay on purpose: a simulated latency makes every loading
 * state look designed when it has never been tested against a real one.
 */

import { matchPrerequisite, type Course, type Review } from "@/domain/course";
import { locateCourse, type CoursePlacement, type LearningPath } from "@/domain/path";

import { categories, courses } from "./fixtures/courses";
import { learningPaths } from "./fixtures/learning-paths";
import { reviewsFor } from "./fixtures/reviews";

export interface PrerequisiteRef {
  /** The label as authored on the course, always renderable. */
  label: string;
  /** The catalogue entry, when the prerequisite is a course we carry. */
  course: Course | undefined;
}

/**
 * Read the first element of a list that must not be empty.
 *
 * Used for the fallback path. Throwing beats returning undefined here: an empty path fixture
 * is a broken build, and a loud failure at startup is easier to fix than pages that render
 * blank in production.
 */
function firstOf<T>(items: readonly T[], label: string): T {
  const [head] = items;
  if (head === undefined) throw new Error(`Catalogue is missing at least one ${label}.`);
  return head;
}

export async function listCategories(): Promise<string[]> {
  return categories;
}

export async function listCourses(): Promise<Course[]> {
  return courses;
}

export async function getCourse(id: string): Promise<Course | undefined> {
  return courses.find((course) => course.id === id);
}

export async function listPaths(): Promise<LearningPath[]> {
  return learningPaths;
}

export async function getPath(id: string): Promise<LearningPath | undefined> {
  return learningPaths.find((path) => path.id === id);
}

/** The path shown when no other is specified. */
export async function getDefaultPath(): Promise<LearningPath> {
  return firstOf(learningPaths, "learning path");
}

export async function getPathOrDefault(id: string): Promise<LearningPath> {
  return (await getPath(id)) ?? (await getDefaultPath());
}

export async function getReviews(courseId: string): Promise<Review[]> {
  const course = await getCourse(courseId);
  return course ? reviewsFor(course) : [];
}

/** Where a course sits in a path, which is what "why this is in your path" explains. */
export async function getCoursePlacement(courseId: string): Promise<CoursePlacement | undefined> {
  return locateCourse(learningPaths, courseId);
}

export async function getPrerequisites(course: Course): Promise<PrerequisiteRef[]> {
  return course.prerequisites.map((label) => ({
    label,
    course: matchPrerequisite(label, courses),
  }));
}

/**
 * Courses a learner might take alongside this one.
 *
 * Shared skills weigh double a shared category: two courses that teach PyTorch are related
 * in a way that two unconnected "AI / ML" courses are not. Courses with nothing in common are
 * dropped rather than padded out, so the section can be empty instead of misleading.
 */
export async function getRelatedCourses(course: Course, limit = 3): Promise<Course[]> {
  return courses
    .filter((candidate) => candidate.id !== course.id)
    .map((candidate) => {
      const sharedSkills = candidate.skills.filter((skill) => course.skills.includes(skill)).length;
      const sameCategory = candidate.category === course.category ? 1 : 0;
      return { candidate, score: sharedSkills * 2 + sameCategory };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}
