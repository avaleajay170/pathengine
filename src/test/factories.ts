/**
 * Builders for domain objects used in tests.
 *
 * Domain tests build their own data instead of importing `@/data/fixtures`. A unit test that
 * asserts on authored copy fails whenever someone edits a course description, and a suite that
 * fails for reasons unrelated to behaviour is a suite people learn to ignore. The fixtures get
 * one test of their own — `src/data/fixtures/consistency.test.ts` — and everything else is
 * built here, minimal and explicit, so each test states exactly the shape it depends on.
 */

import type { Course } from "@/domain/course";
import type { LearnerProfile, SkillScore } from "@/domain/learner";
import type { LearningPath, Milestone, PathNodeItem } from "@/domain/path";

export function makeSkill(skill: string, current: number, target: number): SkillScore {
  return { skill, current, target };
}

export function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: "sql-analytics",
    title: "SQL for Data Analytics",
    provider: "Lumina Press",
    instructor: "R. Mehta",
    category: "Data Science",
    level: "Beginner",
    rating: 4.6,
    reviews: 1240,
    hours: 18,
    price: 49,
    blurb: "Joins, aggregation and window functions.",
    skills: ["SQL"],
    syllabus: [{ title: "Joins", items: ["Inner joins", "Outer joins"] }],
    prerequisites: [],
    thumbHue: 210,
    ...overrides,
  };
}

/**
 * `courseId`, `completion` and `requires` are omitted by default rather than set to undefined:
 * `exactOptionalPropertyTypes` treats a present-but-undefined optional as a different thing
 * from an absent one, and the node type means the absent version.
 */
export function makeNode(overrides: Partial<PathNodeItem> = {}): PathNodeItem {
  return {
    id: "n1",
    kind: "course",
    title: "A course",
    duration: "10 hrs",
    status: "available",
    skills: ["SQL"],
    description: "Description.",
    reason: "Reason.",
    ...overrides,
  };
}

export function makeMilestone(id: string, nodes: PathNodeItem[]): Milestone {
  return { id, title: id, summary: `${id} summary`, nodes };
}

export function makePath(overrides: Partial<LearningPath> = {}): LearningPath {
  return {
    id: "test-path",
    title: "Test path",
    goal: "Ship something.",
    level: "Intermediate",
    weeks: 12,
    eta: "01 Jan 2027",
    milestones: [makeMilestone("foundations", [makeNode()])],
    ...overrides,
  };
}

export function makeLearner(overrides: Partial<LearnerProfile> = {}): LearnerProfile {
  return {
    name: "Test Learner",
    goal: "Become a machine learning engineer in 6 months.",
    targetRole: "Machine Learning Engineer",
    timeframe: "6 months",
    hoursPerWeek: 8,
    streak: 5,
    hoursLearned: 96,
    skillsMastered: 3,
    completedCourses: ["sql-analytics"],
    skills: [makeSkill("Python", 70, 80), makeSkill("Statistics", 45, 85)],
    ...overrides,
  };
}
