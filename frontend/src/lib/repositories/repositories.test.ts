import { describe, expect, it } from "vitest";
import { courses } from "@/data/mock";
import { emptyLearnerProfile } from "@/lib/learner-profile";
import { fetchActivity, fetchSkillHistory } from "@/lib/repositories/activity";
import { fetchCourse, fetchCourses } from "@/lib/repositories/courses";
import { fetchPath } from "@/lib/repositories/paths";

describe("mock-backed repositories", () => {
  it("filters courses using the same fields as the catalogue", async () => {
    const result = await fetchCourses({ q: "python", limit: 20 });

    expect(result.total).toBeGreaterThan(0);
    expect(result.courses.every((course) =>
      `${course.title} ${course.provider} ${course.skills.join(" ")}`.toLowerCase().includes("python"),
    )).toBe(true);
  });

  it("returns course details and preserves missing-course behavior", async () => {
    expect((await fetchCourse(courses[0]!.id))?.id).toBe(courses[0]!.id);
    expect(await fetchCourse("missing-course")).toBeUndefined();
  });

  it("generates the learner-specific fallback path for a valid path id", async () => {
    const path = await fetchPath("ml-engineer", {
      ...emptyLearnerProfile,
      goal: "Become an ML engineer",
      selectedRole: "ml-engineer",
      targetRole: "Machine Learning Engineer",
    });

    expect(path?.id).toBe("ml-engineer");
    expect(path?.title).toContain("Machine Learning Engineer");
  });

  it("maps static activity and skill history into API response shapes", async () => {
    const activity = await fetchActivity();
    const history = await fetchSkillHistory();

    expect(activity.activities.length).toBeGreaterThan(0);
    expect(activity.activities[0]).toHaveProperty("description");
    expect(history.data[0]).toHaveProperty("month");
  });
});