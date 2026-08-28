/**
 * Synthesised course reviews.
 *
 * Reviews are generated from the course rather than stored, for one reason: twenty courses
 * would otherwise need sixty hand-written reviews, and the review text has to mention the
 * right instructor, provider and skills or the page reads as filler. Generation is seeded
 * from the course id, so a course always shows the same reviews on every render and on both
 * sides of SSR.
 */

import type { Course, Review } from "@/domain/course";

const reviewers = [
  { name: "Priyanka S.", role: "Analyst, fintech" },
  { name: "Marcus O.", role: "Career switcher" },
  { name: "Yuki T.", role: "Backend engineer" },
  { name: "Dani R.", role: "Recent graduate" },
  { name: "Tobias L.", role: "Ops lead" },
  { name: "Amara N.", role: "Product designer" },
  { name: "Sam K.", role: "Data engineer" },
  { name: "Helena V.", role: "Consultant" },
] as const;

const firstSkill = (course: Course) => course.skills[0] ?? course.category;
const lastSkill = (course: Course) => course.skills[course.skills.length - 1] ?? course.category;
const firstModule = (course: Course) => course.syllabus[0]?.title ?? "the opening module";

const reviewBodies = [
  (course: Course) =>
    `The ${firstSkill(course)} sections are the reason to take this. I'd tried two other ${course.category} courses before and this was the first one that explained why rather than just how. Budget more than the listed ${course.hours} hours if you actually do the exercises.`,
  (course: Course) =>
    `${course.instructor} moves fast but never skips the reasoning. I watched at 1.5x and still had to rewind the ${lastSkill(course)} material twice — in a good way.`,
  (course: Course) =>
    `Good structure, and the assignments are graded on real datasets instead of toy examples. Docked a star because a couple of the ${course.provider} platform videos are a year out of date.`,
  (course: Course) =>
    `Came in as a ${course.level.toLowerCase()} and that was the right call. The first module felt slow, then it earned it — by the end I'd shipped something I put in my portfolio.`,
  (course: Course) =>
    `Worth it for the ${firstSkill(course)} depth alone. I use about half of this at work now, and the notes are the ones I actually go back to.`,
  (course: Course) =>
    `Dense but fair. Do the ${firstModule(course).toLowerCase()} exercises properly before moving on or the later modules will hurt.`,
] as const;

const whenPool = [
  "2 weeks ago",
  "1 month ago",
  "2 months ago",
  "3 months ago",
  "5 months ago",
] as const;

/** Character-sum hash. Not uniform, but stable across runtimes, which is what matters here. */
function seedOf(text: string): number {
  return text.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0);
}

/** Deterministic pick from a non-empty list; the index wraps around. */
function cycle<T>(items: readonly [T, ...T[]], index: number): T {
  return items[Math.abs(index) % items.length] ?? items[0];
}

export function reviewsFor(course: Course): Review[] {
  const seed = seedOf(course.id);

  return [0, 1, 2].map((position) => {
    const reviewer = cycle(reviewers, seed + position * 3);

    return {
      id: `${course.id}-r${position}`,
      name: reviewer.name,
      role: reviewer.role,
      // One four-star review on anything below 4.7, so a wall of fives never contradicts a
      // mid rating on the same page.
      rating: position === 2 && course.rating < 4.7 ? 4 : 5,
      when: cycle(whenPool, seed + position * 2),
      body: cycle(reviewBodies, seed + position * 2)(course),
    };
  });
}
