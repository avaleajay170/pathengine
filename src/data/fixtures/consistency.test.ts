/**
 * Invariants over the authored fixture data.
 *
 * The domain tests use hand-built objects so they stay stable when copy changes. This file is
 * the opposite: it asserts nothing about wording and everything about the data holding
 * together, because the fixtures are large enough that a mistyped course id would otherwise
 * surface as a blank card in the UI rather than a failure. It runs through the accessors in
 * `@/data/*` rather than importing the fixtures directly, so it covers the seam too.
 */

import { describe, expect, it } from "vitest";

import {
  getCoursePlacement,
  getDefaultPath,
  getPathOrDefault,
  getPrerequisites,
  getRelatedCourses,
  listCategories,
  listCourses,
  listPaths,
} from "@/data/catalog";
import { getLearner, getRecentActivity, getSkillTrend } from "@/data/learner";
import { durationHours, nextNodes, pathNodes } from "@/domain/path";

describe("course catalogue", () => {
  it("has unique ids", async () => {
    const courses = await listCourses();

    expect(new Set(courses.map((course) => course.id)).size).toBe(courses.length);
  });

  it("only uses categories the filter bar offers", async () => {
    const [categories, courses] = await Promise.all([listCategories(), listCourses()]);
    const known = new Set(categories);

    expect(courses.filter((course) => !known.has(course.category))).toEqual([]);
  });

  it("keeps ratings and hours in a renderable range", async () => {
    for (const course of await listCourses()) {
      expect(course.rating).toBeGreaterThanOrEqual(1);
      expect(course.rating).toBeLessThanOrEqual(5);
      expect(course.hours).toBeGreaterThan(0);
      expect(course.thumbHue).toBeGreaterThanOrEqual(0);
      expect(course.thumbHue).toBeLessThanOrEqual(360);
    }
  });

  it("never relates a course to itself", async () => {
    const courses = await listCourses();

    for (const course of courses) {
      const related = await getRelatedCourses(course);
      expect(related.map((entry) => entry.id)).not.toContain(course.id);
    }
  });

  it("returns one prerequisite entry per authored label, resolved or not", async () => {
    for (const course of await listCourses()) {
      const prerequisites = await getPrerequisites(course);

      expect(prerequisites.map((entry) => entry.label)).toEqual(course.prerequisites);
    }
  });
});

describe("learning paths", () => {
  it("has unique path ids and unique node ids within each path", async () => {
    const paths = await listPaths();

    expect(new Set(paths.map((path) => path.id)).size).toBe(paths.length);

    for (const path of paths) {
      const ids = pathNodes(path).map((node) => node.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("points every course node at a course that exists", async () => {
    const [paths, courses] = await Promise.all([listPaths(), listCourses()]);
    const ids = new Set(courses.map((course) => course.id));

    const dangling = paths
      .flatMap((path) => pathNodes(path))
      .filter((node) => node.courseId !== undefined && !ids.has(node.courseId))
      .map((node) => `${node.id}: ${node.courseId ?? ""}`);

    expect(dangling).toEqual([]);
  });

  it("authors durations in a unit the planner can sum", async () => {
    // A duration like "3 weeks" parses to zero, which would quietly shrink every estimate
    // that includes the node instead of failing.
    const unparsed = (await listPaths())
      .flatMap((path) => pathNodes(path))
      .filter((node) => durationHours(node.duration) === 0)
      .map((node) => `${node.id}: ${node.duration}`);

    expect(unparsed).toEqual([]);
  });

  it("only stores a completion percentage on nodes that are in progress", async () => {
    const misplaced = (await listPaths())
      .flatMap((path) => pathNodes(path))
      .filter((node) => node.completion !== undefined && node.status !== "in-progress")
      .map((node) => node.id);

    expect(misplaced).toEqual([]);
  });

  it("gives every path something the learner can start", async () => {
    for (const path of await listPaths()) {
      expect(nextNodes(path).length).toBeGreaterThan(0);
    }
  });

  it("explains every node, because an unexplained recommendation is the product", async () => {
    const silent = (await listPaths())
      .flatMap((path) => pathNodes(path))
      .filter((node) => node.reason.trim() === "" || node.skills.length === 0)
      .map((node) => node.id);

    expect(silent).toEqual([]);
  });

  it("can place any course that a path references", async () => {
    const nodes = (await listPaths()).flatMap((path) => pathNodes(path));
    const referenced = nodes.flatMap((node) =>
      node.courseId === undefined ? [] : [node.courseId],
    );

    for (const courseId of referenced) {
      expect(await getCoursePlacement(courseId)).toBeDefined();
    }
  });

  it("falls back to the default path for an unknown id", async () => {
    const [fallback, fromUnknown] = await Promise.all([
      getDefaultPath(),
      getPathOrDefault("no-such-path"),
    ]);

    expect(fromUnknown.id).toBe(fallback.id);
  });
});

describe("learner profile", () => {
  it("credits only courses that exist", async () => {
    const [learner, courses] = await Promise.all([getLearner(), listCourses()]);
    const ids = new Set(courses.map((course) => course.id));

    expect(learner.completedCourses.filter((id) => !ids.has(id))).toEqual([]);
  });

  it("scores every tracked skill on the same 0–100 scale the charts assume", async () => {
    for (const skill of (await getLearner()).skills) {
      expect(skill.current).toBeGreaterThanOrEqual(0);
      expect(skill.current).toBeLessThanOrEqual(100);
      expect(skill.target).toBeGreaterThan(0);
      expect(skill.target).toBeLessThanOrEqual(100);
    }
  });

  it("has a skill trend the chart can bind all three series to", async () => {
    const trend = await getSkillTrend();

    expect(trend.length).toBeGreaterThan(1);
    for (const point of trend) {
      expect(point.month).not.toBe("");
      expect(Number.isFinite(point.Python)).toBe(true);
      expect(Number.isFinite(point.Statistics)).toBe(true);
      expect(Number.isFinite(point.ML)).toBe(true);
    }
  });

  it("ends the trend on the learner's current scores", async () => {
    // The fixture documents this as a guarantee. Without a test it drifts the first time
    // someone edits a skill score, and the dashboard then shows a chart that contradicts
    // the radar beside it.
    const [learner, trend] = await Promise.all([getLearner(), getSkillTrend()]);
    const latest = trend[trend.length - 1];
    const scoreFor = (skill: string) =>
      learner.skills.find((entry) => entry.skill === skill)?.current;

    expect(latest?.Python).toBe(scoreFor("Python"));
    expect(latest?.Statistics).toBe(scoreFor("Statistics"));
    expect(latest?.ML).toBe(scoreFor("Machine Learning"));
  });

  it("limits recent activity when asked", async () => {
    const all = await getRecentActivity();
    const two = await getRecentActivity(2);

    expect(all.length).toBeGreaterThan(2);
    expect(two).toHaveLength(2);
    expect(new Set(all.map((entry) => entry.id)).size).toBe(all.length);
  });
});
