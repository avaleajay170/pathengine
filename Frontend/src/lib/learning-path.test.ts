import { describe, expect, it } from "vitest";
import { emptyLearnerProfile } from "@/lib/learner-profile";
import { generateLearningPath } from "@/lib/learning-path";

describe("generateLearningPath", () => {
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
});
