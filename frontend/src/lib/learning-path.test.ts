import { describe, expect, it } from "vitest";
import { emptyLearnerProfile } from "@/lib/learner-profile";
import { generateLearningPath } from "@/lib/learning-path";
import type { PathNodeItem } from "@/data/mock";
import { completedHours } from "@/routes/dashboard";

describe("generateLearningPath", () => {
  it("treats onboarding slider values as numeric skill scores", () => {
    const path = generateLearningPath({
      ...emptyLearnerProfile,
      selectedRole: "ml-engineer",
      skillLevels: { Python: 2, Statistics: 1 },
    });

    expect(path.milestones.flatMap((milestone) => milestone.nodes).length).toBeGreaterThan(0);
    expect(path.progress).toBeGreaterThanOrEqual(0);
  });

  it("generates a role-specific roadmap", () => {
    const profile = {
      ...emptyLearnerProfile,
      selectedRole: "data-analyst" as const,
      targetRole: "Data Analyst",
      goal: "Become job-ready as an analyst",
    };
    const path = generateLearningPath(profile);
    expect(path.id).toBe("data-analyst");
    expect(
      path.milestones
        .flatMap((milestone) => milestone.nodes)
        .some((node) => node.title.includes("SQL")),
    ).toBe(true);
  });

  it("locks prerequisites and unlocks them after completion", () => {
    const base = {
      ...emptyLearnerProfile,
      selectedRole: "data-analyst" as const,
      targetRole: "Data Analyst",
    };
    const locked = generateLearningPath(base);
    const visualization = locked.milestones
      .flatMap((milestone) => milestone.nodes)
      .find((node) => node.courseId === "viz-storytelling");
    expect(visualization?.status).toBe("locked");

    const unlocked = generateLearningPath({ ...base, completedCourses: ["sql-analytics"] });
    const next = unlocked.milestones
      .flatMap((milestone) => milestone.nodes)
      .find((node) => node.courseId === "viz-storytelling");
    expect(next?.status).toBe("available");
  });

  it("derives progress from completed courses", () => {
    const profile = {
      ...emptyLearnerProfile,
      selectedRole: "full-stack" as const,
      targetRole: "Full-Stack Developer",
      completedCourses: ["html-css"],
    };
    const path = generateLearningPath(profile);
    expect(path.progress).toBeGreaterThan(0);
  });

  it("calculates learned hours from completed node durations", () => {
    const nodes = [
      {
        id: "a",
        kind: "course",
        title: "A",
        duration: "12 hrs",
        status: "completed",
        skills: [],
        description: "",
        reason: "",
      },
      {
        id: "b",
        kind: "project",
        title: "B",
        duration: "6 hrs",
        status: "available",
        skills: [],
        description: "",
        reason: "",
      },
    ] as PathNodeItem[];
    expect(completedHours(nodes)).toBe(12);
  });
});
