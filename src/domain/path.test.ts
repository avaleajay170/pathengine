import { describe, expect, it } from "vitest";

import {
  durationHours,
  locateCourse,
  milestoneProgress,
  nextNodes,
  nodeCompletion,
  pathHours,
  pathNodes,
  pathProgress,
  pathSummary,
  remainingHours,
} from "@/domain/path";
import { makeMilestone, makeNode, makePath } from "@/test/factories";

describe("pathNodes", () => {
  it("flattens milestones into study order", () => {
    const path = makePath({
      milestones: [
        makeMilestone("one", [makeNode({ id: "a" }), makeNode({ id: "b" })]),
        makeMilestone("two", [makeNode({ id: "c" })]),
      ],
    });

    expect(pathNodes(path).map((node) => node.id)).toEqual(["a", "b", "c"]);
  });
});

describe("pathProgress", () => {
  it("derives completion from node status rather than a stored field", () => {
    const path = makePath({
      milestones: [
        makeMilestone("one", [
          makeNode({ id: "a", status: "completed" }),
          makeNode({ id: "b", status: "in-progress" }),
        ]),
        makeMilestone("two", [
          makeNode({ id: "c", status: "locked" }),
          makeNode({ id: "d", status: "locked" }),
        ]),
      ],
    });

    expect(pathProgress(path)).toEqual({ completed: 1, total: 4, percent: 25 });
  });

  it("rounds the percentage so it can go straight into a progress bar", () => {
    const path = makePath({
      milestones: [
        makeMilestone("one", [
          makeNode({ id: "a", status: "completed" }),
          makeNode({ id: "b", status: "available" }),
          makeNode({ id: "c", status: "available" }),
        ]),
      ],
    });

    expect(pathProgress(path).percent).toBe(33);
  });

  it("reports zero rather than dividing by zero for an empty path", () => {
    expect(pathProgress(makePath({ milestones: [] }))).toEqual({
      completed: 0,
      total: 0,
      percent: 0,
    });
  });
});

describe("milestoneProgress", () => {
  it("scopes progress to one stage", () => {
    const milestone = makeMilestone("core", [
      makeNode({ id: "a", status: "completed" }),
      makeNode({ id: "b", status: "completed" }),
      makeNode({ id: "c", status: "available" }),
      makeNode({ id: "d", status: "locked" }),
    ]);

    expect(milestoneProgress(milestone)).toEqual({ completed: 2, total: 4, percent: 50 });
  });
});

describe("pathSummary", () => {
  it("counts nodes by kind", () => {
    const path = makePath({
      milestones: [
        makeMilestone("one", [
          makeNode({ id: "a", kind: "course" }),
          makeNode({ id: "b", kind: "course" }),
          makeNode({ id: "c", kind: "assessment" }),
        ]),
        makeMilestone("two", [makeNode({ id: "d", kind: "project" })]),
      ],
    });

    const summary = pathSummary(path);

    expect(summary.courses).toBe(2);
    expect(summary.projects).toBe(1);
    expect(summary.assessments).toBe(1);
    expect(summary.progress.total).toBe(4);
  });
});

describe("nodeCompletion", () => {
  it("treats a completed node as finished even when it carries a stale percentage", () => {
    expect(nodeCompletion(makeNode({ status: "completed", completion: 62 }))).toBe(100);
  });

  it("reports the stored percentage while a node is in progress", () => {
    expect(nodeCompletion(makeNode({ status: "in-progress", completion: 62 }))).toBe(62);
  });

  it("falls back to zero when an in-progress node reports nothing", () => {
    expect(nodeCompletion(makeNode({ status: "in-progress" }))).toBe(0);
  });

  it("ignores a percentage on a node that has not started", () => {
    expect(nodeCompletion(makeNode({ status: "available", completion: 40 }))).toBe(0);
    expect(nodeCompletion(makeNode({ status: "locked", completion: 40 }))).toBe(0);
  });
});

describe("durationHours", () => {
  it("reads hours", () => {
    expect(durationHours("22 hrs")).toBe(22);
    expect(durationHours("1 hr")).toBe(1);
    expect(durationHours("1.5 hours")).toBe(1.5);
  });

  it("converts minutes instead of taking the leading number", () => {
    // The bug this replaced: parseInt("45 min") is 45, which added 45 hours of study to
    // every plan containing a 45-minute checkpoint.
    expect(durationHours("45 min")).toBe(0.75);
    expect(durationHours("30 minutes")).toBe(0.5);
  });

  it("contributes nothing for a duration it cannot parse", () => {
    expect(durationHours("a couple of evenings")).toBe(0);
    expect(durationHours("")).toBe(0);
    expect(durationHours("10 weeks")).toBe(0);
  });
});

describe("remainingHours and pathHours", () => {
  const path = makePath({
    milestones: [
      makeMilestone("one", [
        makeNode({ id: "a", status: "completed", duration: "10 hrs" }),
        makeNode({ id: "b", status: "in-progress", duration: "45 min" }),
      ]),
      makeMilestone("two", [makeNode({ id: "c", status: "locked", duration: "2 hrs" })]),
    ],
  });

  it("excludes finished work from what is left", () => {
    expect(remainingHours(path)).toBe(3);
  });

  it("counts the whole path regardless of status", () => {
    expect(pathHours(path)).toBe(13);
  });
});

describe("nextNodes", () => {
  const path = makePath({
    milestones: [
      makeMilestone("one", [
        makeNode({ id: "done", status: "completed" }),
        makeNode({ id: "open", status: "available" }),
      ]),
      makeMilestone("two", [
        makeNode({ id: "started", status: "in-progress" }),
        makeNode({ id: "gated", status: "locked" }),
      ]),
    ],
  });

  it("puts work already started ahead of work merely unlocked", () => {
    expect(nextNodes(path).map((node) => node.id)).toEqual(["started", "open"]);
  });

  it("never recommends a node the learner cannot open", () => {
    expect(nextNodes(path).map((node) => node.id)).not.toContain("gated");
    expect(nextNodes(path).map((node) => node.id)).not.toContain("done");
  });

  it("honours the limit", () => {
    expect(nextNodes(path, 1).map((node) => node.id)).toEqual(["started"]);
  });
});

describe("locateCourse", () => {
  const path = makePath({
    milestones: [makeMilestone("core", [makeNode({ id: "n5", courseId: "ml-foundations" })])],
  });

  it("returns the path, milestone and node a course sits in", () => {
    const placement = locateCourse(
      [makePath({ id: "other", milestones: [] }), path],
      "ml-foundations",
    );

    expect(placement?.path.id).toBe("test-path");
    expect(placement?.milestone.id).toBe("core");
    expect(placement?.node.id).toBe("n5");
  });

  it("returns undefined for a course that is in no path", () => {
    expect(locateCourse([path], "not-in-any-path")).toBeUndefined();
  });
});
