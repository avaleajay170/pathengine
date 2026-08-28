import { describe, expect, it } from "vitest";

import {
  hasCompleted,
  readiness,
  skillGaps,
  weeksAtCurrentPace,
  widestGap,
} from "@/domain/learner";
import { makeLearner, makeSkill } from "@/test/factories";

const profile = makeLearner({
  skills: [
    makeSkill("Python", 70, 80),
    makeSkill("Statistics", 45, 85),
    makeSkill("Deep Learning", 12, 80),
    makeSkill("MLOps", 70, 70),
    makeSkill("SQL", 90, 70),
  ],
});

describe("skillGaps", () => {
  it("orders skills by how far the learner is from the benchmark", () => {
    expect(skillGaps(profile).map((gap) => gap.skill)).toEqual([
      "Deep Learning",
      "Statistics",
      "Python",
      "MLOps",
      "SQL",
    ]);
  });

  it("clamps the gap at zero, because beating a benchmark is not a negative gap", () => {
    const sql = skillGaps(profile).find((gap) => gap.skill === "SQL");

    expect(sql?.gap).toBe(0);
    expect(sql?.attainment).toBe(100);
  });

  it("reports attainment as the share of the target already reached", () => {
    const statistics = skillGaps(profile).find((gap) => gap.skill === "Statistics");

    expect(statistics?.gap).toBe(40);
    expect(statistics?.attainment).toBe(53);
  });

  it("treats a zero target as already met instead of dividing by zero", () => {
    const [gap] = skillGaps(makeLearner({ skills: [makeSkill("Git", 0, 0)] }));

    expect(gap?.gap).toBe(0);
    expect(gap?.attainment).toBe(100);
  });
});

describe("widestGap", () => {
  it("is the skill that decides the goal date", () => {
    expect(widestGap(profile)?.skill).toBe("Deep Learning");
  });

  it("is undefined when nothing is tracked, so callers cannot render an empty gap", () => {
    expect(widestGap(makeLearner({ skills: [] }))).toBeUndefined();
  });
});

describe("readiness", () => {
  it("averages attainment across every tracked skill", () => {
    expect(readiness(profile)).toBe(71);
  });

  it("is zero when no skills are tracked", () => {
    expect(readiness(makeLearner({ skills: [] }))).toBe(0);
  });
});

describe("hasCompleted", () => {
  it("credits a course the learner has finished", () => {
    const learner = makeLearner({ completedCourses: ["sql-analytics", "python-basics"] });

    expect(hasCompleted(learner, "python-basics")).toBe(true);
    expect(hasCompleted(learner, "deep-learning")).toBe(false);
  });
});

describe("weeksAtCurrentPace", () => {
  it("rounds up, because a part week is still a week of study", () => {
    const learner = makeLearner({ hoursPerWeek: 8 });

    expect(weeksAtCurrentPace(learner, 16)).toBe(2);
    expect(weeksAtCurrentPace(learner, 17)).toBe(3);
  });

  it("returns zero rather than Infinity when no hours are available", () => {
    expect(weeksAtCurrentPace(makeLearner({ hoursPerWeek: 0 }), 20)).toBe(0);
  });
});
